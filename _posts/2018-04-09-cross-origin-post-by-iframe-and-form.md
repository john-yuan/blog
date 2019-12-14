---
layout: post
title: 使用 iframe 加 form 实现跨域 POST 请求
category: fe
tags: 跨域 POST iframe
---

跨域请求是前端开发工作中经常遇到的问题，通常使用 CORS 即可完美解决（[IE10+][cors]）。如果兼容性要求高可以使用 JSONP，但是 JSONP 只能发送 GET 请求。本文主要探讨如何利用 [window.name][windowName] 的特性，结合 `<iframe>` 加 `<form>` 实现跨域 POST 请求。

[cors]: https://caniuse.com/#feat=cors "Caniuse CORS"

<!--more-->

## window.name 跨域原理简介

假设现有以下两个网页:

* 主页面: http://www.example.com:8001/main.html
* 子页面: http://www.example.org:8002/child.html

子页面的内容为：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>COR</title>
</head>
<body>
    <script>
        // 实际使用时 window.name 的内容由应由服务端动态生成
        // 此处以 {"language":"JavaScript"} 示例
        // 我们的主要目的是让主页面拿到 window.name 中的数据
        window.name = "{\"language\":\"JavaScript\"}";
    </script>
</body>
</html>
```

主页面通过 `<iframe>` 标签引入子页面，主要代码如下：

```html
<iframe id="childIframe" src="http://www.example.org:8002/child.html">
```

在主页面中通过 iFrame 的 contentWindow 属性我们可以拿到子页面的 window 对象，但是由于跨域限制，我们无法通过该 window 对象获取子页面上定义的全局变量。如果我们尝试这么做，浏览器会抛出错误：

```js
var childIframe = document.getElementById('childIframe');

childIframe.onload = function () {
    var childWindow = childIframe.contentWindow;
    // 尝试访问子页面上的全局变量 name，由于跨域问题，下一行代码将会抛错
    childWindow.name;
    // => Uncaught DOMException: Blocked a frame with
    //    origin "***" from accessing a cross-origin frame.
};
```

如果子页面的链接与主页面同源，如 `http://www.example.com:8001/some-page.html` 或是特殊的链接 [`about:blank`][Inherited_origins]，那么主页面对子页面的 window 则享有完全的访问权限。

[Inherited_origins]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#Inherited_origins "MDN Inherited origins"

上文主要说明了跨域的限制，下面说明如何解决这个问题。我们的目的是在主页面中获取子页面保存在 [window.name][windowName] 上的数据，[window.name][windowName] 有如下的特点： **如果利用同一个 `<iframe>` 节点先后加载两个页面，其中第一个页面对 [window.name][windowName] 进行了赋值，第二个页面没有。那么在第二个页面中访问 [window.name][windowName] 时，得到的值将是第一个页面中设置的值。** 如果第二个页面与主页面同源，那么我们就可以在主页面中获取到第一个页面保存在 [window.name][windowName] 中的数据了。具体流程如下：

[windowName]: https://developer.mozilla.org/en-US/docs/Web/API/Window/name#Notes "MDN window.name"

* 创建一个 `<iframe>` 节点，使用此节点加载子页面 `http://www.example.org:8002/child.html`，在这个子页面中把需要传递的数据保存在 [window.name][windowName] 上。
* 监听该 `<iframe>` 节点的 `onload` 事件，当 `http://www.example.org:8002/child.html` 加载完成时，立即使用此节点加载同源子页面`about:blank`。当 `onload` 再次触发时，则表明空白页面加载完成，即可通过 [window.name][windowName] 读取第一个页面保存的数据。

具体代码如下：

```js
/**
 * 通过 iframe 跨域获取数据
 *
 * @param {string} targetUrl 目标链接
 * @param {Function} callback 回调函数
 */
var crossOriginAccessByIframe = function (targetUrl, callback) {
    var iframe = document.createElement('iframe');
    var TARGET_READY = 1, BLANK_READY = 2;
    var state = TARGET_READY, responseText;

    iframe.onload = function () {
        // 目标链接加载完成
        if (state === TARGET_READY) {
            // 将此 iframe 重定向到空白页面
            iframe.src = 'about:blank';
            state = BLANK_READY;
        // 空白页面加载完成
        } else if (state === BLANK_READY) {
            // 获取数据
            responseText = iframe.contentWindow.name;
            // 移除 iframe
            iframe.onload = null;
            iframe.parentNode.removeChild(iframe);
            if (typeof callback === 'function') {
                callback(responseText);
            }
        }
    };

    // 先设置 onload 再设置 src，以确保 onload 被触发
    iframe.src = targetUrl;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
};

// 获取子页面上的数据
var targetUrl = 'http://www.example.org:8002/child.html';

crossOriginAccessByIframe(targetUrl, function (responseText) {
    console.log(responseText); // => {"language":"JavaScript"}
});
```

## from 表单的 target 属性

当我们通过 `<form>` 表单提交数据时，浏览器会在当前窗口打开表单所指定的 URL。这是因为 `<form>` 有一个属性 `target`，其默认值为 `_self`，目的是告诉浏览器在当前窗口打开 `<form>` 指定的 URL。

我们可以设置 `target` 属性来告诉浏览器在何处打开请求的链接，[target 属性的取值如下][form_target]：

