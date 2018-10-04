var AWS = require('aws-sdk'),
    Q = require('Q');

function listQueues(sqsServer) {
    var deferred = Q.defer(),
        params = {
            region: sqsServer.region,
            accessKeyId: sqsServer.key,
            secretAccessKey: sqsServer.secretKey
        },
        sqs;
    if (sqsServer.url) {
        params.endpoint = sqsServer.url;
    }
    sqs = new AWS.SQS(params);

    sqs.listQueues({}, function (err, data) {
        if (err) {
            var error = new Error(err);
            error.endpoint = sqsServer.url || sqsServer.key;
            return deferred.reject(error);
        }
        return deferred.resolve((data.QueueUrls || []).map(function (queue) {
            return {
                url: queue,
                region: sqsServer.region,
                key: sqsServer.key,
                secretKey: sqsServer.secretKey,
                visibility: sqsServer.visibility
            }
        }));
    });

    return deferred.promise;
}

module.exports = {
    listQueues: listQueues
};