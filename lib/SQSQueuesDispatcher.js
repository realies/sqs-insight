var Q = require('q'),
    chalk = require('chalk'),
    SQSTools = require('./SQS');

function SQSQueuesDispatcher(dispatcher, config) {
    this.dispatcher = dispatcher;
}

SQSQueuesDispatcher.prototype.set = function (config) {
    this.config = config;
    this._init();
    return this;
};

SQSQueuesDispatcher.prototype.dispatch = function(appInit) {
    var deferred = Q.defer(),
        me = this;

    Q.allSettled(this.config.dynamicEndpoints.map(SQSTools.listQueues))
        .then(function (results) {
            results.forEach(function (result) {
                if (result.state === 'fulfilled') {
                    result.value.forEach(function (endpoint) {
                        if (me._hasEndpoint(endpoint.url)) {
                            return;
                        }
                        me.config.endpoints.push(endpoint);
                        if (!appInit) {
                            me.dispatcher.addConsumer(endpoint);
                        }
                    });
                } else {
                    console.log(chalk.yellow('Unable to load queues for '), result.endpoint);
                }
            });
        })
        .then(deferred.resolve);

    return deferred.promise;
};

SQSQueuesDispatcher.prototype._init = function() {
    if (!this.config || !this.config.dynamicEndpoints || this.config.dynamicEndpoints.length === 0) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        return;
    }
    this.interval = setInterval(this.dispatch.bind(this), 30 * 1000);
};

SQSQueuesDispatcher.prototype._hasEndpoint = function(url) {
    if (!this.config) {
        return false;
    }
    return this.config.endpoints.filter(function (endpoint) {
        return endpoint.url === url;
    }).length > 0;
}

module.exports = SQSQueuesDispatcher;
