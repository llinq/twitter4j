'use strict';

module.exports = (app) => {
    const testeController = require('../controllers/mainController');

    // todoList Routes
    app.route('/teste/:user')
        .get(testeController.get);

    app.route('/teste')
        .post(testeController.post);

    // app.route('/tasks/:taskId')
    //     .get(todoList.read_a_task)
    //     .put(todoList.update_a_task)
    //     .delete(todoList.delete_a_task);
};