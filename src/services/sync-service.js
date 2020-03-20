'use strict';

const axios = require('axios'),
    neo4jService = require('./neo4j-service'),
    connectorFactory = require('../database/connector-factory'),
    env = require('../config/environment'),
    qs = require('querystring');

function start(token, user) {
    getSynchronizedUsers().then(synchronizedUsersArray => {
        const alreadySynchronized = synchronizedUsersArray.filter(item => item === user);

        if (alreadySynchronized.length > 0) {
            connectorFactory._redisDriver.get('next-user', (err, data) => {
                const userData = JSON.parse(data);
                callAPI(userData.user, userData.cursor, token);
            });
        }
        else {
            callAPI(user, -1, token);
        }
    });
}

async function callAPI(user, cursor, token) {
    neo4jService.createUser(user).then(() => {
        const params = {
            screen_name: user,
            skip_status: true,
            include_user_entities: true,
            count: 200,
            cursor: cursor
        };

        axios.get(`${env.twitter.url.sync}?${qs.stringify(params)}`, {
            headers: {
                'Authorization': token
            }
        }).then((response) => {
            const usersOrdered = response.data.users.sort((a, b) => (a.followers_count > b.followers_count) ? 1 : ((b.followers_count > a.followers_count) ? -1 : 0));
            const users = usersOrdered.map((item) => item.screen_name);

            users.forEach(async userName => {
                await neo4jService.createUser(userName);
                await neo4jService.createNode(userName, user);
            });

            getUsersToSync().then(data => {
                if (data.length >= 100) {
                    throw 'Users arrived at 100';
                }
                
                data.push(...users);

                connectorFactory._redisDriver.set('users-to-sync', JSON.stringify(data));

                if (response.data.next_cursor > 0) {
                    connectorFactory._redisDriver.set('next-user', JSON.stringify({
                        user: user,
                        cursor: response.data.next_cursor
                    }));

                   start(token, user);
                }
                else {
                    getSynchronizedUsers().then(synchronizedUsersArray => {
                        synchronizedUsersArray.push(user);
                        connectorFactory._redisDriver.set('synchronized-users', JSON.stringify(synchronizedUsersArray));
                        nextUser(user, token);
                    });
                }
            });
        }).catch(err => {
            console.log('err');
            if (err.response.status === 401) {
                nextUser(user, token);
            }
            else {
                throw 'Rate limit';
            }
        });
    });
}

function nextUser(atualUser, token) {
    getUsersToSync().then(usersToSync => {
        const differentUsers = usersToSync.filter(item => item !== atualUser);
        connectorFactory._redisDriver.set('users-to-sync', JSON.stringify(differentUsers));

        if (differentUsers.length > 0) {
            let userToSync;

            try {
                userToSync = differentUsers[0];
            }
            catch {
            }

            connectorFactory._redisDriver.set('next-user', JSON.stringify({
                user: userToSync,
                cursor: -1
            }));

            start(token, userToSync);
        }
        else {
            console.log('finish?');
        }
    });
}

function getUsersToSync() {
    return new Promise((resolve, reject) => {
        connectorFactory._redisDriver.get('users-to-sync', (err, data) => {
            let response = [];

            try {
                response = JSON.parse(data) || [];
            }
            catch {
                console.log('error parsing array users-to-sync');
            }

            resolve(response);
        });
    });
}

function getSynchronizedUsers() {
    return new Promise((resolve, reject) => {
        connectorFactory._redisDriver.get('synchronized-users', (err, synchronizedUsers) => {
            let synchronizedUsersArray = [];

            try {
                synchronizedUsersArray = JSON.parse(synchronizedUsers) || [];
            }
            catch {
                console.log('error parsing array synchronized-users');
            }

            resolve(synchronizedUsersArray);
        });
    });
}

module.exports = {
    start
}