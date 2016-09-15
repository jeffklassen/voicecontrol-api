var path = require('path');

var options = {
    gClientId: 'xxx.apps.googleusercontent.com',
    gClientSecret: 'secret',
    gAuthBaseURL: 'https://www.googleapis.com',
    esHosts: [
        'es1:9200',
        'es2:9200',
        'es3:9200',
        'es4:9200',
        'es5:9200'
    ],
    uploadDir: './tmp',
    certStorageLocation: './server/util/',
    certFileNames: ['googleJWT1.cert', 'googleJWT2.cert']

};

module.exports = options;
