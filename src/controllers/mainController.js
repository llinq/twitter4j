'use strict';

const loginService = require('../services/loginService'),
    syncService = require('../services/syncService');

exports.get = (req, res) => {
    const redisClient = req.app.locals.client;

    loginService.checkAuthorizationAlreadyExists(redisClient).then(async authorize => {
        if (!authorize) {
            console.log('genereting token');
            await loginService.login(redisClient);
        }

        loginService.getToken(redisClient).then(token => {
            syncService.start(redisClient, token, req.params.user);
        });
    });


    res.json();

    // Task.find({}, function (err, task) {
    //     if (err)
    //         res.send(err);
    //     res.json(task);
    // });
};

exports.post = (req, res) => {
    // req.app.locals.client.set('synchronized-users', `["lnq_bot", "haga2112"]`);

    const driver = req.app.locals.neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '123mudar'));

    const session = driver.session();

    const user = 'haga1221';

    const resultPromise = session.run(
        'CREATE (u:User {username: $user}) RETURN u',
        { user: user }
    );

    resultPromise.then(result => {
        session.close();

        const singleRecord = result.records[0];
        const node = singleRecord.get(0);

        console.log(node.properties.username);

        // on application exit:
        driver.close();
    });

    res.json();
}
