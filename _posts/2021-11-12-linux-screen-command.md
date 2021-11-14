---
layout: post
title: Linux 下使用 screen 命令
category: linux
tags: screen
snippet: true
---

Screen 命令操作备忘。

<!--more-->

打开一个新的 screen 并命名为 MyScreen，后面我们要通过这个名字重新找到这个 screen。

```bash
screen -S MyScreen
```

可以在这个新的 screen 里面运行一些耗时或者不会主动结束的任务，当我们想保持这些任务再后台运行的同时进行其他操作时，我们可以依次按下 `Ctrl - A`、`Ctrl - D` 退出当前 screen。

如果想查看当前有哪些 screen，可以执行：

```bash
screen -ls
```

如果想连接到某个 screen，可以执行：


```bash
screen -R MyScreen
```
