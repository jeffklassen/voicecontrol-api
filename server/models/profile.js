var esclient = require('../client/esclient');
var oauthclient = require('../client/googleoauthclient');

var addProfileForUser = function (userId, profile) {
    esclient.addUserProfile({
        id: userId,
        profile: profile
    });
};


var getProfileByOAuth = function (access_token, callback) {
    // console.log('GETTING OAUTH PROFILE');
    oauthclient.getUserProfile(access_token,
        function (err, profile) {
            //console.log('GOT OAUTH PROFILE', profile);
            callback(err, profile);
        }
    );
}

var getProfile = function (userId, access_token, callback) {
    esclient.getUserProfile(userId, function (err, resp) {
        //console.log('user found in ES?', resp);
        if (!resp.found) {
            if (access_token) {
                getProfileByOAuth(access_token, function (err, profile) {
                    addProfileForUser(userId, profile);
                    callback(err, profile);
                });
            } else {
                callback(err);
            }
            //addProfile();
        } else {

            callback(err, resp._source.profile);
        }

    });
};

module.exports.getProfile = getProfile;