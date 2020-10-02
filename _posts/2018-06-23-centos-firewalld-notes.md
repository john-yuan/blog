---
layout: post
title: Linux firewalld 使用简记
category: linux
tags: linux firewalld centos
---

firewalld 是 CentOS 7 默认的防火墙，使用此工具来管理网络端口十分便利。本文主要记录在 CentOS 7 中如何使用 firewall-cmd 来开启或关闭指定的端口号。

<!--more-->

本文只是一个速查笔记，完整的 firewalld 文档请查阅: [Documentation \| firewalld][docs]

[docs]: https://firewalld.org/documentation/ "firewalld Documentation"

## 方法一: 使用内置服务开放常用的端口

如果你只是想开放 80 端口，建议使用 firewalld 内置的 `http` 服务:

```bash
# 开启 http 服务，该命令会打开 80 端口
firewall-cmd --permanent --add-service=http
# 重启 firewalld 以使配置生效
firewall-cmd --reload
```

除了 `http` 服务以外，firewalld 还内置其他很多常见的服务（比如: https)，查看所有可用的服务，请使用以下命令:

```bash
# 查看所有服务
firewall-cmd --get-services
```

备注: 如果不确定某个服务所开放的端口号，前往 `/usr/lib/firewalld/services` 目录查看服务对应的 XML 文件即可。

移除指定的服务:

```bash
# 示例: 移除 http 服务（关闭80端口）
firewall-cmd --permanent --remove-service=http
# 重启 firewalld 以使配置生效
firewall-cmd --reload
```

## 方法二: 开放指定的端口号

如果你想开放的端口不属于常见的服务，你可以使用以下命令来开放或关闭指定的端口:

```bash
# 开放 8080 端口
firewall-cmd --permanent --add-port=8080/tcp
# 重启 firewalld 以使配置生效
firewall-cmd --reload

# 关闭 8080 端口
firewall-cmd --permanent --remove-port=8080/tcp
# 重启 firewalld 以使配置生效
firewall-cmd --reload
```

## zone 管理

添加或移除服务或端口时，如果没有指定 zone，默认将操作当前默认的 zone，查看当前默认的 zone 可以使用以下命令：

```bash
firewall-cmd --get-default-zone
```

查看所有 zone：

```bash
firewall-cmd --get-zones
```

设置默认 zone：

```bash
firewall-cmd --get-default-zone [zone]
```

## 查看当前开放的端口或服务

```bash
firewall-cmd --list-all
```

## 其他

* 进入 `/usr/lib/firewalld` 目录可以查看 firewalld 内置的的 services，zone 等信息。
