'use strict';

const connectorFactory = require('../database/connector-factory');

function createNode(user1, user2) {

    return new Promise((resolve, reject) => {

        try {
            const session = connectorFactory._neo4jDriver.session();

            const params = {
                user1: user1,
                user2: user2
            };

            const promise = session.run(
                `
                MATCH (user1:User {username: $user1})
                MATCH (user2:User {username: $user2})
                MATCH (user1)-[:follow]->(user2)
                RETURN *
                `, params
            );

            promise.then(result => {

                if (result.records.length > 0) {
                    resolve();
                } else {
                    const promise1 = session.run(
                        `
                        MATCH (user1:User {username: $user1})
                        MATCH (user2:User {username: $user2})
                        MERGE  (user1)-[:follow]->(user2)
                        `, params
                    );

                    promise1.then(result => {
                        session.close();
                        resolve();
                    });
                }

            });

        }
        catch (err) {
            reject(err);
        }

    });

}

function createUser(username) {

    return new Promise((resolve, reject) => {

        checkUserAlreadyExists(username).then(exists => {

            if (exists) {
                resolve()
            }
            else {
                const session = connectorFactory._neo4jDriver.session();

                const promise = session.run(
                    'CREATE (u:User {username: $username}) RETURN u',
                    { username: username }
                );

                promise.then(result => {
                    session.close();
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            }
        }).catch(err => {
            reject(err);
        });

    });

}

function checkUserAlreadyExists(username) {

    return new Promise((resolve, reject) => {

        try {
            const session = connectorFactory.neo4jDriver.session();

            const resultPromise = session.run(
                'MATCH (u:User {username: $username}) RETURN u',
                { username: username }
            );

            resultPromise.then(result => {
                session.close();

                resolve(result.records.length > 0);
            });

        }
        catch (err) {
            reject(err);
        }
    });

}

module.exports = {
    createNode,
    createUser,
    checkUserAlreadyExists
}