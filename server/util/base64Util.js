var fs = require('fs');

function encodeFromFile(path, callback) {
    fs.readFile(path, function (err, data) {
        var base64data = new Buffer(data, 'binary').toString('base64');

        callback(err, base64data);
    });
};

function decodeToString(data) {
    return new Buffer(data, 'base64').toString();;
}

function decodeToFile(path, data, callback) {
    var decodedContent = new Buffer(data, 'base64');

    //get encoded file and decode to disk
    fs.writeFile(path, decodedContent, function (err) {
        if (err) callback(err);

        callback(err);
    });
};

/*encodeFromFile('tmp/67ca20e719b5c68c0ebc22b5ca0d6946.raw', function (err, b64data) {
    decodeToFile('tmp/reencoded.raw', b64data, function (err) {});
});*/

module.exports.decodeToString = decodeToString;
module.exports.decodeToFile = decodeToFile;
module.exports.encodeFromFile = encodeFromFile;