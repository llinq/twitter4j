'use strict';

const loginService = require('../services/login-service'),
    syncService = require('../services/sync-service');

exports.get = (req, res) => {
    loginService.checkAuthorizationAlreadyExists().then(async authorize => {
        if (!authorize) {
            console.log('genereting token');
            await loginService.login();
        }

        loginService.getToken().then(token => {
            syncService.start(token, req.params.user);
        });
    });

    res.json();
};

exports.post = (req, res) => {
    // req.app.locals.client.set('synchronized-users', `["lnq_bot", "haga2112"]`);

    res.json();
}
