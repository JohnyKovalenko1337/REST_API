const express = require('express');

const app = express();
const feedRoutes = require('./routes/feed.js');

app.use('/feed',feedRoutes);



app.listen(8080);