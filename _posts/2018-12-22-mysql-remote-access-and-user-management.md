---
layout: post
title: MySQL 远程登录及用户权限管理
category: mysql
tags: MySQL 远程登录 用户管理
---

为了方便管理和不扰乱本地环境，我把一些软件安装在虚拟机中，比如 MySQL。今天，当我尝试在本地连接 MySQL 时，服务器提示拒绝访问。经过查阅相关文档后，对 MySQL 的用户管理有了简单的了解，本文为相关笔记。

<!--more-->

在开始本文之前，你最想知道的可能是：如何允许 root 用户远程登录。答案是：

```sql
-- 首先创建一个用户 'root'@'%' 并设置密码
-- 用户名为: root
-- 百分号（%）表示 root 可以从任意主机登录
-- 你也可以使用 IP 来限制 root 的登录地点，比如：
-- 'root'@'192.168.56.1'
CREATE USER 'root'@'%' IDENTIFIED BY 'mypassword';

-- 然后给用户 'root'@'%' 分配权限
-- 这里分配了所有权限，但不包含 GRANT 和 REVOKE 权限
GRANT ALL ON *.* TO 'root'@'%';
```

执行以上 SQL 后 root 用户就可以从别的主机登录了。这时执行以下命令，可以查看我们刚刚创建的 root 用户。

```sql
SELECT user, host, password FROM mysql.user;
```

用户的身份由两部分组成，一是**用户名**，二是**允许登录的主机地址**。也就是说 `'root'@'127.0.0.1'` 和 `'root'@'192.168.56.1'` 是两个不同的用户，他们有着互不相关的访问权限。

如果你想修改刚刚创建的 root 用户的密码，可以使用以下 SQL：

```sql
SET PASSWORD FOR 'root'@'%' = PASSWORD('newpassword');
```

也许你觉得刚刚我们给 `'root'@'%'` 用户分配的权限太大了，那么你可以收回该用户的权限，并进行重新分配，比如：

```sql
-- 首先查看用户具备哪些权限
SHOW GRANTS FOR 'root'@'%';
-- 收回用户权限
REVOKE ALL ON *.* FROM 'root'@'%';
-- 分配查询数据的权限
-- 参考文档 3 中给出了所有可用的权限，需要请自行查阅
GRANT SELECT ON *.* TO 'root'@'%';
```

参考：

1. [GRANT Syntax](https://dev.mysql.com/doc/refman/5.6/en/grant.html)
2. [REVOKE Syntax](https://dev.mysql.com/doc/refman/5.6/en/revoke.html)
3. [Privileges Supported by MySQL](https://dev.mysql.com/doc/refman/5.6/en/privileges-provided.html)

通常而言，我们不建议使用 root 用户进行远程操作，所以你可能想删除 `'root'@'%'` 这个用户：

```sql
DROP USER 'root'@'%';
```

然后创建一个新的用户，并分配指定权限。作为演示，这里我们创建一个 `'demo_master'@'%'` 用户，她的权限为：可以在任何名字以 `demo_` 开头的数据库上进行任意操作，包括创建或删除任何名字以 `demo_` 开头的数据库。具体操作如下：

```sql
-- 创建用户
CREATE USER 'demo_master'@'%' IDENTIFIED BY '123456';
-- 允许用户操作任何名字以 demo_ 开头的数据库
GRANT ALL ON `demo_%`.* TO 'demo_master'@'%';
```

本文完。
