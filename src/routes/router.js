'use strict';

module.exports = (app) => {
    const syncController = require('../controllers/sync-controller'),
        userController = require('../controllers/user-controller');

    // todoList Routes
    app.route('/sync/:user')
        .get(syncController.get);

    app.route('/sync')
        .post(syncController.post);

    app.route('/user/:user')
        .get(userController.get)
        .post(userController.post);
};