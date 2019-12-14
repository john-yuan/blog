var BlogSearchDb = (function () {
    function BlogSearchDb(name) {
        this.request = new Promise(function (resolve, reject) {
            var request = indexedDB.open(name);

            request.onerror = function () {
                reject();
            };

            request.onupgradeneeded = function (event) {
                event.target.result.createObjectStore('posts', { keyPath: 'id' });
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    }

    BlogSearchDb.prototype.getPosts = function () {
        return this.request.then(function (db) {
            var transaction = db.transaction(['posts']);
            var objectStore = transaction.objectStore('posts');
            var request = objectStore.get('1');

            return new Promise(function (resolve, reject) {
                request.onerror = function () {
                    reject();
                };

                request.onsuccess = function (event) {
                    if (event.target.result) {
                        resolve(event.target.result.posts);
                    } else {
                        resolve([]);
                    }
                };
            });
        });
    };

    BlogSearchDb.prototype.updatePosts = function (posts) {
        return this.request.then(function (db) {
            return new Promise(function (resolve, reject) {
                var transaction = db.transaction(['posts'], 'readwrite');
                var stroe = transaction.objectStore('posts');
                var request = stroe.get('1');

                request.onerror = function () {
                    reject();
                };

                request.onsuccess = function () {
                    var update = stroe.put({
                        id: '1',
                        posts: posts
                    });

                    update.onerror = function () {
                        reject();
                    };

                    update.onsuccess = function () {
                        resolve();
                    };
                };
            });
        });
    };

    return BlogSearchDb;
})();