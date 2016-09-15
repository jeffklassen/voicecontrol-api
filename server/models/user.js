var esclient = require('../client/esclient');
var oauthclient = require('../client/googleoauthclient');
var jwtUtil = require('../util/jwtUtil');
var profile = require('./profile');


var User = function () {};


User.fetchRefByToken = function (token, prefix, callback) {
    jwtUtil.verify(token, function (decodedJWT) {
        var jwt = JSON.parse(decodedJWT);

        callback(null, prefix + jwt.sub);
    });
};


module.exports = User;