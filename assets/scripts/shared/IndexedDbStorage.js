define([ 'shared/ResourceLoader' ], function (ResourceLoader) {
    'use strict';

    /**
     * @class
     * @param {Object.<string, *>} options
     * @param {string} options.name The name of the indexedDB to store the data
     */
    function IndexedDbStorage(options) {
        this.db = new ResourceLoader(function (resolve, reject) {
            var request = indexedDB.open(options.name);

            request.onerror = function (event) {
                reject(event);
            };

            request.onupgradeneeded = function () {
                event.target.result.createObjectStore('storage', {
                    keyPath: 'name'
                });
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    }

    /**
     * Get value by name
     *
     * @param {string} name
     * @param {(error: any, value: any) => void} [callback]
     */
    IndexedDbStorage.prototype.get = function (name, callback) {
        this.db.access(function (db) {
            var transaction = db.transaction([ 'storage' ]);
            var objectStore = transaction.objectStore('storage');
            var request = objectStore.get(name);

            request.onerror = function (event) {
                callback && callback(event || new Error('unkonw error'), null);
            };

            request.onsuccess = function (event) {
                var result = event.target.result || {};
                callback && callback(null, result.value);
            };
        }, function (error) {
            callback && callback(error || new Error('unkonw error'), null);
        });
    };

    /**
     * Set value by name
     *
     * @param {string} name
     * @param {any} value
     * @param {(error: any, value: any) => void} [callback]
     */
    IndexedDbStorage.prototype.set = function (name, value, callback) {
        this.db.access(function (db) {
            var transaction = db.transaction([ 'storage' ], 'readwrite');
            var objectStore = transaction.objectStore('storage');
            var request = objectStore.put({
                name: name,
                value: value
            });

            request.onerror = function (event) {
                callback && callback(event || new Error('unkonw error'), null);
            };

            request.onsuccess = function () {
                callback && callback(null, value);
            };
        }, function (error) {
            callback && callback(error || new Error('unkonw error'), null);
        });
    };

    /**
     * Get value by name
     *
     * @param {string} name
     * @returns {Promise}
     */
    IndexedDbStorage.prototype.read = function (name) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.get(name, function (error, value) {
                error ? reject(error) : resolve(value);
            });
        });
    };

    /**
     * Set value by name
     *
     * @param {string} name
     * @param {any} value
     * @returns {Promise}
     */
    IndexedDbStorage.prototype.write = function (name, value) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.set(name, value, function (error, value) {
                error ? reject(error) : resolve(value);
            });
        });
    };

    return IndexedDbStorage;
});
