---
layout: post
title: 前端分页组件页码计算方法
catetory: JavaScript
tags: pagitaion javascript
---

最近在开发一个数据可视化平台的前端页面，由于页面定制化较高，现有的框架很难满足这种需求，所以很多组件都要自己编写。分页是网页中很常见的组件，主要功能是根据当前页码和数字最大的页码计算出一个页码列表，并在适当的地方添加“更多”按钮，方便用户在各个页面之间进行切换。

<!--more-->

以下是一些分页页码的例子：

```text
[1] 2 3 4 5 6 » 20
1 « 6 7 [8] 9 10 » 20
1 « 15 16 17 18 19 [20]
```

本文会很简洁，主要分为接口定义和实现思路（理清需求），并在文末给出一个我自己的实现的链接。

## 接口定义

我们的要求是根据**当前页码**和**最大页码**生成一个页码列表。现定义接口如下：

```js
/**
 * 计算分页页码列表
 *
 * @param {number} current - 当前所在页面的页码
 * @param {number} max - 最大的页码
 * @returns {number[]} - 返回一个页码数组（由数字组成）
 */
pagination(current, max);
```

注意：我们的返回值是一个**由数字组成的数组**，而不是一个 DOM 结构（或者类似的东西）。因为我们的重点是计算分页，生成 DOM 结构应该是调用方所需要做的事情（不同的调用方所需的结构可能不尽相同，调用方可以根据此函数的返回值来渲染他所需要的 DOM 结构）。

在返回的页码数组中，可能存在「更多页面」这种特殊的页码，对于这种页码我们使用特殊的数字进行表示。因为页码肯定是大于 0 的整数，所以我们使用负数表示这种特殊页码，说明如下：

* `-1` 表示一个「更多页面」，这个在「更多页面」的位置在「当前页面」的前面
* `-2` 表示一个「更多页面」，这个在「更多页面」的位置在「当前页面」的后面

下面给出一些示例：

```js
// 当前页码为 1，-2 表示一个「更多页面」
// [1, 2, 3, 4, 5, 6, -2, 20]
pagination(1, 20);

// 当前页码为 12，-1 和 -2 分别表示一个「更多页面」
// [1, -1, 10, 11, 12, 13, 14, -2, 20]
pagination(12, 20);

// 当前页码为 19，-1 表示一个「更多页面」
// [1, -1, 15, 16, 17, 18, 19, 20]
pagination(19, 20);
```

## 实现思路

这个算法本身很简单，最大的问题是需求不是很明确。只要我们了解的限制规则，代码写起来也就得心应手了。以下为几个我们实现这个算法时需要考虑的问题（也就是规则）：

（1）如果最大页码小于等于 10，直接返回完整的页码列表；

（2）在「当前页面」前后至少应该各有两个页面，比如：

```text
1 « 6 7 [8] 9 10 » 20
```

> 当前页面为第 8 页，她的前面和后面都有两个可以点击的页面，分别为 6、7 和 9、10。

（3）当「当前页面」前面没有「更多页面」时，应保证至少有 6 个连续的页面，比如：

```text
[1] 2 3 4 5 6 » 20
1 [2] 3 4 5 6 » 20
1 2 [3] 4 5 6 » 20
1 2 3 [4] 5 6 » 20
1 2 3 4 [5] 6 7 » 20
```

> 注意：最后一个例子包含 7 个连续的页面，因为需要满足规则（2）。

（4）与规则（3）类似，当「当前页面」后面没有「更多页面」时，应保证至少有 6 个连续的页面，比如：

```text
1 « 14 15 [16] 17 18 19 20
1 « 15 16 [17] 18 19 20
1 « 15 16 17 [18] 19 20
1 « 15 16 17 18 [19] 20
1 « 15 16 17 18 19 [20]
```

> 注意：第一个例子包含 7 个连续的页面，因为需要满足规则（2）。

## 具体实现

由于代码较长，不适合贴在本文中。你可以[点击这里][impl]查看源码。该源码中包含了具体实现和相关测试函数，具体请细节请查看代码注释。

本文完。

[impl]: https://github.com/john-yuan/snippets/blob/master/pagination.js
