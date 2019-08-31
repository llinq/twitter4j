'use strict';

const axios = require('axios'),
    neo4jService = require('../services/neo4jService');

function start(redisClient, token, user, driver) {
    getSynchronizedUsers(redisClient).then(synchronizedUsersArray => {
        const alreadySynchronized = synchronizedUsersArray.filter(item => item === user);

        if (alreadySynchronized.length > 0) {
            // TODO - next sync

            redisClient.get('next-user', (err, data) => {
                const userData = JSON.parse(data);

                callAPI(userData.user, userData.cursor, token, redisClient, driver);

            });

        }
        else {

            callAPI(user, -1, token, redisClient, driver);

        }


    });

}

async function callAPI(user, cursor, token, redisClient, driver) {

    neo4jService.createUser(user, driver).then(() => {

        axios.get(`https://api.twitter.com/1.1/followers/list.json?screen_name=${user}&skip_status=true&include_user_entities=true&count=200&cursor=${cursor}`, {
            headers: {
                'Authorization': token
            }
        }).then((response) => {

            var usersOrdered = response.data.users.sort((a, b) => (a.followers_count > b.followers_count) ? 1 : ((b.followers_count > a.followers_count) ? -1 : 0));

            var users = usersOrdered.map((item) => item.screen_name);

            users.forEach(async userName => {
                await neo4jService.createUser(userName, driver);
                await neo4jService.createNode(userName, user, driver);
            });

            getUsersToSync(redisClient).then(data => {

                data.push(...users);

                redisClient.set('users-to-sync', JSON.stringify(data));

                if (response.data.next_cursor > 0) {

                    redisClient.set('next-user', JSON.stringify({
                        user: user,
                        cursor: response.data.next_cursor
                    }));

                    start(redisClient, token, user, driver);
                }
                else {
                    getSynchronizedUsers(redisClient).then(synchronizedUsersArray => {

                        synchronizedUsersArray.push(user);

                        redisClient.set('synchronized-users', JSON.stringify(synchronizedUsersArray));

                        nextUser(user, redisClient, token, driver);
                    });
                }
            });

        }).catch(err => {
            console.log('err');
            if (err.response.status === 401) {
                nextUser(user, redisClient, token, driver);
            }
            else {
                throw 'Rate limit';
            }
        });
    });
}

function nextUser(atualUser, redisClient, token, driver) {
    getUsersToSync(redisClient).then(usersToSync => {

        var differentUsers = usersToSync.filter(item => item !== atualUser);

        redisClient.set('users-to-sync', JSON.stringify(differentUsers));

        if (differentUsers.length > 0) {
            let userToSync;

            try {
                userToSync = differentUsers[0];
            }
            catch {
            }

            redisClient.set('next-user', JSON.stringify({
                user: userToSync,
                cursor: -1
            }));

            start(redisClient, token, userToSync, driver);
        }
        else {
            console.log('acabou?');
        }

    });
}

function getUsersToSync(redisClient) {
    return new Promise((resolve, reject) => {
        redisClient.get('users-to-sync', (err, data) => {
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

function getSynchronizedUsers(redisClient) {
    return new Promise((resolve, reject) => {
        redisClient.get('synchronized-users', (err, synchronizedUsers) => {
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