var request = require('request');
var options = require('../config/config');
var fs = require('fs');

var getAuthInfo = function (access_code, callback) {
    var form = {
        code: access_code,
        client_id: options.gClientId,
        client_secret: options.gClientSecret,
        grant_type: 'authorization_code'
    };
    //console.log(form);

    /*client.post('/oauth2/v3/token/', form, function (err, res, body) {
        callback(null, body);
    });*/
    request.post({
        url: options.gAuthBaseURL + '/oauth2/v3/token/',

        form: form

    }, function (err, resp, body) {
        callback(err, JSON.parse(body.toString()));
    });

};

var getUserProfile = function (access_token, callback) {

    request(options.gAuthBaseURL + '/plus/v1/people/me?access_token=' + access_token,
        function (err, resp, body) {
            callback(err, JSON.parse(body.toString()));
        });


};

var getUserId = function (decodedJWT) {
    console.log("Generated User Id: " + 'google_' + decodedJWT.sub);
    console.log("decodedJWT:", decodedJWT);
    return 'google_' + decodedJWT.sub;
};

var updateCerts = function (callback) {
    request(options.gAuthBaseURL + '/oauth2/v1/certs',
        function (err, resp, body) {
            certs = JSON.parse(body.toString());
            var i = 0;
            for (var k in certs) {
                if (certs.hasOwnProperty(k)) {
                    fs.writeFileSync(options.certStorageLocation + options.certFileNames[i], certs[k]);
                }
                i++;
            }
            callback();
        }
    );

}
module.exports.getUserProfile = getUserProfile;
module.exports.getAuthInfo = getAuthInfo;
module.exports.updateCerts = updateCerts;
module.exports.getUserId = getUserId;