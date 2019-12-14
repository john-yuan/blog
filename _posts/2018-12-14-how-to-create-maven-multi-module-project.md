---
layout: post
title: Maven 快速创建多模块项目备忘
category: java
tags: maven multi-module-project pom-root
---

最近在学 Java，经常要创建包含多个模块的 Maven 项目，为了方便复制粘贴，在此写一个简单笔记。

<!--more-->

## 方法一

新建一个项目目录，并将以下内容保存在项目目录下的 pom.xml 文件中，并修改相关信息（groupId 和 artifactId）：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                      http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <name>demo-project-name</name>
  <groupId>org.example.demo</groupId>
  <artifactId>demo-project-name</artifactId>
  <packaging>pom</packaging>
  <version>1.0-SNAPSHOT</version>
</project>
```

然后再使用以下命令创建子模块：

```bash
mvn archetype:generate
```

## 方法二

只需复制以下命令，并修改 groupId 和 artifactId 即可：

```bash
mvn archetype:generate \
-DgroupId=org.example.demo \
-DartifactId=demo-project-name \
-DarchetypeGroupId=org.codehaus.mojo.archetypes \
-DarchetypeArtifactId=pom-root \
-DinteractiveMode=false
```

然后再使用以下命令创建子模块：

```bash
mvn archetype:generate
```

## 参考链接

[Maven提高篇系列之（一）——多模块 vs 继承](http://www.cnblogs.com/davenkin/p/advanced-maven-multi-module-vs-inheritance.html)

本文完啦。
