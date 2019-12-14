---
layout: post
title: 跨标签事件通知机制
catetory: JavaScript
tags: cross-tab notification
---

# 跨标签事件通知机制

在项目开发中遇到一个需求，场景如下：

公司内部存在多个子系统，分别部署在 `sys1.example.com` 和 `sys2.example.com`。用户在使用系统时有可能同时**在两个标签页**中分别打开 `sys1` 和 `sys2`。现要求，如果用户在 `sys1` 所在的标签中进行了重新登录操作，需要通知 `sys2` 所在的标签进行相应的操作。

<!--more-->

总结一下，可以将以上需求归纳为：

**需要在多个标签之间实现事件通知机制，且每个标签的域名可能不一样，但主域名是一样的。**

## 尝试一：storage 事件

要进行多个标签之间进行消息传递，首先想到的是监听 `storage` 事件。当我们需要通知其他标签时，只需手动改变某个 `storage` 的值即可。**但是这种方法存在跨域限制，不能满足我们的要求。**

## 尝试二：postMessage

另外一种没有跨域限制的消息传递机制是利用 `postMessage`，但是这种方式需要我们维护一个目标标签页对应的 `window` 对象，然后通过 `targetWindow.postMessage(...)` 进行消息传递。当我们通过 `window.open()` 或者 `iframe` 时，我们可以拿到对应的 `window` 对象。但是如果用户分别手动打开页面时（比如通过浏览器书签），我们是无法拿到其它标签页中的 `window` 对象的。**所以这种方式也不能满足我们的要求。**

## 最终方案：Cookie + setInterval

受到 `sotrage` 事件的启发，我们可以通过监听某个在多个页面中共享的变量的值的变化情况，来感知某个事件是否发生。简单来说，我们假设每个标签页都可以通过某种方法，读写一个在多个标签之间共享的变量的值，然后根据这个值的变化情况来判断事件是否发生。

虽然 Cookie 也存在跨域限制，但是这个限制可以适当放开。如果我们在设置 Cookie 时，把域名指定为 `.example.com`，那么 `sys1.example.com` 和 `sys2.example.com` 都可以读写这个 Cookie 的值。因此，我们可以利用 Cookie 来保存上面所说的公共变量。

比如现在有一个 Cookie 名为 `EVENT_UPDATED_AT`，保存着事件上一次发生的时间对应的毫秒数，如果这个 Cookie 不存在，则默认值为 0。

每个页面在打开时，便读取 `EVENT_UPDATED_AT` 的当前值，并保存在本地。然后使用 `setInterval` 开启一个定时器，每次这个定时器执行时，再去读取 `EVENT_UPDATED_AT` 的最新值。如果最新的值与之前保存在本地的值不一致时，则说明事件发生了。反过来，如果我们需要通知其它标签页这个事件在当前标签页发生了，只需要在当前标签页手动更新 `EVENT_UPDATED_AT` 的值即可。

在使用这种方式时，我们需要明确这种方式有以下限制或要求：

1. 各个标签页的域名的主域名必须一致
2. 这种方式需要利用一个 Cookie
3. 这种方式需要利用一个 setInterval

## 实现类：MainDomainCrossTabNotification

基于以上的方法，我写了一个类 `MainDomainCrossTabNotification` 来实现标签事件通知机制。使用方法如下：

```js
var notification = new MainDomainCrossTabNotification({
    // 事件名称，会作为 Cookie 的键值
    eventName: 'EVENT_UPDATED_AT',
    // 主域名
    domain: '.example.com',
    // 定时器轮询间隔时间，默认 300 毫秒
    interval: 300,
    // 事件发生回调
    listener: function(notification) {
        console.log('Page updated at ' + Date.now());
    }
});

// 开始监听
notification.listen();
```

如果需要通知其他页面事件发生，只需调用 `notification.notify()` 即可。

## API

<table>
    <tr>
        <th>方法</th>
        <th>返回值</th>
        <th>说明</th>
    </tr>
    <tr>
        <td>listen()</td>
        <td>this</td>
        <td>开始监听，这个方法会销毁之前的 inerval 定时器，并开启一个新的 interval 定时器，用以定期检查事件发生时间是否发生改变。如果检测到事件发生，首先会调用 <code>stop()</code> 方法停止监听，然后在调用监听回调函数 <code>listener(notifiction)</code>。如果需要继续监听，需要在回调中手动调用 <code>listen()</code> 方法。</td>
    </tr>
    <tr>
        <td>stop()</td>
        <td>this</td>
        <td>停止监听并清除 interval 定时器。</td>
    </tr>
    <tr>
        <td>notify()</td>
        <td>this</td>
        <td>更新事件发生时间以通知其它标签页事件发生。</td>
    </tr>
    <tr>
        <td>value()</td>
        <td>number</td>
        <td>获取最新的事件发生时间对应的毫秒数。</td>
    </tr>
