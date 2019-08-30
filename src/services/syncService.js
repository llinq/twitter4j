const axios = require('axios');

function start(redisClient, token, user) {

    getSynchronizedUsers(redisClient).then(synchronizedUsersArray => {
        const alreadySynchronized = synchronizedUsersArray.filter(item => item === user);

        if (alreadySynchronized.length > 0) {
            // TODO - next sync

            redisClient.get('next-user', (err, data) => {
                const userData = JSON.parse(data);

                callAPI(userData.user, userData.cursor, token, redisClient);

            });

        }
        else {

            callAPI(user, -1, token, redisClient);

        }


    });

}

function callAPI(user, cursor, token, redisClient) {
    axios.get(`https://api.twitter.com/1.1/followers/list.json?screen_name=${user}&skip_status=true&include_user_entities=true&count=200&cursor=${cursor}`, {
        headers: {
            'Authorization': token
        }
    }).then((response) => {

        var ursersOrdered = response.data.users.sort((a, b) => (a.followers_count > b.followers_count) ? 1 : ((b.followers_count > a.followers_count) ? -1 : 0));

        var users = ursersOrdered.map((item) => item.screen_name);

        getUsersToSync(redisClient).then(data => {

            data.push(...users);

            redisClient.set('users-to-sync', JSON.stringify(data));

            if (response.data.next_cursor > 0) {

                redisClient.set('next-user', JSON.stringify({
                    user: user,
                    cursor: response.data.next_cursor
                }));

                start(redisClient, token, user);
            }
            else {
                getSynchronizedUsers(redisClient).then(synchronizedUsersArray => {

                    synchronizedUsersArray.push(user);

                    redisClient.set('synchronized-users', JSON.stringify(synchronizedUsersArray));

                    nextUser(user, redisClient, token);
                });
            }
        });

    }).catch(err => {
        if (err.response.status === 401) {
            nextUser(user, redisClient, token);
        }
        else {
            throw 'Rate limit';
        }
    });
}

function nextUser(atualUser, redisClient, token) {
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

            start(redisClient, token, userToSync);
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