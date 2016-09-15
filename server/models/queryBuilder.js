var moment = require('moment');
var util = require('util');

var grainType = {
    HOUR: 'hour',
    DAY: 'day'
};
var paths = {
    value: 'value',
    dateTimePaths: ['command.entities.datetime',
                    'command.entities.datetime.from'],
    contactPaths: ['command.entities.contact']

};

var QueryBuilder = function (speechCommand) {
    this.speechCommand = speechCommand;
};
QueryBuilder.prototype.getStartEndDates = function () {
    var startDateTimes = [];
    if (this.hasDateTime) {
        this.speechCommand.entities.datetime.forEach(function (dtEntity) {
            var startDate;
            var endDate;
            if (dtEntity.type === 'value') {
                var grain = dtEntity.grain;
                startDate = moment(dtEntity.value);
                endDate = moment(startDate).add(1, grain).subtract(1, 'second');
            } else if (dtEntity.type === 'interval') {
                startDate = moment(dtEntity.from.value);
                endDate = moment(dtEntity.to.value).subtract(1, 'second');
            }

            startDateTimes.push({
                startDate: startDate.format(),
                endDate: endDate.format()
            });

        });
    }
    return startDateTimes;
}

QueryBuilder.prototype.getContacts = function () {
    var contacts = [];
    if (this.hasContact) {
        this.speechCommand.entities.contact.forEach(function (cEntity) {
            contacts.push(cEntity.value);
        });
    }

    return contacts;
}

QueryBuilder.prototype.hasContact = function () {
    if (this.hasEntities() && this.speechCommand.entities.contact) {
        return true;
    } else {
        return false
    };
}

QueryBuilder.prototype.hasDateTime = function () {
    if (this.hasEntities() && this.speechCommand.entities.datetime) {
        return true;
    } else {
        return false
    };
}
QueryBuilder.prototype.hasEntities = function () {
    if (this.speechCommand.entities) {
        return true;
    } else {
        return false
    };

}
QueryBuilder.prototype.getQuery = function () {
    var query = {};
    query.bool = {};
    query.bool.should = [];
    if (this.hasDateTime()) {
        var startEndDates = this.getStartEndDates();
        paths.dateTimePaths.forEach(function (path) {
            startEndDates.forEach(function (startEndDate) {
                var range = {};
                range[path + '.' + paths.value] = {
                    gte: startEndDate.startDate,
                    lte: startEndDate.endDate
                };
                query.bool.should.push({
                    range: range
                });
            });

        });
    }
    if (this.hasContact()) {
        var contacts = this.getContacts();
        paths.contactPaths.forEach(function (path) {
            contacts.forEach(function (contact) {
                var match = {};
                match[path + '.' + paths.value] = contact;
                query.bool.should.push({
                    match: match
                });
            });

        });
    }
    console.log('QUERY', util.inspect(query, {
        showHidden: false,
        depth: null
    }));
    return query;
}
module.exports = QueryBuilder;