[form_target]: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form#attr-target "MDN form target"

* `_self`: 在当前 HTML4 或 HTML5 文档页面重新加载返回值。这个是默认值。
* `_blank`: 以新的 HTML4 或 HTML5 文档窗口加载返回值。
* `_parent`: 在父级的 frame 中以 HTML4 或 HTML5 文档形式加载返回值，如果没有父级的 frame，行为和 `_self` 一致。
* `_top`: 如果是 HTML4 文档: 清空当前文档，加载返回内容；HTML5: 在当前文档的最高级内加载返回值，如果没有父级，和 `_self` 的行为一致。
* _iframename_: 返回值在指定 `<iframe>` 中加载。

留意最后一条规则，当我们把 `<form>` 的 `target` 属性设置为当前页面中的某个 `<iframe>` 的 `name` 时，浏览器将会在这个 `<iframe>` 中显示 `<form>` 请求的结果，而不去刷新当前的主页面。利用这个特点，就可以实现无刷新提交请求。

## 发送跨域 POST 请求

利用 `<form>` 的 `target` 属性加上 [window.name][windowName] 跨域方法，我们就可以发送跨域 POST 请求了。具体思路如下：

1. 动态创建一个 `<iframe>` 节点，并为其生成一个唯一的 `name`。
2. 动态创建一个 `<form>` 节点，将其 `target` 属性设置为上一步中生成的 `name`。设置 `method` 为 `POST`，以及其它参数，最后调用 `form.submit()` 提交该表单。表单的结果页应该将处理的结果保存在 [window.name][windowName] 上。
3. 当 `<iframe>` 监听到请求返回时，跳转至空白页，以便读取返回数据。

具体代码如下：

```js
/**
 * 发送跨域请求
 *
 * 注意：为了检测网络是否出错，此函数要求后端必须返回一个 JSON 数据
 *
 * @param {string} method 请求方法（POST 或 GET）
 * @param {string} url 目标链接
 * @param {Object|null} data 请求参数
 * @param {Function} callback (err, res) 完成回调
 */
var crossOriginRequest = function (method, url, data, callback) {
    var err, form, iframe, iframeName, state, generateIframeName, appendParams;
    var blankPageSrc = 'about:blank';
    var BLANK_READY = 1, FORM_READY = 2, BLANK_READY_AGAIN = 3;
    var body = document.body || document.getElementsByTagName('body')[0];

    generateIframeName = function (prefix) {
        var iframeName, nodes;
        prefix = '' + prefix;
        do {
            iframeName = prefix + (new Date()).getTime();
            nodes = document.getElementsByName(iframeName);
            iframeName = (nodes && nodes.length) ? null : iframeName;
        } while (iframeName === null);
        return iframeName;
    };

    appendParams = function (form, data) {
        var prop, input;
        var hasOwn = Object.prototype.hasOwnProperty;
        var fragment = document.createDocumentFragment();

        for (prop in data) {
            if (hasOwn.call(data, prop)) {
                input = document.createElement('input');
                input.name = prop;
                input.value = data[prop];
                fragment.appendChild(input);
            }
        }

        form.appendChild(fragment);
    };

    iframeName = generateIframeName('_COR_');

    iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';

    state = BLANK_READY;

    iframe.onload = function () {
        var responseText, err = null, res = null;
        if (state === BLANK_READY) {
            form = document.createElement('form');
            form.style.display = 'none';
            form.action = url;
            form.method = method;
            form.target = iframeName;
            appendParams(form, data);
            body.appendChild(form);
            form.submit();
            state = FORM_READY;
        } else if (state === FORM_READY) {
            iframe.src = blankPageSrc;
            state = BLANK_READY_AGAIN;
        } else if (state === BLANK_READY_AGAIN) {
            // 最好还是检查一下
            try {
                responseText = iframe.contentWindow.name || "null";
            } catch (e) {
                err = e;
                err.type = 'ERR_CROSS_ORIGIN';
                err.iframeName = iframeName;
            }
            iframe.onload = null;
            iframe.parentNode.removeChild(iframe);
            form.parentNode.removeChild(form);
            if (!err) {
                if (responseText === iframeName) {
                    err = new Error('Network error.');
                    err.type = 'ERR_NETWORK';
                    err.iframeName = iframeName;
                    err.responseText = responseText;
                } else {
                    try {
                        res = JSON.parse(responseText);
                    } catch (e) {
                        err = e;
                        err.type = 'ERR_PARSE_JSON';
                        err.iframeName = iframeName;
                        err.responseText = responseText;
                    }
                }
            }
            if (typeof callback === 'function') {
                callback(err, res);
            }
        }
    };

    iframe.src = blankPageSrc;

    if (!body) {
        err = new Error('<body> is not found.');
        err.type = 'ERR_BODY_NOT_FOUND';
        err.iframeName = iframeName;
        if (typeof callback === 'function') {
            callback(err, null);
        }
    } else {
        body.appendChild(iframe);
    }
};
```

以上代码实现了跨域 POST 请求，同 JSONP 一样，以此方式进行跨域请求需要后端返回特定结构的数据。这里我们需要后端返回一个把查询结果挂载在 `window.name` 上的简单的网页：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>COR</title>
</head>
<body>
    <script>
        window.name = "${后端查询结果（JSON格式的字符串）}";
    </script>
</body>
</html>
```
