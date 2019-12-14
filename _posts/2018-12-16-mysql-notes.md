---
layout: post
title: MySQL 使用笔记
category: mysql
tags: mysql
---

最近在学习 MyBatis，所以要经常和数据库打交道。在这个过程中，发现很多 SQL 语句掌握的并不牢靠。这篇文章将持续总结一些常用的 MySQL 语句和一些知识点，方便自己日后查阅。

<!--more-->

## 1. 连接 MySQL 服务器

连接本机的 MySQL 服务器：

```bash
# 根据提示输入密码即可登录
mysql -u root -p
```

可以在连接数据库时指定 IP 地址和端口号：

```bash
# 根据提示输入密码即可登录
mysql -u root -h 127.0.0.1 -P 3306 -p
```

## 2. 建库和删库语句

### 2.1 创建数据库

参考：[CREATE DATABASE Syntax](https://dev.mysql.com/doc/refman/5.7/en/create-database.html)

语法定义：

```sql
CREATE {DATABASE | SCHEMA} [IF NOT EXISTS] db_name
    [create_specification] ...

create_specification:
    [DEFAULT] CHARACTER SET [=] charset_name
  | [DEFAULT] COLLATE [=] collation_name
```

示例：

```sql
CREATE DATABASE
    db_demo
CHARACTER SET
    utf8mb4
COLLATE
    utf8mb4_unicode_ci;
```

或者：

```sql
CREATE SCHEMA
    db_demo
CHARACTER SET
    utf8mb4
COLLATE
    utf8mb4_unicode_ci;
```

### 2.2 删除数据库

参考：[DROP DATABASE Syntax](https://dev.mysql.com/doc/refman/5.7/en/drop-database.html)

语法定义：

```sql
DROP {DATABASE | SCHEMA} [IF EXISTS] db_name
```

示例：

```sql
DROP DATABASE db_demo;
```

## 3. 创建表

参考：[CREATE TABLE Syntax](https://dev.mysql.com/doc/refman/5.7/en/create-table.html)

示例：

```sql
CREATE TABLE users (
    user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NULL,
    PRIMARY KEY(user_id)
);
```

查看表格信息：

```sql
DESC users;
```

查看表格详细信息：

```sql
SHOW FULL COLUMNS FROM users;
```

## 4. 增删改查

参考：[Data Manipulation Statements](https://dev.mysql.com/doc/refman/5.7/en/sql-syntax-data-manipulation.html)

插入数据：

```sql
INSERT INTO users
    (username, email)
VALUES
    ('John', 'john@example.com');
```

选择数据：

```sql
SELECT * FROM users;
```

更新数据：

```sql
UPDATE
    users
SET
    username = 'Scott',
    email = 'scott@example.com'
WHERE
    user_id = 1;
```

删除数据：

```sql
DELETE FROM users WHERE user_id = 1;
```

## 5. 修改表格列操作

参考：[ALTER TABLE Syntax](https://dev.mysql.com/doc/refman/5.7/en/alter-table.html)

### 5.1 添加或删除列

在表格最后添加一列 address_id：

```sql
ALTER TABLE
    users
ADD COLUMN
    address_id INT UNSIGNED NULL;
```

删除指定的列：

```sql
ALTER TABLE
    users
DROP COLUMN
    address_id;
```

在指定的列后面添加列：

```sql
ALTER TABLE
    users
ADD COLUMN
    address_id INT UNSIGNED NULL
AFTER
    user_id;
```

### 5.2 修改列

```sql
ALTER TABLE
    users
CHANGE COLUMN
    address_id addr_id INT UNSIGNED NULL;
```
