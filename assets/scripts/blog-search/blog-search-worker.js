importScripts('http-client.js');
importScripts('parse-xml.js');
importScripts('blog-search-db.js');

var WORKER_READY = 'WORKER_READY';
var SYNC_SETTINGS = 'SYNC_SETTINGS';
var client = new HttpClient();
var db = new BlogSearchDb('blog_search');
var blogSearchIndexUrl = null;
var fetchPostsPromise = null;
var postsFromServer = [];
var postsFromDb = [];

self.addEventListener('message', function (event) {
    var data = event.data || {};
    var payload = data.payload;

    switch (data.action) {
        case SYNC_SETTINGS:
            return onSyncSettings(payload);
    }
}, false);

function onSyncSettings(settings) {
    blogSearchIndexUrl = settings.blogSearchIndexUrl;
    posts();
}

function posts() {
    return new Promise(function (resolve) {
        if (postsFromServer.length) {
            resolve(postsFromServer);
        } else if (postsFromDb.length) {
            resolve(postsFromDb);
        } else {
            if (!fetchPostsPromise) {
                fetchPostsPromise = fetchPosts().then(function (posts) {
                    return posts;
                }).catch(function () {
                    return [];
                }).then(function (posts) {
                    postsFromServer = posts;
                    db.updatePosts(posts);
                });
            }

            db.getPosts().then(function (posts) {
                return posts;
            }).catch(function () {
                return [];
            }).then(function (posts) {
                postsFromDb = posts;
                if (posts.length) {
                    resolve(posts);
                } else {
                    resolve(fetchPostsPromise);
                }
            });
        }
    });
}

function fetchPosts() {
    return new Promise(function (resolve, reject) {
        client.send({
            url: blogSearchIndexUrl
        }, function (response) {
            var posts;

            try {
                posts = parseSearchIndex(response.text())
            } catch (e) {
                posts = null;
                reject();
            }

            if (posts) {
                resolve(posts);
            }
        }, function () {
            reject();
        });
    })
}

function parseSearchIndex(xml) {
    var posts = [];
    var node = parseXML(xml);
    var postNodes = node.childNodes[0].childNodes;
    var i = 0;
    var l = postNodes.length;

    for ( ; i < l; ++i) {
        posts.push(parsePostNode(postNodes[i]));
    }

    return posts;
}

function parsePostNode(node) {
    var post = {};
    var childNodes = node.childNodes;
    var i = 0;
    var l = childNodes.length;
    var node;

    post.url = node.attributes.url;

    for ( ; i < l; ++i) {
        node = childNodes[i];
        switch (node.nodeName) {
            case 'title':
                post.title = parsePostTitleNode(node);
                break;
            case 'date':
                post.date = parsePostDateNode(node);
                break;
            case 'categories':
                post.categories = parsePostCategoriesNode(node);
                break;
            case 'tags':
                post.tags = parsePostTagsNode(node);
                break;
            case 'content':
                post.content = parsePostContentNode(node);
                break;
            default:
                break;
        }
    }

    return post;
}

function trim(str) {
    return str.trim();
}

function parsePostTitleNode(node) {
    return trim(node.childNodes[0].textContent);
}

function parsePostDateNode(node) {
    return trim(node.childNodes[0].textContent);
}

function parsePostCategoriesNode(node) {
    var categories = [];
    var childNodes = node.childNodes;
    var i = 0;
    var l = childNodes.length;
    var category;

    for ( ; i < l; ++i) {
        category = childNodes[i];
        categories.push(trim(category.childNodes[0].textContent));
    }

    return categories;
}

function parsePostTagsNode(node) {
    var tags = [];
    var childNodes = node.childNodes;
    var i = 0;
    var l = childNodes.length;
    var tag;

    for ( ; i < l; ++i) {
        tag = childNodes[i];
        tags.push(trim(tag.childNodes[0].textContent));
    }

    return tags;
}

function parsePostContentNode(node) {
    return trim(node.childNodes[0].textContent);
}

postMessage({
    action: WORKER_READY
});
