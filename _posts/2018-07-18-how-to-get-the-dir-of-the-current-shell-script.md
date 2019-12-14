---
layout: post
title: 如何在 Shell 脚本中获取当前脚本所在文件夹的绝对路径
category: linux
tags: linux shell
---

在编写构建工具或者部署脚本时，常常需要根据脚本文件所在的路径来定位资源文件的位置，本文记录了一种动态获取
Shell 脚本所在文件夹绝对路径的方式。

<!--more-->

## 2019/06/21 更新

```bash
# 在 `$()` 里面执行 cd 命令不会改变当前工作路径
readonly __DIR__=$(cd $(dirname $0) && pwd)

echo $__DIR__
pwd
```

## 2018/08/02 更新

一种简洁的写法：

```bash
#!/bin/bash
readonly __PWD__=$(pwd)
readonly __DIR__=$(cd $(dirname $0) && pwd && cd $__PWD__)

# test
echo $__PWD__
echo $__DIR__
pwd
```

## 2018/07/18 原文

```bash
#!/bin/bash

# 保存当前工作目录
__working_dirname=$(pwd)

# 获取脚本文件相对目录和文件名
__script_dirname=$(dirname $0)
__script_filename=$(basename $0)

# 进入脚本文件所在目录
cd $__script_dirname

# 保存脚本文件绝对路径
__script_dirname=$(pwd)
__script_filename="$__script_dirname/$__script_filename"

# 回到之前的工作目录
cd $__working_dirname

# 测试: 打印结果
echo $__script_dirname
echo $__script_filename
```

在编写 Shell 脚本时，只需把以上代码放在脚本文件开头，便可以把当前脚本的文件名的绝对路径保存在
`$__script_filename` 变量中，并把其所在文件夹的绝对路径保存在 `$__script_dirname` 变量中。当需要用到脚本绝对路径时，直接引用相应的变量即可。
