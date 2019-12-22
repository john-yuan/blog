---
layout: post
title: 一种异步资源访问模式
category: JavaScript
tags: Promise ResourceLoader
---

在开发 Web 应用时，我们常常会遇到需要缓存异步资源的场景。比如，在一个单页面应用程序中，当程序初始化时，我们需要从服务端获取应用配置信息并将其缓存以供后续使用。本文介绍这个常见的访问模式，并提供两种实现方式。

<!--more-->

## 一、访问模式

由于资源是异步加载的，所以访问的时候要使用回调函数，以下为异步资源的一般访问模式：

1. 调用方调用资源访问函数并提供一个回调函数以获取返回值
2. 检查资源是否已被缓存，如果是，则跳过以下所有步骤，直接返回资源
3. 如果资源还未缓存，则将回调函数保存到等待资源加载的回调函数队列
4. 检查资源是否正在加载中，如果是，则跳过加载（防止重复加载），如果不是，则调用接口获取资源
5. 等待资源加载完成后，执行回调函数队列中的所有回调函数并清空该队列

这种访问模式的特点是：即使多次调用该资源访问函数，也最多只会发起一次接口请求。

## 二、使用 Promise

当我们多次访问同一个 Promise 对象时，得到的返回值与上一次调用的结果一致，这是 Promise 的一个特性。所以 Promise 本身就具备缓存结果的功能，利用这个特点，我们很容易实现上述要求，以下为实现方式：

```js
var cache = null;

/**
 * 访问异步资源，如果该资源已缓存，则返回缓存的结果
 *
 * @param {(error, resource) => void} callback
 */
function getResource(callback) {
    if (cache === null) {
        cache = new Promise(function (resolve, reject) {
            fetchResourceFromAPI(function (error, resource) {
                error ? reject(error) : resolve(resource);
            });
        });
    }
    cache.then(function (resource) {
        callback && callback(null, resource);
    }, function (error) {
        callback && callback(error || new Error('unkown error'), null);
    });
}
```

上面的方法使用回调函数的方式返回结果，不过我们也可以直接返回缓存的 Promise 对象（cache），从而简化代码（摒弃回调函数）。

### 三、手动实现

Promise 是首选的方式，但是如果运行环境中不支持 Promise，我们也可以自己实现一个类似的加载器。以下的代码实现了一个 ResourceLoader 类，可满足以上要求。

```js
/**
 * 资源加载类
 *
 * @class
 * @param {(
 *  resolve: (resource: any) => void,
 *  reject: (error: any) => void
 * ) => void} loadFn 用于加载资源的回调函数
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
 * 访问资源
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
```

利用上面的 ResourceLoader 类，我们即可实现具有相同功能的 getResource 函数，代码如下：

```js
var cache = null;

/**
 * 访问异步资源，如果该资源已缓存，则返回缓存的结果
 *
 * @param {(error, resource) => void} callback
 */
function getResource(callback) {
    if (cache === null) {
        cache = new ResourceLoader(function (resolve, reject) {
            fetchResourceFromAPI(function (error, resource) {
                error ? reject(error) : resolve(resource);
            });
        });
    }
    cache.access(function (resource) {
        callback && callback(null, resource);
    }, function (error) {
        callback && callback(error || new Error('unkown error'), null);
    });
}
```

本文完。