</table>

## 源代码

```js
/**
 * 主域名跨标签轻量级事件通知机制
 *
 * 主要用于具有相同主域名的多个浏览器标签之间的事件通知。比如现在浏览器中有两个标签，
 * 第一个标签的域名为: site1.example.com；第二个标签的域名为：site2.example.com。
 * 两个标签中都可以进行登录操作，但在登录之后需要通知另一个标签。此时便可以使用这个类。
 *
 * 注意：
 *
 * 1. 这个类使用 cookie 作为通信媒介
 * 2. 这个类使用 setInterval 定期检查 cookie 中对应的值是否改变
 *
 * @typedef {Object.<string, *>} MainDomainCrossTabNotificationOptions 配置信息
 * @property {string} eventName 事件名称：这个值会作为 cookie 的键名，推荐使用变量名规则进行命名
 * @property {string} domain 主域名：一个以点开头的主域名，比如 .example.com
 * @property {number} [interval=300] 时间间隔：定期检查 cookie 值变化的时间间隔，默认 300 毫秒
 * @property {(notification: MainDomainCrossTabNotification) => void} listener
 * 监听回调：事件发生时会调用此函数，并停止继续监听（用户可以在这个回调选择手动继续监听）
 *
 * @class
 * @param {MainDomainCrossTabNotificationOptions} options 配置信息
 */
var MainDomainCrossTabNotification = function (options) {
    if (!options || typeof options !== 'object') {
        throw new Error('options is required');
    }

    var store = this.store = {};
    var eventName = options.eventName;
    var domain = options.domain;
    var interval = options.interval;
    var listener = options.listener;

    // 检查是否设置 eventName

    if (!eventName) {
        throw new Error('options.eventName is required');
    } else if (typeof eventName !== 'string') {
        throw new Error('options.eventName is not a string')
    }

    eventName = eventName.replace(/^\s+|\s+$/g, '');

    if (!eventName) {
        throw new Error('options.eventName can not be empty');
    }

    // 检查是否设置 domain

    if (!domain) {
        throw new Error('options.domain is required');
    } else if (typeof domain !== 'string') {
        throw new Error('options.domain is not a string')
    }

    domain = domain.replace(/^\s+|\s+$/g, '');

    if (!domain) {
        throw new Error('options.domain can not be empty');
    }

    // 检查是否设置 interval

    if ('interval' in options) {
        if (typeof interval !== 'number' || isNaN(interval)) {
            throw new Error('options.interval is not a number');
        } else if (interval <= 0) {
            throw new Error('options.interval must be greater than 0');
        }
    } else {
        interval = 300;
    }

    // 检查是否设置 listener

    if (typeof listener !== 'function') {
        throw new Error('options.listener must be a function');
    }

    store.eventName = encodeURIComponent(eventName);
    store.domain = domain;
    store.interval = interval;
    store.listener = listener;
    store.intervalId = null;
    store.value = this.value();
};

/**
 * 获取当前事件值
 *
 * @returns {number}
 */
MainDomainCrossTabNotification.prototype.value = function () {
    var store = this.store;
    var eventName = store.eventName;
    var cookieStr = document.cookie || '';
    var cookies = cookieStr.split(/\;\s*/);
    var i = 0;
    var l = cookies.length;
    var cookie = null;
    var value = 0;

    for ( ; i < l; i += 1) {
        cookie = cookies[i].split('=');
        if (cookie[0] === eventName) {
            value = cookie[1];
            break;
        }
    }

    value = parseInt(value || 0, 10) || 0;

    return value;
};

/**
 * 改变当前事件值，并通知其它标签页事件发生
 *
 * @returns {ThisType}
 */
MainDomainCrossTabNotification.prototype.notify = function () {
    var store = this.store;
    var eventName = store.eventName;
    var domain = store.domain;
    var value = (new Date()).getTime();
    var cookieStr = eventName + '=' + value + '; path=/; domain=' + domain;

    store.value = value;
    document.cookie = cookieStr;

    return this;
};

/**
 * 停止监听事件
 *
 * @returns {ThisType}
 */
MainDomainCrossTabNotification.prototype.stop = function () {
    var store = this.store;

    if (store.intervalId !== null) {
        clearInterval(store.intervalId);
        store.intervalId = null;
    }

    return this;
};

/**
 * 开始监听事件
 *
 * @returns {ThisType}
 */
MainDomainCrossTabNotification.prototype.listen = function () {
    var self = this;
    var store = this.store;

    this.stop();

    store.intervalId = setInterval(function () {
        var value = self.value();
        if (value !== store.value) {
            self.stop();
            store.value = value;
            store.listener.call(null, self);
        }
    }, store.interval);

    return this;
};
```
