var jwt = require('jsonwebtoken');
var fs = require('fs');
var oauthclient = require('../client/googleoauthclient');


var verify = function (encodedJWT, callback) {
    var cert1 = fs.readFileSync('./server/util/googleJWT1.cert');
    var cert2 = fs.readFileSync('./server/util/googleJWT2.cert');

    var decodedJWT;
    try {
        decodedJWT = jwt.verify(encodedJWT, cert1);
        callback(decodedJWT);
    } catch (err) {
        try {
            decodedJWT = jwt.verify(encodedJWT, cert2);
            callback(decodedJWT);
        } catch (err) {
            console.log("Could not find valid signature from cached certs, updating certs.");
            oauthclient.updateCerts(function () {
                verify(encodedJWT, callback);
            });
        }
    }
    //return decodedJWT;
};

module.exports.verify = verify;