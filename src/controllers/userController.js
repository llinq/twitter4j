'use strict';

const neo4jService = require('../services/neo4jService');

exports.get = (req, res) => {

    neo4jService.checkUserAlreadyExists(req.params.user, req.app.locals.driver).then(exists => {
        console.log(exists);
    });

    res.json();
}

exports.post = (req, res) => {
    const driver = req.app.locals.driver;

    Promise.all([
        neo4jService.createUser('lnq_bot', driver),
        neo4jService.createUser('haga2112', driver)
    ]).then(result => {

        neo4jService.createNode('lnq_bot', 'haga2112', driver).then(test => {
            console.log(test);
            res.json();
        });

    });

}