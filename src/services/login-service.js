'use strict';

const axios = require('axios'),
    qs = require('querystring'),
    connectorFactory = require('../database/connector-factory'),
    env = require('../config/environment');

function login() {

    return new Promise((resolve, reject) => {

        axios.post(
            env.twitter.url.login,
            qs.stringify({ 'grant_type': 'client_credentials' }),
            {
                responseType: 'application/json',
                auth: {
                    username: env.twitter.api_key,
                    password: env.twitter.secret_key
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }
        ).then((result) => {
            if (result.status === 200) {
                connectorFactory.redisDriver.set('Authorization', `${result.data.token_type} ${result.data.access_token}`);
                resolve();
            } else {
                reject('Unexpected error');
            }
        }).catch((err) => {
            reject('Error on login Twitter API.');
        });

    });
}

function getToken() {
    return new Promise((resolve, reject) => {
        try {
            connectorFactory.redisDriver.get('Authorization', (err, data) => {
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

function checkAuthorizationAlreadyExists() {
    return new Promise((resolve, reject) => {
        try {
            getToken().then(data => {
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