---
layout: post
title: Linux 用户管理命令备忘
category: linux
tags: useradd usermod
---

Linux 用户管理命令备忘，包含查看系统中所有的用户及用户组，创建用户，修改用户组，查看用户信息，将用户从某一个组中删除，查看组成员等。

<!--more-->

查看系统中用户及用户组：

```bash
# 查看系统中的所有用户
cut -d: -f1 /etc/passwd

# 查看系统中的所有用户组
cut -d: -f1 /etc/group
```

用户及用户组操作：

```bash
# 创建一个名为 john 的用户（并且会默认创建同名组）
# 同时将用户添加到 wheel 组里面去
useradd john -G wheel

# 查看用户所在的组
groups john

# 将用户（john）从 wheel 组中删除
gpasswd -d john wheel

# 将用户添加到 users 组中
usermod -aG users john

# 查看用户信息
id john

# 查看 users 组中包含的用户
getent group users

# 删除用户及其主目录和邮件池
userdel -r john
```

本文完。
