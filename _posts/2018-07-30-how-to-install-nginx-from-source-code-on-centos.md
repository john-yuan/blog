---
layout: post
title: CentOS 7 从源码编译安装 nginx 并配置反向代理
category: linux
tags: nginx 源码安装 反向代理
---

本文介绍如何在 CentOS 7 上从源码编译安装 nginx 服务器，并介绍如何配置多个静态站点和如何通过反向代理向外暴露内网服务。

<!--more-->

## 安装 nginx

参考链接：[Building nginx from Sources](http://nginx.org/en/docs/configure.html)

在未指定安装目录的情况下，nginx 的默认安装目录为 `/usr/local/nginx`，本文将把 nginx 安装在 `/opt/nginx` 目录下。相关操作如下：

```bash
# 创建相关目录
cd /opt
sudo mkdir nginx

# 安装一些编译需要的软件
sudo yum install wget gcc openssl openssl-devel pcre pcre-devel zlib zlib-devel

# 下载 nginx 源代码
sudo wget http://nginx.org/download/nginx-1.14.0.tar.gz

# 解压源代码
sudo tar zxf nginx-1.14.0.tar.gz

# 进入源代码目录
cd nginx-1.14.0

# 使用以下命令进行编译配置
# 1) 将安装目录指定为 /opt/nginx
# 2) 编译 https 模块
# 备注：如果有错误提示某些软件没有则使用 yum 安装后重试直至成功
sudo ./configure --prefix=/opt/nginx --with-http_ssl_module --with-stream --with-stream_ssl_module

# 使用以下命令会默认安装到 /usr/local/nginx
# sudo ./configure --with-http_ssl_module --with-stream --with-stream_ssl_module

# 执行 make 命令进行编译
sudo make

# 编译完成后执行 make install 进行安装
sudo make install
```

执行以上命令后，nginx 已经编译安装好了，可以进入 `/opt/nginx` 目录查看和启动 nginx:

```bash
# 启动 nginx
cd /opt/nginx
sudo ./sbin/nginx
```

nginx 启动完成后，即可访问 `http://127.0.0.1` 查看是否成功。如果你是在云服务器上进行安装并通过公网 IP 进行访问且没有成功的话，请检查是否开放了 80 端口。如果没有开放 80 端口，可以尝试使通过以下命令进行防火墙配置：

```bash
# 开放系统 80 端口
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo systemctl restart firewalld
```

## nginx 常用命令

参考链接：[Beginner’s Guide](http://nginx.org/en/docs/beginners_guide.html)

```bash
# 快速关闭 nginx
sudo /opt/nginx/sbin/nginx -s stop
# 处理完当前请求后关闭 nginx
sudo /opt/nginx/sbin/nginx -s quit
# 重新加载配置文件
sudo /opt/nginx/sbin/nginx -s reload
```

## 示例：配置多个静态站点

现在假设我们需要部署两个静态站点 site1.example.com 和 site2.example.com，站点文件目录相关信息如下。

静态站点 site1.example.com 的文件夹为 `/opt/websites/site1`，其中 index.html 文件的内容为：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Site 1</title>
</head>
<body>
    <p>This is site1.example.com</p>
</body>
</html>
```

静态站点 site2.example.com 的文件夹为 `/opt/websites/site2`，其中 index.html 文件的内容为：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Site 2</title>
</head>
<body>
    <p>This is site2.example.com</p>
</body>
</html>
```

为了在本地进行测试，我们先在 `/etc/hosts` 文件中添加以下两行记录：

```
127.0.0.1 site1.example.com
127.0.0.1 site2.example.com
```

编辑 nginx 配置文件 `/opt/nginx/conf/nginx.conf` 并在 `http` 模块下添加以下两个 `server` 模块：

```
server {
    listen 80;
    # 指定域名（下同）
    server_name site1.example.com;
    # 指定此站点对应目录（下同）
    root /opt/websites/site1;
    # 如果没有指定文件则默认使用 index.html（下同）
    index index.html;
}

server {
    listen 80;
    server_name site2.example.com;
    root /opt/websites/site2;
    index index.html;
}
```

保存配置文件后，使用以下命令重新加载 nginx 配置文件，并访问相关域名以检查配置是否成功：

```bash
# 重新加载 nginx 配置文件
sudo /opt/nginx/sbin/nginx -s reload
```

## 示例：配置反向代理

参考链接：[Module ngx_http_proxy_module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)

假设我们内网有一个 tomcat 服务器，其运行在 8080 端口上，通过访问 http://127.0.0.1:8080 即可访问该 Web 服务。现在我们希望通过配置 nginx 服务器实现：当我们访问 http://tomcat.example.com 时，将请求转发到 http://127.0.0.1:8080，从而实现向外网暴露内网服务。

为了在本地进行测试，我们先在 `/etc/hosts` 文件中添加以下记录：

```
127.0.0.1 tomcat.example.com
```

然后在 `/opt/nginx/conf/nginx.conf` 中的 `http` 模块下添加以下配置：

```
server {
    listen 80;
    server_name tomcat.example.com;

    location / {
        # 将请求转发至 http://127.0.0.1:8080
        proxy_pass http://127.0.0.1:8080;
        # 转发原始请求相关信息
        proxy_set_header  Host $host;
        proxy_set_header  X-Real-IP $remote_addr;
        proxy_set_header  X-Forwarded-Proto https;
        proxy_set_header  X-Forwarded-For $remote_addr;
        proxy_set_header  X-Forwarded-Host $remote_addr;
    }
}
```

保存配置后，记得重新加载 nginx 配置文件:

```bash
# 重新加载 nginx 配置文件
sudo /opt/nginx/sbin/nginx -s reload
```

现在，当我们访问 http://tomcat.example.com 时就可以看到 http://127.0.0.1:8080 上的内容了。
