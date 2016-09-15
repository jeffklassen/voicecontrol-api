var express = require('express');
var router = express.Router();
var multer = require('multer');
var esclient = require('../client/esclient');
var witclient = require('../client/witclient');
var base64Util = require('../util/base64Util');
var options = require('../config/config');
var User = require('../models/user');
var ReminderStatus = require('../models/reminderStatus');
var Rememberance = require('../models/rememberance');

router.use(multer({
    dest: options.uploadDir
}));

router.use(function (req, res, next) {
    console.log(req.body);
    User.fetchRefByToken(req.body.idToken, req.body.idPrefix, function (err, userid) {

        req.userId = userid;
        next();
    });
});

router.post('/sendFile', function (req, res, next) {
    //console.log(req.body) // form fields
    //console.log(req.files) // form files
    var path = req.files.file.path;
    var contentType = req.body.witHeaders;

    witclient(path, contentType, function (jsonResponse) {
        var witPackage = {
                jsonResponse: jsonResponse,
                contentType: contentType,
                filePath: path
            }
            //console.log("SEND FILE WIT PACKAGE", witPackage);

        var rememberance = new Rememberance(witPackage);


        rememberance.getResponse(function (response) {
            console.log('RESPONSE', response);
            res.send(response);
        });

        rememberance.save(req.userId, ReminderStatus.PENDING);
    });

});

router.post('/setReminderStatus', function (req, res, next) {
    //console.log(req.body) // form fields
    var path = req.body.id;

    console.log("USERID:", req.userId);

    var reminderStatusValid = false;
    var reminderStatus;
    if (req.body.confirm === ReminderStatus.ACTIVE) {
        reminderStatus = ReminderStatus.ACTIVE;
        reminderStatusValid = true;
    } else if (req.body.confirm === ReminderStatus.ARCHIVE) {
        reminderStatus = ReminderStatus.ARCHIVE;
        reminderStatusValid = true;
    } else if (req.body.confirm === ReminderStatus.DISCARD) {
        reminderStatus = ReminderStatus.DISCARD;
        reminderStatusValid = true;
    }

    if (reminderStatusValid === true) {
        var witPackage = {
                filePath: path
            }
            //console.log("CONFIRM FILE WIT PACKAGE", witPackage);
        var rememberance = new Rememberance(witPackage);
        //console.log("RESPONSE TO ANDROID (confirm)", rememberance.getResponse());
        rememberance.getResponse(function (response) {
            res.send(response);
        });
        rememberance.save(req.userId, reminderStatus);
    } else {
        res.status(405).end();
    }


});



/*
router.get('/reparseAll', function (req, res, next) {
    esclient.getAllWitResponses(function (responses) {
        //foreach wit response
        responses.forEach(function (response) {
            base64Util.decodeToFile(response.originalPath, response.attachment.content, function (err) {
                witclient(response.originalPath, response.attachment.content_type, function (jsonResponse) {
                    witResponse(jsonResponse, response.originalPath, response.attachment.content_type, esclient.indexWitResponse);

                });
            });
        });
        res.send({
            text: 'Complete'
        });
    });
});*/




module.exports = router;