'use strict';

function createNode(user1, user2, driver) {

    return new Promise((resolve, reject) => {

        try {
            const session = driver.session();

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
                        console.log('chegou aqui');
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

function createUser(username, driver) {

    return new Promise((resolve, reject) => {

        checkUserAlreadyExists(username, driver).then(exists => {

            if (exists) {
                resolve()
            }
            else {
                const session = driver.session();

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

function checkUserAlreadyExists(username, driver) {

    return new Promise((resolve, reject) => {

        try {
            const session = driver.session();

            const resultPromise = session.run(
                'MATCH (u:User {username: $username}) RETURN u',
                { username: username }
            );

            resultPromise.then(result => {
                session.close();

                resolve(result.records.length > 0);

                // on application exit:
                // driver.close();
            });

        }
        catch (err) {
            reject(err);
        }
    })

}

module.exports = {
    createNode,
    createUser,
    checkUserAlreadyExists
}