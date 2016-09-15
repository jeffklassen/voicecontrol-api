var wit = require('node-wit');
var fs = require('fs');
var ACCESS_TOKEN = "xxx";


function handleWit(path, contentType, callback) {
    console.log('Sending file: ' + path);
    var stream = fs.createReadStream(path);
    wit.captureSpeechIntent(ACCESS_TOKEN, stream, contentType, function (err, resp) {
        console.log("Response from Wit for audio stream: ");
        if (err) {
            console.log("Error: ", err);
        }
        var jsonRep = JSON.stringify(resp, null, " ");
        console.log(jsonRep);
        callback(resp);
    });
};



module.exports = handleWit;