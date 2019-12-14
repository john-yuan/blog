---
layout: post
title: 如何与 Chrome 扩展程序后台脚本进行双向通信
category: fe
tags: Chrome扩展程序 双向通信
---

本文主要介绍如何在 Web 页面中借助 CustomEvent 和 dispatchEvent 来与 Chrome 插件后台脚本进行双向通信。

<!--more-->

Chorme 扩展程序开发中主要有两个形式的脚本：后台脚本（Background Script）和内容脚本（Content Script)。后台脚本是长时间运行于 Chrome 后台的 Javascript 代码，内容脚本可以调用 Chrome 接口和后台脚本进行通信，麻烦后台脚本帮帮忙去干一些内容脚本干不了的事儿（比如跨域获取数据等）。内容脚本则是注入到网页中的脚本，该脚本可以操作当前网页的 DOM 结构，监听网页中的事件等。但是内容脚本和该网页的宿主脚本的运行是相互隔离的，它们两除了共享同一个 DOM 以外，其它任何数据都不能相互访问。

现在我们的目标是要在宿主脚本与后台脚本间进行通信，不过宿主脚本要和后台脚本直接进行通信是不可能的，我们必须借助内容脚本进行消息转发。上面说过内容脚本与宿主脚本是相互隔离的，也就是宿主脚本中不可能直接去调用内容脚本的函数、读取变量数据等。但是内容脚本和宿主脚本共享着同一个 DOM，而且它们都可以监听 DOM 上发生的各种事件。比如说，两个脚本都可以监听同一个按钮的点击事件，当用户点击该按钮后，两个脚本中的回调函数都将得到执行。

了解这一点后，我们可以在内容脚本中监听一个特殊的自定义事件（比如 window 对象上的 onWebPageMessageSend 自定义事件），然后在宿主脚本中通过调用 dispatchEvent API 触发该事件，并通过事件对象的 detail 属性传递相关数据（该数据只能包含基本数据类型，也就是能序列化为 JSON 文本的数据）。内容脚本便可以在事件回调函数被调用时获取来自宿主脚本的数据，从而完了从宿主脚本到内容脚本的数据传递。同理，我们可以实现从内容脚本到宿主脚本的数据传递。以下为从宿主脚本传递数据到内容脚本的代码示例。

```javascript
/**
 * 在内容脚本（Content Script）中监听自定义事件 onWebPageMessageSend
 */
window.addEventListener("onWebPageMessageSend", function(event) {
    console.log("接受到来自宿主脚本的数据:");
    console.log(JSON.stringify(event.detail, null, 4));
});
```

```javascript
/**
 * 在宿主脚本中触发 onWebPageMessageSend 事件以传递数据至内容脚本
 * @param {Object} message 消息内容（可进行 JSON 序列化的数据类型）
 */
var sendMessage2ContentScript = function(message) {
    window.dispatchEvent(new CustomEvent("onWebPageMessageSend", {
        cancelable: false,
        bubbles: false,
        detail: message
    }));
};

// 发送测试消息
sendMessage2ContentScript({
    text: "么么哒。"
});
```

内容脚本接收到宿主脚本的消息后便可以将消息转发给后台脚本了，后台脚本处理完消息后即可把结果以同样的流程返回给宿主脚本，从而完成宿主脚本与后台脚本的双向通信。本文完。

参考文档：[《创建和触发 events》](https://developer.mozilla.org/zh-CN/docs/Web/Guide/Events/Creating_and_triggering_events "创建和触发 events")