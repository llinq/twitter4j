const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    router = require('./src/routes/router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router(app);

app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.listen(port);

console.log(`API server started on: ${port}`);