---
layout: post
title: Linux sshd 配置备忘
category: linux
tags: linux ssh sshd
---

Linux 配置 sshd 记录: 如何生成公私密钥，服务端文件存放位置及权限，如何进行客户端配置。

<!--more-->

```
示例 Linux 用户名: demo
示例主机域名: demo.example.com (没有域名则使用 IP 地址代替)
```

## 生成公私密钥

```bash
# 进入 .ssh 目录
cd ~/.ssh
# 生成公私密钥，输出文件名为: demo.example.com
ssh-keygen -t rsa -f demo.example.com
```

## 上传公钥至服务器

```bash
# 上传至 demo 用户家目录
scp demo.example.com.pub demo@demo.example.com:/home/demo
```

## 服务器配置

使用 demo 用户登录远程服务器后执行下列操作:

```bash
# 进入家目录
cd ~
# 创建 .ssh 目录
mkdir .ssh
# 保存公钥至 authorized_keys
cat demo.example.com.pub >> .ssh/authorized_keys
# 设置文件权限
chmod 700 .ssh
chmod 644 .ssh/authorized_keys
# 删除 demo.example.com.pub
rm ~/demo.example.com.pub
# 重启 sshd 服务
sudo systemctl restart sshd
```

## 客户端配置

编辑 ssh 配置文件 `~/.ssh/config`，并添加以下配置内容:

```
Host demo
    HostName demo.example.com
    Port 22
    User demo
    IdentityFile ~/.ssh/demo.example.com
```

使用以下命令测试配置是否成功:

```bash
# 以 demo 用户登录 demo.example.com
ssh demo
```
## 防止客户端超时断开连接

编辑配置文件:

```bash
sudo vim /etc/ssh/sshd_config
```

设置以下配置项

```
ClientAliveInterval 60
ClientAliveCountMax 3
```

重启 sshd:

```bash
sudo systemctl restart sshd
```

## 允许指定的 IP 使用密码进行登录

ssh 可以通过配置令用户不能通过密码进行登录，这么一来用户就只能通过私钥进行登录。如果私钥丢失，那么用户将无法远程登录。

如果希望用户在指定的 IP 地址上可以进行密码登录，可以在 ssh 的配置文件 /etc/ssh/sshd_config 的最下面添加以下配置:

```
# 如果有多个 IP 则使用英文逗号隔开
Match Address 192.168.56.1
    PasswordAuthentication yes
    PermitRootLogin yes
```

配置完成并重启 sshd 后，当有登录请求时，如果其来源 IP 地址为 192.168.56.1 时，就会使用下面的配置选项覆盖之前的设置。
