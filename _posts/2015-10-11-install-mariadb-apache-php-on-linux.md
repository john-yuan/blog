---
layout: post
title: 在 Linux 上安装 MariaDB、Apache 以及 PHP
category: linux
tags: linux mariadb apache php
---

本文主要记录如何在 Linux 上安装 Apache 服务器，MariaDB 数据库以及 PHP编程语言，参照系统为 Fedora 22。

<!--more-->

## 一、安装 MariaDB

```
# 安装 mariadb mariadb-server
$ sudo dnf install mariadb mariadb-server

# 设置开机启动服务
$ systemctl enable mariadb.service

# 启动服务
$ systemctl start mariadb.service

# 执行安装引导，并跟随安装步骤完成安装
$ sudo mysql_secure_installation
```

## 二、安装 Apache

```
# 安装
$ sudo dnf install httpd

# 设置开机启动服务
$ systemctl enable httpd.service

# 启动服务
$ systemctl start httpd.service
```

完成以上步骤，打开浏览器访问 `localhost` 测试安装是否成功。如果安装成功则会打开一个页面，而不是错误提示。

## 三、安装 PHP

```
# 安装
$ sudo dnf install php

# 安装 Mysql 支持
$ sudo dnf install php-mysqlnd php-mssql php-opcache

# 重启 Apache
$ systemctl restart httpd.service
```

**检测安装**

在 `/var/www/html` 目录下创建 `PHP` 脚本 `phpinfo.php`，内容为：

```php
<?php
    phpinfo();
?>
```

为脚本添加可执行权限：

```
$ sudo chmod +x phpinfo.php
```

打开浏览器访问 `localhost/phpinfo.php`，如果显示为 `PHP` 版本信息，即表明安装成功。
