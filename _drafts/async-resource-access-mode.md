---
layout: post
title: 一种异步资源访问模式
category: JavaScript
tags: Promise ResourceLoader
---

在开发 Web 应用时，我们常常会遇到需要缓存异步资源的场景。比如，在一个单页面应用程序中，当程序初始化时，我们需要从服务端获取应用配置信息并将其缓存以供后续使用。本文介绍这个常见的访问模式，并提供两种实现方式。

<!--more-->


