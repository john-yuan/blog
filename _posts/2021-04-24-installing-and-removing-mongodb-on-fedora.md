---
layout: post
title: 在 Fedora 系统上安装及卸载 MongoDB
category: linux
tags: fedora mongodb
---

最近在学习使用 MongoDB，本文记录如何在 Fedora 系统上安装及卸载 MongoDB。

<!--more-->

> 本文发表于 2021 年 4 月 24 日，使用系统为 Fedora 33 (Workstation Edition)。

## 一、安装

首先添加 MongoDB 的 yum 源。使用 vim 编辑器打开 `/etc/yum.repos.d/mongodb.repo`，并将以下内容粘贴在里面：

```text
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8Server/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
```

> 以上源文件来源于 [MongoDB 官方文档](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/#install-mongodb-community-edition)，但是由于目前 MongoDB 没有提供 Fedora 系统的官方源，我们这里使用的是 CentOS 8 Server 的仓库，所以我们将源文件中的 `$releasever` 更改为 `8Server`。

保存源文件以后，执行以下命令安装 MongoDB：

```bash
yum install -y mongodb-org
```

安装完成后还不能直接启动 MongoDB，因为此时系统并没有 MongoDB 用于保存数据的 `/data/db` 目录，直接启动会报错并退出，所以在启动前我们需使用以下命令创建该目录：

```bash
mkdir -p /data/db
```

然后执行以下命令即可启动 MongoDB：

```bash
mongod
```

上面的方式是前台运行 MongoDB 服务器，界面会一直处于等待状态，如果这个时候想测试 MongoDB，需要新开一个 shell 窗口，并使用以下命令连接至 MongoDB 服务器：

```bash
mongo
```

下面我们介绍如何在 Fedora 系统上后台运行 MongoDB，并设置开机自动启动。首先在刚刚启动 MongoDB 的 shell 窗口中按下 `CTRL-C` 以关闭 MongoDB 服务器。然后执行以下命令后台运行 MongoDB 服务器：

```bash
systemctl start mongod
```

其他相关命令有：

```bash
# 关闭 mongodb 服务器
systemctl stop mongod

# 重启 mongodb 服务器
systemctl restart mongod

# 设置开机自动启动
systemctl enable mongod

# 取消开机自动启动
systemctl disable mongod
```

至此，MongoDB 安装完毕。

## 二、卸载

如果你想卸载通过以上方式安装的 MongoDB。首先关闭正在运行的 MongoDB 服务器（如果在运行中）：

```bash
systemctl stop mongod
```

然后取消开机自动启动（如果设置了开机自启）：

```bash
systemctl disable mongod
```

然后执行以下命令卸载 MongoDB：

```bash
yum remove mongodb-org
```

最后是手动删除相关数据文件，注意：此操作不可逆，操作前请确保已对重要数据进行备份：

```bash
rm -rf /var/lib/mongo
rm -rf /var/log/mongodb
rm -rf /data/db
rm -rf /etc/mongod.conf.rpmsave
```

至此，MongoDB 卸载完毕。

## 三、参考链接

* [Install MongoDB Community Edition on Red Hat or CentOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/)
* [How to get MongoDB Server on Fedora](https://fedoramagazine.org/how-to-get-mongodb-server-on-fedora/)

本文完。
