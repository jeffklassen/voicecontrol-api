var elasticsearch = require('elasticsearch');
var crypto = require('crypto');
var options = require('../config/config');
var ReminderStatus = require('../models/reminderStatus');

var index = 'voice';

function getId(witResponse) {
    return witResponse.originalPath + '_' + witResponse.userId;
}

function getClient() {
    // Connect the client to two nodes, requests will be
    // load-balanced between them using round-robin
    return client = elasticsearch.Client({
        hosts: options.esHosts
    });
};

var queryForReminders = function (query, callback) {
    var client = getClient();
    client.search({
            index: index,
            type: 'wit_response',
            body: {

                //_source: ['command.*', 'createdDateTime'],

                query: query
                    /*{
                        bool: {
                            should: [
                                {
                                    match: {
                                        'command.entities.datetime.grain': "hour"
                                    }
                                },
                                {
                                    match: {
                                        'command.entities.datetime.from.grain': "hour"
                                    }
                                },
                                {
                                    match: {
                                        'command.entities.datetime.to.grain': "hour"
                                    }
                                },
                                {
                                    match: {
                                        'command.entities.due_date.grain': "hour"
                                    }
                                },
                                {
                                    match: {
                                        'command.entities.due_date.from.grain': "hour"
                                    }
                                },
                                {
                                    match: {
                                        'command.entities.due_date.to.grain': "hour"
                                    }
                                },
                                        ]
                        }
                    }*/
                    ,
                filter: {

                    bool: {
                        must: [{
                                term: {
                                    'status': ReminderStatus.ACTIVE
                                }
                              },
                            {

                                term: {
                                    'command.intent': 'add_reminder'
                                }

                            }]
                    }
                }
            }


        },
        function (err, resp) {
            if (err) {
                console.warn("ERROR");
                console.warn(err);

            }
            //console.log("FAILURES", resp._shards.failures);
            //console.log("SUCCESSES", resp);
            callback(resp.hits.hits);
            client.close();
        });
};


var indexWitResponse = function (witResponse) {
    var client = getClient();
    var toindex = {
        index: index,
        type: 'wit_response',
        body: witResponse,
        id: getId(witResponse)
    };
    client.index(toindex,
        function (err, resp) {
            if (err) {
                console.warn("ERROR");
                console.warn(err);

            }
            console.log("RESPONSE", resp);
            client.close();
        });

};

var updateWitResponse = function (witResponse) {
    var client = getClient();
    client.update({
        index: index,
        type: 'wit_response',
        id: getId(witResponse),
        body: {
            // put the partial document under the `doc` key
            doc: {
                status: witResponse.status
            }

        }
    }, function (err, resp) {
        if (err) {
            console.warn("ERROR");
            console.warn(resp);

        }
        console.log("RESPONSE", resp);
        client.close();
    })
}

var getAllWitResponses = function (callback) {

    var witResponses = [];
    var client = getClient();
    client.search({
        index: index,
        type: 'wit_response',
        // Set to 30 seconds because we are calling right back
        scroll: '30s',
        q: '*:*'
    }, function getMoreUntilDone(error, response) {
        // collect the title from each response
        response.hits.hits.forEach(function (hit) {

            witResponses.push(hit._source);

        });

        if (response.hits.total !== witResponses.length) {
            // now we can call scroll over and over
            client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {
            client.close()


            if (callback && typeof callback === 'function') {
                callback(witResponses);
            }
        }
    });
};

//getAllStoredVoice();
module.exports.indexWitResponse = indexWitResponse;
module.exports.getAllWitResponses = getAllWitResponses;
module.exports.updateWitResponse = updateWitResponse;
module.exports.queryForReminders = queryForReminders;