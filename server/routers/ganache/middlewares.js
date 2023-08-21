const fs = require('fs');
const { timingSafeEqual } = require('crypto');

/**
 * Todo: change input validation to validator based
 */
module.exports = {
    // to authorize an existing user
    authorization: function(request, response, next) {
        if (request.path.includes('/signup')) return next();
            var username = request.get('user-name');
            var apikey = request.get('api-key'); // request needs to have the header "api-key"
            var userpath = '/home/yih/Documents/dev/beston-dapps/server/credentials/ganache/'+username+'.json';
            var bcacc, target;
    
            // first check if user exists
            if (username == null) {
                return response.json({"server_response":"Please register and enter your username!"});
            } else if (fs.existsSync(userpath)) {
                json = fs.readFileSync(userpath);
                const credential = JSON.parse(json);
                bcacc = credential.bcacc;
                target = credential.apikey;
            } else {
                response.json({"server_response":"Invalid username!"});
            }
    
            // then check if the apikey is correct
            if (apikey == null) {
                return response.json({"server_response":"Please enter your ApiKey!"});
            } else if (target.length != apikey.length) {
                return response.json({"server_response":"User not authorized!"});
            } else if (!timingSafeEqual(Buffer.from(target, "utf8"), Buffer.from(apikey, "utf8"))) {
                return response.json({"server_response":"User not authorized!"});
            } else {
                request.body.username = username;
                request.body.bcacc = bcacc; // apend user's blockchain account to the request body
                next();
            }
        }
}