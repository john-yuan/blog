---
layout: post
title: 移动端 Placeholder 的 CSS 兼容性问题小结
category: fe
tags: placeholder
---

在做移动端混合应用开发时，发现 Input 的 Placeholder 的样式在某些老旧机型的
Weibview(AppleWebkit/534.30) 上渲染异常，在此记录遇到的两个坑和相应的解决办法。

<!--more-->

## 一、文字垂直居中

这是一个在老旧机型上比较常见的问题，一开始以为只要把 Placeholder 的行高(line-height)
设置来与 Input 同高就行了，可是实际却发现并没有什么卵用。最终的解决办法如下：

```css
input {
	line-height: normal;
}
```

只需要把 Input 的行高(line-height) 设置成 `normal` 就行了，而设置成其他任何带单位(rem,
px ...)的值等均无效，[具体请参考这个答案](https://stackoverflow.com/a/27559961)。

## 二、文字居右显示

这个问题倒是没有第一个问题那么常见，具体的复现场景是：当 Input 的 `text-align` 为 `right`
时，Placeholder 的文字在某些老旧的机型上并不居右显示，而是仍然向左对其。

找了好久才找到的解决办法如下：

```css
input::placeholder, input::-webkit-input-placeholder {
	text-align: right;
	direction: rtl;
}
```

起主要作用的是 `direction: rtl` 这行代码，[具体请参考这个答案](https://stackoverflow.com/a/34082080)。