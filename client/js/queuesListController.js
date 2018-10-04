module.exports = QueuesListController;

QueuesListController.$inject = ['queues', '$cookies'];

function hasQueue(queues, name) {
    return queues.filter(function (q) {
        return q.name === name;
    }).length > 0;
}

function loadQueues(queues, vm) {
    queues.getQueues().then(function (queues) {
        queues.forEach(function (q) {
            if (hasQueue(vm.queues, q)) {
                return;
            }
            if (!vm.active) {
                vm.active = q;
            }

            vm.queues.push({
                name: q,
                active: vm.active === q
            });
        });
    });
}

var queuesInterval;

function QueuesListController (queues, $cookies) {
    var vm = this;

    vm.active = $cookies.get('selectedQueue') || null;
    vm.queues = [];
    vm.select = select;

    loadQueues(queues, vm);
    queuesInterval = setInterval(loadQueues.bind(null, queues, vm), 20000);

    function select (queue) {
        $cookies.put('selectedQueue', queue);
    }
}
