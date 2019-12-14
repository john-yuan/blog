---
layout: post
title: 从源码编译安装 PHP 7 及其扩展
category: linux
tags: linux nginx php7 extensions
---

本文记录如何在 linux (CentOS 7) 上从源码编译安装 PHP 7，并配置 PHP-FPM 和 Nginx 服务器，以及介绍如何通过源码编译安装 PHP 扩展。

<!--more-->

## 前提

本文所使用系统为 Linux (CentOS 7)，所有命令均在 root 用户下执行。并假定用户已事先将 Nginx 安装在以下目录：

```
/usr/local/nginx
```

如何安装 Nginx 请参考：[Building nginx from Sources](http://nginx.org/en/docs/configure.html)

## 安装 PHP 7

参考链接：[PHP: Nginx 1.4.x on Unix systems](http://php.net/manual/en/install.unix.nginx.php)

前往 http://php.net/downloads.php 页面下载需要安装的 PHP 版本。本文以 PHP 7.2.12 为例。

```bash
# 安装相关依赖
yum install gcc libxml2 libxml2-devel

# 使用 wget 下载源码
wget http://jp2.php.net/distributions/php-7.2.12.tar.gz

# 解压源代码
tar zxf php-7.2.12.tar.gz

# 进入源代码目录
cd php-7.2.12

# 运行 ./configure 脚本进行配置
# 默认的安装目录为 /usr/local，我们指定安装目录为 /opt/php7
# 提示：如果配置过程中抛错提示有依赖没有安装（假如依赖名为 xxx）
#      则使用 yum 安装该依赖及其开发包：yum install xxx xxx-devel
#      安装完成后再次运行 ./configure 即可。
# 备注：此处仅配置了 PHP-FPM 和 MySQLi，其他扩展可后期按需编译安装进去
./configure --prefix=/opt/php7 --enable-fpm --with-mysqli

# 配置完成后执行 make 命令进行编译（编译时间较长）
make

# 编译完成后使用以下命令进行安装
make install

# 复制配置文件
cp php.ini-development /opt/php7/lib/php.ini
# 修改配置文件，设置：cgi.fix_pathinfo=0
vim /opt/php7/lib/php.ini

# 复制 php-fpm 配置文件
# 首先进入 /opt/php7/etc 目录
cd /opt/php7/etc
cp php-fpm.conf.default php-fpm.conf
cp php-fpm.d/www.conf.default php-fpm.d/www.conf

# 启动 php-fpm
/opt/php7/sbin/php-fpm
# 提示 php-fpm 运行在 127.0.0.1:9000 详情请查看文件：
# cat /opt/php7/etc/php-fpm.d/www.conf

# 备注：停止或重启 php-fpm
# 首先找到 php-fpm 进程 id
ps aux | grep php-fpm
# 重启
kill -USR2 进程ID
# 停止
kill -INT 进程ID
```

## 配置 Nginx

此处以 php.example.com 为示例，编辑 Nginx 配置文件，添加一个 server：

```conf
server {
    listen 80;
    server_name php.example.com;

    root /srv/www/php.example.com;
    index index.php index.html index.htm;

    location ~* \.php$ {
        fastcgi_index   index.php;
        fastcgi_pass    127.0.0.1:9000;
        include         fastcgi_params;
        fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param   SCRIPT_NAME     $fastcgi_script_name;
    }
}
```

重启 Nginx 服务器：

```
/usr/local/nginx/sbin/nginx -s reload
```

## 测试

在编写 Nginx 配置文件时，我们指定 php.example.com 的根目录为：

```
/srv/www/php.example.com
```

首先创建该目录：

```bash
mkdir -p /srv/www/php.example.com
```

然后，创建 test.php 文件：

```bash
echo "<?php phpinfo();" >> /srv/www/php.example.com/test.php
```

编辑本地 hosts  文件，将 php.example.com 指向 Nginx 所在服务器，然后访问以下链接以测试是否安装成功。

```
http://php.example.com/test.php
```

如果页面显示 PHP 版本信息则表明安装成功。

## 安装扩展

参考文档：

* [PHP: Compiling shared PECL extensions with phpize](http://php.net/manual/en/install.pecl.phpize.php)
* [PHP: php-config](http://php.net/manual/en/install.pecl.php-config.php)
* [PHP: Installation of PECL extensions](http://php.net/manual/en/install.pecl.php)

查看已安装的模块列表：

```bash
/opt/php7/bin/php -r 'print_r(get_loaded_extensions());'
# 或者以下命令
/opt/php7/bin/php -m
```

以下以安装 mbstring 模块为示例。首先进入 **PHP 源代码** 所在目录，然后执行以下命令：

```bash
# 安装 autoconf 依赖
yum install autoconf

# 所有扩展都保存在源码文件夹的 ext 目录下
# 我们进入 mbstring 扩展目录
cd ext/mbstring

# 执行 phpize 命令生成扩展构建环境
/opt/php7/bin/phpize

# 执行 ./configure 进行配置
./configure --with-php-config=/opt/php7/bin/php-config

# 编译扩展
make

# 安装扩展
make install
```

现在 mbstring 扩展已安装完成，需修改配置文件启用该扩展：

```bash
# 去除 ";extension=mbstring" 前面的分号 ";"
vim /opt/php7/lib/php.ini
```

重启 PHP-FPM：

```bash
# 查找 php-fpm 进程 id
ps aux | grep php-fpm
# 重启 php-fpm（请使用 master 进程 id）
kill -USR2 进程ID
```

再次查看已安装的 PHP 扩展即可看到 mbstring：

```
/opt/php7/bin/php -r 'print_r(get_loaded_extensions());'
```

其他扩展安装方式类似，可按自己的需要进行编译安装。

本文完。
