define(function () {
    /**
     * Resource loader
     *
     * @class
     * @param {(resolve: (resource: any) =>void, reject: (error: any) => void) => void} loadFn The function to load resource
     */
    function ResourceLoader(loadFn) {
        var self = this;

        self.result = null;
        self.finished = false;
        self.hasError = false;
        self.callbacks = [];

        if (typeof loadFn !== 'function') {
            throw new TypeError('loadFn is not a function');
        }

        try {
            loadFn(function (resource) {
                finish(false, null, resource);
            }, function (error) {
                finish(true, error, null);
            });
        } catch (error) {
            finish(true, error, null);
        }

        function finish(hasError, error, resource) {
            var i, l, callback;

            if (!self.finished) {
                self.finished = true;
                self.hasError = hasError;
                self.result = hasError ? error : resource;

                for (i = 0, l = self.callbacks.length; i < l; ++i) {
                    try {
                        if (hasError) {
                            callback = self.callbacks[i][1];
                            callback && callback(error);
                        } else {
                            callback = self.callbacks[i][0];
                            callback && callback(resource);
                        }
                    } catch (err) {
                        (function (err) {
                            setTimeout(function () { throw err; }, 0);
                        })(err);
                    }
                }

                self.callbacks = [];
            }
        }
    }

    /**
     * Access the resource
     *
     * @param {(resource: any) => void} onsuccess
     * @param {(error: any) => void} onerror
     */
    ResourceLoader.prototype.access = function (onsuccess, onerror) {
        if (this.finished) {
            if (this.hasError) {
                onerror && onerror(this.result);
            } else {
                onsuccess && onsuccess(this.result);
            }
        } else {
            this.callbacks.push([ onsuccess, onerror ]);
        }
    };

    return ResourceLoader;
});
