---
layout: post
title: 为博客添加 Let's Encrypt https 证书
category: https
tags: https
---

本文主要记录如何为网站添加 [Let's Encrypt](https://letsencrypt.org/) https 证书、设置定时任务自动更新 https 证书和配置 nginx 从 http 自动跳转至 https。

<!--more-->

## 一、生成证书并配置

本文以以下域名进行演示说明：

* example.com
* www.example.com

首先需要确保以上域名在公网上能通过 http 正常访问，以下为相关 nginx 配置：

```
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/example.com;
    index index.html;
}
```

然后执行以下命令安装 certbot：

```bash
yum install certbot
```

接下来执行以下命令并按提示操作以生成 https 证书：

```bash
certbot certonly --webroot \
    -w /var/www/example.com \
    -d example.com \
    -d www.example.com
```

> 请注意我们网站根目录为：`/var/www/example.com`，请确保该目录存在。

完成上述操作后，会在 `/etc/letsencrypt/live/example.com` 目录下生成 https 证书。更新 nginx 配置即可使用该 https 证书，配置如下：

```
server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    root /var/www/example.com;
    index index.html;
}
```

使用以下命令重启 nginx 即可通过 https 访问：

```bash
# 重启 nginx
nginx -s reload
```

## 二、自动更新

通过 certbot 创建的 https 证书会在 90 天后失效，我们需要定期更新 https 证书。更新证书时使用以下命令即可，该命令会自动判断系统中通过 certbot 创建的 https 证书是否需要更新，如果需要更新则会进入自动更新程序，如果不需要则跳过本次更新。

```bash
certbot renew
```

我们可以通过 crontab 设置定时任务，每天检查更新，以确保 https 证书始终有效。

```bash
# 首先使用以下命令编辑定时任务
crontab -e
```

然后在打开的编辑器中添加以下指令即可：

```
0 1 * * * certbot renew --post-hook "/usr/local/nginx/sbin/nginx -s reload" >/dev/null 2>&1
```

> 如果打开的是 nano 编辑器，保存的操作为 `Ctrl-X` 然后输入 `Y` 或 `N` 并回车。

以上指令的意思是每天早上 01:00 的时候执行 `certbot renew` 更新 https 证书，并在证书更新后重启 nginx 服务器，如果证书没有更新，则不会重启 nginx 服务器。

## 三、配置 http 跳转至 https

更新配置信息，将 80 端口单独配置如下：

```
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;

    location / {
        return 301 https://$host$request_uri;
    }

    # 保留此配置以供 certbot 自动更新时使用
    location /.well-known/acme-challenge/ {
        root /var/www/example.com;
    }
}
```

变量意义请参考：

* [$host](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_host)
* [$request_uri](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_request_uri)

本文完。
