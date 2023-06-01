const express = require('express');

var animalroute,farmroute,seafeedroute,feedroute,emissionroute,cbtroute,generalroute,middlewares;

/**
 * command-line argument handling
 */
if (process.argv.length < 3) {
    console.error('Expected arguments for the selected blockchain network!');
    process.exit(1);
}

if (process.argv[2] && process.argv[2] === '-ganache') {
    animalroute = require('./routers/ganache/carbon/animalrouter.js');
    farmroute = require('./routers/ganache/carbon/farmrouter.js');
    seafeedroute = require('./routers/ganache/carbon/seafeedrouter.js');
    feedroute = require('./routers/ganache/carbon/feedrouter.js');
    emissionroute = require('./routers/ganache/carbon/emissionrouter.js');
    cbtroute = require('./routers/ganache/carbon/cbtrouter.js');
    generalroute = require('./routers/ganache/general.js');
    middlewares = require('./routers/ganache/middlewares.js');
} else if (process.argv[2] && process.argv[2] === '-bestonchain') {
    animalroute = require('./routers/bestonchain/carbon/animalrouter.js');
    farmroute = require('./routers/bestonchain/carbon/farmrouter.js');
    feedroute = require('./routers/bestonchain/carbon/feedrouter.js');
    emissionroute = require('./routers/bestonchain/carbon/emissionrouter.js');
    cbtroute = require('./routers/bestonchain/carbon/cbtrouter.js');
    generalroute = require('./routers/bestonchain/general.js');
    middlewares = require('./routers/bestonchain/middlewares.js');
} else {
    console.log('Please select a blockchain network.');
    process.exit(1);
}

var app = express();
app.use(express.json());

app.use(middlewares.authorization);

app.use('/animal', animalroute);
app.use('/farm', farmroute);
app.use('/seafeed',seafeedroute);
app.use('/feed', feedroute);
app.use('/emission', emissionroute);
app.use('/cbt', cbtroute);
app.use('/general', generalroute);

app.listen(3000);