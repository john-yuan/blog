---
layout: post
title: Nginx 配置 Basic Auth
category: nginx
tags: nginx basic auth
---

Nginx 添加 Basic Auth 验证。

<!--more-->

## 创建密码文件

```bash
htpasswd -c /usr/local/nginx/conf/.htpasswd [user]
```

## 更新 nginx 配置

```
server {
    # ...
    auth_basic  "Restricted Access!";
    auth_basic_user_file /usr/local/nginx/conf/.htpasswd;
    # ...
}
```
