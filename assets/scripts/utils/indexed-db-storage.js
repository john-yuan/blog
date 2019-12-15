(function () {
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

    /**
     * @class
     * @param {(resolve: (resource: any) => void, reject: (error: any) => void) => void} load
     */
    function ResourceLoader(load) {
        var self = this;

        self.requests = [];
        self.finished = false;
        self.hasError = false;
        self.resource = null;
        self.error = null;

        try {
            load(function (resource) {
                if (!self.finished) {
                    self.finished = true;
                    self.resource = resource;
                    handleRequests(self);
                }
            }, function (error) {
                if (!self.finished) {
                    self.finished = true;
                    self.hasError = true;
                    self.error = error;
                    handleRequests(self);
                }
            });
        } catch (error) {
            if (!self.finished) {
                self.finished = true;
                self.hasError = true;
                self.error = error;
                handleRequests(self);
            }
        }
    }

    /**
     * Handle the requests of the loader
     *
     * @param {ResourceLoader} loader
     */
    function handleRequests(loader) {
        var requests = loader.requests;
        var finished = loader.finished;
        var hasError = loader.hasError;
        var resource = loader.resource;
        var error = loader.error;
        var i = 0;
        var l = requests.length;
        var request, onsuccess, onerror;

        if (finished) {
            loader.requests = [];
            for ( ; i < l; ++i) {
                request = requests[i];
                onsuccess = request[0];
                onerror = request[1];
                try {
                    if (hasError) {
                        if (onerror) {
                            onerror(error);
                        }
                    } else {
                        if (onsuccess) {
                            onsuccess(resource);
                        }
                    }
                } catch (e) {
                    (function (e) {
                        setTimeout(function () {
                            throw e;
                        });
                    })(e);
                }
            }
        }
    }

    /**
     * Access the resource
     *
     * @param {(resource: any) => void} onsuccess
     * @param {(error: any) => void} [onerror]
     */
    ResourceLoader.prototype.access = function (onsuccess, onerror) {
        if (this.finished) {
            if (this.hasError) {
                if (onerror) {
                    onerror(this.error);
                }
            } else {
                if (onsuccess) {
                    onsuccess(this.resource);
                }
            }
        } else {
            this.requests.push([ onsuccess, onerror ]);
        }
    };

    window.IndexedDbStorage = IndexedDbStorage;
})();
