'use strict';

const axios = require('axios'),
    qs = require('querystring');

function login(redisClient) {

    return new Promise((resolve, reject) => {

        axios.post(
            'https://api.twitter.com/oauth2/token',
            qs.stringify({
                'grant_type': 'client_credentials'
            }),
            {
                responseType: 'application/json',
                auth: {
                    username: 'VflIwo8wlnHqXVmb0DMVGdztR',
                    password: 'IoSBXujJUlwaFDRE6oKmOBFBnZBe8B0lPH219rl6BsXtl9m1gE'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }
        ).then((result) => {
            if (result.status === 200) {
                redisClient.set('Authorization', `${result.data.token_type} ${result.data.access_token}`);
                resolve();
            } else {
                reject('Unexpected error');
            }
        }).catch((err) => {
            reject('Error on login Twitter API.');
        });

    });
}

function getToken(redisClient) {
    return new Promise((resolve, reject) => {
        try {
            redisClient.get('Authorization', (err, data) => {
                if (err) {
                    reject(err);
                }

                resolve(data);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}

function checkAuthorizationAlreadyExists(redisClient) {
    return new Promise((resolve, reject) => {
        try {
            getToken(redisClient).then(data => {
                const response = (data && data !== null && data !== undefined);
                resolve(response);
            }).catch(err => {
                reject();
            });
        }
        catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    login,
    getToken,
    checkAuthorizationAlreadyExists,
}