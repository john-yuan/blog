---
layout: post
title: 在 macOS 上打开没有跨域限制 Chrome 的浏览器
category: dev
tags: cross-origin chrome macos
---

由于磁盘大小写敏感问题把系统重装了，又需要配置各种环境。本文记录一下如何在 macOS 上打开一个没有跨域限制的 Chrome 浏览器，方便开发时与后端联调接口。

<!--more-->

首先创建一个用于存放 Chrome 数据的目录，并设置相应的读写权限：

```bash
# 创建目录
sudo mkdir /tmp/chrome-user-data
# 设置权限（注意：权限很重要，否则无法打开）
sudo chmod 777 /tmp/chrome-user-data
```

执行以下命令在 `~/.zshrc` 中添加一个 `alias`：

```bash
echo 'alias chromex="open -n /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir=/tmp/chrome-user-data"' >> ~/.zshrc
```

使用 `source` 执行一下 `~/.zshrc` 中的脚本使 `alias` 生效：

```bash
source ~/.zshrc
```

最后执行 `chromex` 命令就可以打开没有跨域限制的 Chrome 浏览器啦。
