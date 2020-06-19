const express = require('express');

const feedRoutes = require('./routes/feed.js');

app.use('/feed',feedRoutes);

const app = express();

app.listen(8080);