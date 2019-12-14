---
layout: post
title: 以 Linux 环境为例安装 Java 和 Maven
category: java
tags: java maven linux
---

最近开始学习 Spring，这篇文章主要记录如何安装 Maven，以及如何配置阿里云的 Maven 镜像。因为 Mac 上环境已经搭建好了，为了测试，我准备在虚拟机上（运行系统为 CentOS 7）再安装验证一次，并做好记录，方便日后查看。

<!--more-->

## 1. 安装 Java

> 如果已经安装好了请跳过此小节。

前往 Java 官网下载对应系统的 JDK，本文所使用版本为 jdk-8u191-linux-x64。解压后移动到 /usr/local/java 目录下。将路径 /usr/local/java/bin 添加到 PATH 变量中，操作步骤为：

```bash
# 打开用户环境变量文件 ~/.bash_profile
# 并在文件末尾添加以下 Shell 语句：
# export PATH=$PATH:/usr/local/java/bin
vim ~/.bash_profile

# 保存后执行以下命令使配置生效
source .bash_profile

# 打印 Java 版本信息，如果成功则表明配置正确
java -version
```

我的输出信息为：

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

> 如果希望 java 在所有用户下都可用，请将环境变量设置在 /etc/profile 文件中。

## 2. 安装 Maven

Maven 的安装也非常简单，只要去官网下载对应的二进制压缩包即可。本文以 apache-maven-3.6.0-bin.tar.gz 为例。将下载后的文件解压，并移动到 /usr/local/maven 目录。

然后参考第 1 小节，将 /usr/local/maven/bin 添加到 PATH 中。完成后执行以下命令检查是否安装成功。

```bash
# 查看 maven 版本信息
mvn -v
```

我的输出信息为：

```
Apache Maven 3.6.0 (97c98ec64a1fdfee7767ce5ffb20918da4f719f3; 2018-10-25T02:41:47+08:00)
Maven home: /usr/local/maven
Java version: 1.8.0_191, vendor: Oracle Corporation, runtime: /usr/local/java/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "linux", version: "3.10.0-862.14.4.el7.x86_64", arch: "amd64", family: "unix"
```

## 3. 配置阿里云镜像

> 这个步骤非常重要，要不然下载速度非常慢，过程会非常痛苦。

为了使用阿里云镜像，请把以下内容保存到 ~/.m2/settings.xml 文件中（覆盖原有内容，覆盖前请自行备份），如果该路径不存在则手动创建一个。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <mirrors>
    <mirror>
      <id>nexus</id>
      <mirrorOf>*</mirrorOf>
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
    </mirror>
    <mirror>
      <id>nexus-public-snapshots</id>
      <mirrorOf>public-snapshots</mirrorOf>
      <url>http://maven.aliyun.com/nexus/content/repositories/snapshots/</url>
    </mirror>
  </mirrors>
</settings>
```

保存好以上文件后就可以使用命令创建一个演示项目了，复制以下命令进行测试：

> 为了方便阅读我使用 \ 符号将命令分隔成了多行，粘贴后回车即可运行。

```bash
mvn archetype:generate \
-DgroupId=com.example \
-DartifactId=maven-demo \
-Dpackage=com.example.demo \
-Dversion=1.0.0-SNAPSHOT
```

运行命令时按照相应提示进行操作即可。首次执行这个命令时会下载一堆文件，请耐心等待。命令完成后会在当前目录下产生一个新的目录 maven-demo，此目录即为我们的项目目录。进入该目录测试：

```bash
# 进入项目目录
cd maven-demo
# 运行以下命令测试，首次执行时会下载一些文件，请耐心等待
mvn test
```

至此 Maven 安装完毕，本文完。
