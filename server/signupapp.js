const express = require('express');

var signup;

/**
 * command-line argument handling
 */
if (process.argv.length < 3) {
    console.error('Expected arguments for the selected blockchain network!');
    process.exit(1);
}

if (process.argv[2] && process.argv[2] === '-ganache') {
    signup = require('./routers/ganache/signuprouter.js');
} else if (process.argv[2] && process.argv[2] === '-bestonchain') {
    signup = require('./routers/bestonchain/signuprouter.js');
} else {
    console.log('Please select a blockchain network.');
    process.exit(1);
}

var app = express();
app.use(express.json());
app.use('/signup', signup);

app.listen(3000);