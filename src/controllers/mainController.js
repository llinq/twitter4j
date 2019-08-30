'use strict';

exports.get = function (req, res) {

     req.app.locals.client.get('teste', function (err, response) {

        res.json({
            data: response
        });
     });

    // Task.find({}, function (err, task) {
    //     if (err)
    //         res.send(err);
    //     res.json(task);
    // });
};

exports.post = function(req, res) {
    req.app.locals.client.set('teste', 'juãaao');
    res.json();
}
