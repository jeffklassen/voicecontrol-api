var esclient = require('../client/esclient');
var base64Util = require('../util/base64Util');
var QueryBuilder = require('./queryBuilder');
var util = require('util');

var rememberanceIntents = {
    ADDREMINDER: 'add_reminder',
    LISTREMINDER: 'list_reminders',
    TOSSOUT: 'toss_out',
    SAVED: 'saved',
    NOTIMPLEMENTED: 'not_implemented'
};



var sortReminders = function (hits) {


    var getSortObject = function (obj) {
        var priority;
        var d;
        var dateContainingObject;

        if (obj.command.entities.datetime) {
            dateContainingObject = obj.command.entities.datetime[0];
        }

        if (dateContainingObject) {
            if (dateContainingObject.value) {
                d = dateContainingObject.value;
                priority = 1;
            } else if (dateContainingObject.from.value) {
                d = dateContainingObject.from.value;
                priority = 1
            }

        } else {
            priority = 2;
            d = obj.createdDateTime;
        }
        return {
            priority: priority,
            date: new Date(d)
        };
    };

    return hits.sort(function (a, b) {
        var aSO = getSortObject(a._source);
        var bSO = getSortObject(b._source);

        if (aSO.priority > bSO.priority) {
            return 1;

        } else if (aSO.priority < bSO.priority) {
            return 0;
        } else {
            if (aSO.date > bSO.date) {
                return 1;
            } else if (aSO.date < bSO.date) {
                return -1;
            } else {
                return 0;
            }
        }

    });

}

var Rememberance = function (witPackage) {
    this.filePath = witPackage.filePath;

    // if a jsonResponse is provided, go ahead and get the best outcome
    if (witPackage.jsonResponse) {
        this.jsonResponse = witPackage.jsonResponse;
        this.contentType = witPackage.contentType;
        this.bestOutcome = this.getMostConfidentOutcome();

    }
};

Rememberance.prototype.getMostConfidentOutcome = function () {
    var highestConfidence = 0;
    var bestOutcome;
    this.jsonResponse.outcomes.forEach(function (outcome) {
        if (outcome.confidence > highestConfidence) {
            bestOutcome = outcome;
            highestConfidence = outcome.confidence;
        }
    });

    return bestOutcome;
};

Rememberance.prototype.getResponse = function (callback) {
    var response = {};
    response.data = {};
    response.id = this.filePath;
    if (this.bestOutcome) {
        if (this.bestOutcome.intent === rememberanceIntents.ADDREMINDER) {
            response.data.intent = rememberanceIntents.ADDREMINDER;
            response.data.text = this.bestOutcome._text;
            if (this.bestOutcome.entities) {
                response.data.entities = this.bestOutcome.entities;
            }
            callback(response);
        } else if (this.bestOutcome.intent === rememberanceIntents.TOSSOUT) {
            response.data.intent = rememberanceIntents.TOSSOUT;
            response.data.text = this.bestOutcome._text;

            callback(response);
        } else if (this.bestOutcome.intent === rememberanceIntents.LISTREMINDER) {
            response.data.intent = rememberanceIntents.LISTREMINDER;
            response.data.text = this.bestOutcome._text;
            /*  console.log('BESTOUTCOME', util.inspect(this.bestOutcome, {
      showHidden: false,
      depth: null
  }));*/
            this.getReminders(new QueryBuilder(this.bestOutcome), function (reminders) {
                response.data.reminders = reminders;
                callback(response);
            });
        } else {
            response.data.intent = rememberanceIntents.NOTIMPLEMENTED;
            response.data.text = this.bestOutcome._text;
            callback(response);
        }
    } else {
        response.data.intent = rememberanceIntents.SAVED;
        callback(response);
    }

}



Rememberance.prototype.getReminders = function (queryBuilder, callback) {
    /* console.log('QUERY', util.inspect(queryBuilder.getQuery(), {
         showHidden: false,
         depth: null
     }));*/
    esclient.queryForReminders(queryBuilder.getQuery(), function (hits) {
        ///console.log(hits);

        hits = sortReminders(hits)
        var reminders = [];
        console.log("hits length: " + hits.length)
        hits.forEach(function (hit) {
            //console.log(hit._score);
            //console.log(hit);
            reminders.push({
                text: hit._source.command._text,
                id: hit._source.originalPath
            });

            console.log({
                text: hit._source.command._text,
                id: hit._source.originalPath
            });
        });

        callback(reminders);
    });
}

Rememberance.prototype.save = function (userId, status) {
    var filePath = this.filePath;
    if (this.jsonResponse) {
        var bestOutcome = this.bestOutcome;
        var jsonResponse = this.jsonResponse;
        var contentType = this.contentType;;

        base64Util.encodeFromFile(filePath, function (err, base64data) {
            //console.log('ADDING response: ' + filePath + '_' + userId);
            esclient.indexWitResponse({
                originalPath: filePath,
                command: bestOutcome,
                status: status,
                createdDateTime: new Date(),
                userId: userId,
                attachment: {
                    content_type: contentType,
                    content: base64data
                }
            });
        });
    } else {
        //console.log('UPDATING response: ' + filePath + '_' + userId);
        esclient.updateWitResponse({
            originalPath: filePath,
            status: status,
            userId: userId
        })
    }
};
/*var rememberance = new Rememberance({
    filePath: 'blank'
});
rememberance.getReminders(new QueryBuilder({
    _text: 'what am I supposed to do tomorrow',
    intent: 'list_reminders',
    entities: {
        datetime: [{
            "to": {
                "value": "2015-03-04T00:00:00.000+01:00",
                "grain": "hour"
            },
            "from": {
                "value": "2015-03-03T18:00:00.000+01:00",
                "grain": "hour"
            },
            "type": "interval"
        }]
    },
    confidence: 1
}), function () {});*/
module.exports = Rememberance;