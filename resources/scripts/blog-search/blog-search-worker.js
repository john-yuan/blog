importScripts('../lib/HttpClient.js');
importScripts('../shared/parseXML.js');

var WORKER_READY = 'WORKER_READY';
var SYNC_SETTINGS = 'SYNC_SETTINGS';
var SYNC_SETTINGS_DONE = 'SYNC_SETTINGS_DONE';
var SEARCH = 'SEARCH';
var SEARCH_DONE = 'SEARCH_DONE';
var client = new HttpClient();
var blogSearchIndexUrl = null;
var fetchPostsPromise = null;

self.addEventListener('message', function (event) {
    var data = event.data || {};
    var payload = data.payload;

    switch (data.action) {
        case SYNC_SETTINGS:
            return onSyncSettings(payload);
        case SEARCH:
            return onSearch(payload);
    }
}, false);

function onSyncSettings(payload) {
    blogSearchIndexUrl = payload.blogSearchIndexUrl;

    postMessage({
        action: SYNC_SETTINGS_DONE
    });
}

function onSearch(payload) {
    var keyword = ''

    if (typeof payload.keyword === 'string') {
        keyword = payload.keyword.trim().toLowerCase();
    }

    posts().then(function (posts) {
        var results = [];

        each(posts, function(post) {
            var result = match(post, keyword);

            if (result.matchScore) {
                results.push(result);
            }
        })

        results.sort(function (a, b) {
            return b.matchScore - a.matchScore;
        });

        postMessage({
            action: SEARCH_DONE,
            payload: {
                searchId: payload.searchId,
                keyword: payload.keyword,
                results: results
            }
        })
    })
}

function match(post, keyword) {
    var tagMatchScore = 0;
    var titleMatchScore = 0;
    var categoryMatchScore = 0;
    var contentMatchScore = 0;

    var TAG_WEIGHT = 1000;
    var TITLE_WEIGHT = 100;
    var CATEGORY_WEIGHT = 10;
    var CONTENT_WEIGHT = 1;

    each(post.tags, function (text) {
        tagMatchScore += countKeyword(text, keyword, true) * TAG_WEIGHT;
    });

    titleMatchScore += countKeyword(post.title, keyword) * TITLE_WEIGHT;

    each(post.categories, function (text) {
        categoryMatchScore += countKeyword(text, keyword, true) * CATEGORY_WEIGHT;
    });

    contentMatchScore += countKeyword(post.content, keyword) * CONTENT_WEIGHT;

    var matchScore = tagMatchScore + titleMatchScore + categoryMatchScore + contentMatchScore;

    return {
        matchScore: matchScore,
        categoryMatchScore: categoryMatchScore,
        contentMatchScore: contentMatchScore,
        tagMatchScore: tagMatchScore,
        titleMatchScore: titleMatchScore,
        post: post
    };
}

function countKeyword(text, keyword, exact) {
    if (typeof text !== 'string') return 0;

    var str = text.trim().toLowerCase();
    var fromIndex = 0;
    var count = 0;
    var keywordLength = keyword.length;
    var textLength = str.length;

    if (exact) {
        return str === keyword ? 1 : 0;
    }

    while (true) {
        var index = str.indexOf(keyword, fromIndex);

        if (index === -1) {
            break;
        }

        count += 1;
        fromIndex = index + keywordLength;

        if (fromIndex >= textLength) {
            break;
        }
    }

    return count;
}

function each(array, callback) {
    if (array) {
        var i = 0;
        var length = array.length;

        for (i = 0; i < length; i += 1) {
            callback(array[i], i, array);
        }
    }
}

function posts() {
    if (fetchPostsPromise === null) {
        fetchPostsPromise = fetchPosts().catch(function () {
            return [];
        })
    }

    return fetchPostsPromise;
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
    return str ? str.trim() : '';
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
