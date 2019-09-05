'use strict';

const neo4jService = require('../services/neo4j-service');

exports.get = (req, res) => {
    neo4jService.checkUserAlreadyExists(req.params.user).then(exists => {
        console.log(exists);
    });

    res.json();
}

exports.post = (req, res) => {
    Promise.all([
        neo4jService.createUser('lnq_bot'),
        neo4jService.createUser('haga2112')
    ]).then(result => {
        neo4jService.createNode('lnq_bot', 'haga2112').then(test => {
            console.log(test);
            res.json();
        });
    });

}