'use strict';

const neo4j = require('neo4j-driver').v1,
    redis = require('redis'),
    env = require('../config/environment');

class connectorFactory {

    static get neo4jDriver() {
        if (!this._neo4jDriver) {
            this.loadNeo4j();
        }

        return this._neo4jDriver;
    }

    static set neo4jDriver(driver) {
        this._neo4jDriver = driver;
    }

    static loadNeo4j() {
        this.neo4jDriver = neo4j.driver(env.neo4j.address, neo4j.auth.basic(env.neo4j.user, env.neo4j.password), {
            encrypted: false
        });
    }

    static get redisDriver() {
        if (!this._redisDriver) {
            this.loadRedis();
        }

        return this._redisDriver;
    }

    static set redisDriver(driver) {
        this._redisDriver = driver;
    }

    static loadRedis() {
        const rd = redis.createClient({
            host: env.redis.address
        });

        rd.on('connect', () => {
            console.log('redis connected');
        });

        this.redisDriver = rd;
    }

}

module.exports = connectorFactory;