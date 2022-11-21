const express = require('express');
const fs = require('fs'); 
const router = express.Router();
const validator = require('express-validator');
const generator = require('generate-password');

var providerURL = 'http://127.0.0.1:7545';
var web3 = utils.getWeb3(providerURL);

router.post('/',
    validator.check("username").exists().withMessage("Input should contain field 'username'."),

    (request, response) => {

        var paramerrors = validator.validationResult(request);
        if (!paramerrors.isEmpty()) {
            return response.status(400).json({"server_response": paramerrors.array()});
        } else {
            var username = request.body.username;
            var bcacc = request.body.bcacc;

            var userpath = '/home/yih/Documents/dev/beston-dapps/server/credentials/ganache/'+username+'.json';

            if (fs.existsSync(userpath)) {
                response.write(JSON.stringify({"server_response":"User already registered! Please contact system admin to retrieve apikey."}));
                response.end('\n');
            } else {
                // generate apikey
                var apikey = generator.generate({
                    length: 30,
                    numbers: true
                });
    
                var user = {'username':username, 'apikey':apikey, 'bcacc':bcacc};
                fs.writeFileSync(userpath,JSON.stringify(user));
    
                response.write(JSON.stringify({"apikey":apikey}));
                response.end('\n');
            }
        }
    })

router.get('/bcacc', (request, response) => {
    var acc = web3.eth.accounts.create();
    console.log(`bcacc: ${acc.address}, privateKey: ${acc.privateKey}`);
    response.json({'bcacc': acc.address, 'privateKey': acc.privateKey});
}) 

module.exports = router;