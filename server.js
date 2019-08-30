const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    redis = require('redis');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./src/routes/main');

routes(app);

app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.locals.client = redis.createClient({
    host: '192.168.99.100'
});

app.locals.client.on('connect', () => {
    console.log('redis connected');
});

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);