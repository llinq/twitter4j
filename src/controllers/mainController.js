'use strict';

const loginService = require('../services/loginService');

exports.get = (req, res) => {
    const redisClient = req.app.locals.client;

    loginService.checkAuthorizationAlreadyExists(redisClient).then(async authorize => {
        if (!authorize) {
            console.log('genereting token');
            await loginService.login(redisClient);
        }

        loginService.getToken(redisClient).then(token => {
            
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
    req.app.locals.client.set('teste', 'juãaao');
    res.json();
}
