const express = require('express');

var escrowroute, digitaltwinroute, generalroute, signup, middlewares;

/**
 * command-line argument handling
 */
if (process.argv.length < 3) {
    console.error('Expected arguments for the selected blockchain network!');
    process.exit(1);
}

if (process.argv[2] && process.argv[2] === '-ganache') {
    escrowroute = require('./routes/ganache/escrowrouter.js');
    digitaltwinroute = require('./routes/ganache/digitaltwinrouter.js');
    generalroute = require('./routes/ganache/general.js');
    signup = require('./routes/ganache/signup.js');
    middlewares = require('./routes/ganache/middlewares.js');
} else if (process.argv[2] && process.argv[2] === '-bestonchain') {
    escrowroute = require('./routes/bestonchain/escrowrouter.js');
    digitaltwinroute = require('./routes/bestonchain/digitaltwinrouter.js');
    generalroute = require('./routes/bestonchain/general.js');
    signup = require('./routes/bestonchain/signup.js');
    middlewares = require('./routes/bestonchain/middlewares.js');
} else {
    console.log('Please select a blockchain network.');
    process.exit(1);
}

var app = express();
app.use(express.json());

app.use(middlewares.authorization);

app.use('/signup', signup);
app.use('/digitaltwin', digitaltwinroute);
app.use('/escrow', escrowroute);
app.use('/general', generalroute);

app.listen(3000);
