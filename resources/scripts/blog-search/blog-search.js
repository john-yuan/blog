var BlogSearch = (function () {
    var WORKER_READY = 'WORKER_READY';
    var SYNC_SETTINGS = 'SYNC_SETTINGS';
    var SYNC_SETTINGS_DONE = 'SYNC_SETTINGS_DONE';
    var SEARCH = 'SEARCH';
    var SEARCH_DONE = 'SEARCH_DONE';
    var noop = function () {};
    var worker = null;
    var searchId = 0;
    var searchCallbacks = {};

    var workerReadyPromiseHandle = {
        resolve: noop,
        reject: noop
    };

    var workerReadyPromise = new Promise(function (resolve, reject) {
        workerReadyPromiseHandle.resolve = resolve;
        workerReadyPromiseHandle.reject = reject;
    });

    function postMessage(message) {
        if (worker) {
            worker.postMessage(message);
        }
    }

    /**
     * @typedef {Object.<string, *>} BlogSearchOptions
     * @property {string} workerBaseUrl The base url of the worker script
     * @property {string} blogSearchIndexUrl The url of the blog list, should be absolute
     */

    /**
     * @param {BlogSearchOptions} options
     */
    function init(options) {
        var workerBaseUrl = options.workerBaseUrl;
        var blogSearchIndexUrl = options.blogSearchIndexUrl;

        if (typeof workerBaseUrl !== 'string') {
            workerBaseUrl = './';
        } else if (workerBaseUrl.charAt(workerBaseUrl.length - 1) !== '/') {
            workerBaseUrl += '/';
        }

        var workerUrl = workerBaseUrl + 'blog-search-worker.js';

        worker = new Worker(workerUrl);

        worker.addEventListener('message', function (event) {
            var data = event.data || {};
            var payload = data.payload;

            switch (data.action) {
                case WORKER_READY:
                    return onWorkerReady(blogSearchIndexUrl);
                case SYNC_SETTINGS_DONE:
                    return onSyncSettingsDone();
                case SEARCH_DONE:
                    return onSearchDone(payload);
            }
        }, false);
    }

    function onWorkerReady(blogSearchIndexUrl) {
        postMessage({
            action: SYNC_SETTINGS,
            payload: {
                blogSearchIndexUrl: blogSearchIndexUrl
            }
        });
    }

    function onSyncSettingsDone () {
        workerReadyPromiseHandle.resolve()
    }

    function onSearchDone(payload) {
        var callback = searchCallbacks[payload.searchId];
        if (callback) {
            callback(null, payload.results);
        }
    }

    function search(keyword) {
        return new Promise(function(resolve, reject) {
            if (typeof keyword !== 'string') {
                return reject(new Error('BlogSearch: keyword must be string'));
            }

            if (keyword.trim() === '') {
                return resolve([]);
            }

            if (!worker) {
                return reject(new Error('BlogSearch: not initialized'));
            }

            var sid = searchId;
            var timeoutId = null;

            searchId += 1

            workerReadyPromise.then(function() {
                postMessage({
                    action: SEARCH,
                    payload: {
                        searchId: sid,
                        keyword: keyword.trim()
                    }
                })
            });


            var callback = function(err, data) {
                if (searchCallbacks[sid]) {
                    delete searchCallbacks[sid];

                    if (timeoutId !== null) {
                        clearTimeout(timeoutId)
                        timeoutId = null
                    }

                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            };

            searchCallbacks[sid] = callback;

            timeoutId = setTimeout(function() {
                callback(new Error('BlogSearch: search timeout'));
            }, 10 * 1000);
        })
    }

    return { init: init, search: search }
})();
