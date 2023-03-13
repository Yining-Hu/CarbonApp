const express = require('express');

var mproute, digitaltwinroute, btkroute, middlewares, generalroute;

/**
 * command-line argument handling
 */
if (process.argv.length < 3) {
    console.error('Expected arguments for the selected blockchain network!');
    process.exit(1);
}

if (process.argv[2] && process.argv[2] === '-ganache') {
    mproute = require('./routers/ganache/marketplacerouter.js');
    digitaltwinroute = require('./routers/ganache/digitaltwinrouter.js');
    btkroute = require('./routers/ganache/btkrouter.js');
    middlewares = require('./routers/ganache/middlewares.js');
    generalroute = require('./routers/ganache/general.js');
} else if (process.argv[2] && process.argv[2] === '-bestonchain') {
    mproute = require('./routers/bestonchain/marketplacerouter.js');
    digitaltwinroute = require('./routers/bestonchain/digitaltwinrouter.js');
    btkroute = require('./routers/bestonchain/btkrouter.js');
    middlewares = require('./routers/bestonchain/middlewares.js');
    generalroute = require('./routers/bestonchain/general.js');
} else {
    console.log('Please select a blockchain network.');
    process.exit(1);
}

var app = express();
app.use(express.json());

app.use(middlewares.authorization);

app.use('/digitaltwin', digitaltwinroute);
app.use('/btk', btkroute);
app.use('/marketplace', mproute);
app.use('/general', generalroute);

app.listen(3000);
