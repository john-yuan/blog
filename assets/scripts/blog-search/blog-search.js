

var BlogSearch = (function () {
    var WORKER_READY = 'WORKER_READY';
    var SYNC_SETTINGS = 'SYNC_SETTINGS';

    /**
     * @typedef {Object.<string, *>} BlogSearchOptions
     * @property {string} workerBaseUrl The base url of the worker script
     * @property {string} blogSearchIndexUrl The url of the blog list
     */

    /**
     * @param {BlogSearchOptions} options
     */
    function BlogSearch(options) {
        var workerBaseUrl = options.workerBaseUrl;
        var blogSearchIndexUrl = options.blogSearchIndexUrl;

        if (typeof workerBaseUrl !== 'string') {
            workerBaseUrl = './';
        } else if (workerBaseUrl.charAt(workerBaseUrl.length - 1) !== '/') {
            workerBaseUrl += '/';
        }

        var workerUrl = workerBaseUrl + 'blog-search-worker.js';
        var worker = new Worker(workerUrl);

        worker.addEventListener('message', function (event) {
            var data = event.data || {};
            var payload = data.payload;

            switch (data.action) {
                case WORKER_READY:
                    return onWorkerReady();
            }
        }, false);

        function postMessage(message) {
            worker.postMessage(message);
        }

        function onWorkerReady() {
            postMessage({
                action: SYNC_SETTINGS,
                payload: {
                    blogSearchIndexUrl: blogSearchIndexUrl
                }
            });
        }
    }

    return BlogSearch;
})();
