'use strict';

const loginService = require('../services/loginService'),
    syncService = require('../services/syncService');

exports.get = (req, res) => {
    const redisClient = req.app.locals.client;
    const driver = req.app.locals.driver;

    loginService.checkAuthorizationAlreadyExists(redisClient).then(async authorize => {
        if (!authorize) {
            console.log('genereting token');
            await loginService.login(redisClient);
        }

        loginService.getToken(redisClient).then(token => {
            syncService.start(redisClient, token, req.params.user, driver);
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

    res.json();
}
