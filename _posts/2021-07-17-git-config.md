---
layout: post
title: Git 用户名和命令别名设置
category: git
tags: git
snippet: true
---

我的 git 用户名和命令简写配置。

<!--more-->

## 一、用户名设置

```bash
git config --global user.name "Joe"
git config --global user.email "joe@example.com"
```

## 二、命令别名设置

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.cl "log --oneline"
```

## 三、查看当前全局配置文件

```bash
cat ~/.gitconfig
```
