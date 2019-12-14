---
layout: post
title: Java 通过命令编译源码并构建可执行 jar 包
category: java
tags: jar javac
---

一般情况下我们会使用构建工具帮助我生成 jar 包，但工具是建立在底层命令的基础之上的，只会用工具而不知道底层实现原理，通常会让我们心里没底。本文主要记录如何使用 Java 自带的命令（javac、java、jar）来实现项目的编译、运行和打包。

<!--more-->

## 一、概述

在本文中，我们将讨论以下内容：

* 使用 javac 命令编译项目用到的所有 java 文件
* 使用 java 命令运行项目主函数
* 使用 jar 命令创建可执行 jar 包
* 使用 jar 命令解压 jar 包
* 使用 javac 命令编译项目中所有 java 文件，无论该文件是否被引用

## 二、项目结构

作为演示，我们项目的结构如下：

```text
demo-project
├── src
│   └── org
│       └── example
│           ├── app
│           │   └── App.java
│           └── service
│               ├── ByeService.java
│               ├── HelloService.java
│               └── impl
│                   └── HelloServiceImpl.java
└── target
    ├── classes           # 保存生成的 class 文件
    ├── demo-project.jar  # 保存生成的 jar 包
    └── unpackaged        # jar 包的解压目录
```

注意：我们的源代码中一共有 ByeService 和 HelloService 两个接口，但只提供了 HelloService 的实现（HelloServiceImpl）。这是有意为之，后面演示会进行说明。

## 三、源代码

org/example/app/App.java：

```java
package org.example.app;

import org.example.service.HelloService;
import org.example.service.impl.HelloServiceImpl;

public class App {
    public static void main(String[] args) {
        HelloService h = new HelloServiceImpl();
        h.hello();
    }
}
```

org/example/service/ByService.java：

```java
package org.example.service;

public interface ByeService {
    void bye();
}
```

org/example/service/HelloService：

```java
package org.example.service;

public interface HelloService {
    void hello();
}
```

org/example/service/impl/HelloServiceImpl：

```java
package org.example.service.impl;

import org.example.service.HelloService;

public class HelloServiceImpl implements HelloService {
    @Override
    public void hello() {
        System.out.println("HelloServiceImpl -> HelloService.hello()");
    }
}
```

> 注意：以上代码中我们没有引用 org.example.service.ByeService 这个类。

## 四、编译项目

首先确保我们创建了第一节中所描述的目录结构，主要是确保 target/classes 目录存在，因为我们会将该目录作为输出目录。

然后进入 src 目录，使用以下命令进行编译：

```bash
# 备注：
#  1) 当前所在目录为 src 目录
#  2) -d 用于指导输出目录
#  3) ../target/classes 目录必须存在才能编译成功
javac org/example/app/App.java -d ../target/classes
```

以上命令会编译 App.java 以及所有被 App.java 引用（import）的文件，由于 ByeService 没有被引用，所以 ByeService.java 文件没有被编译。

以下为编译之后的文件树形结构：

```text
target
└─ classes
    └─ org
        └─ example
            ├─ app
            │   └─ App.class
            └─ service
                ├─ HelloService.class
                └─ impl
                    └─ HelloServiceImpl.class
```

## 五、运行程序

编译完成后，进入 target/classes 目录，然后执行以下命令以运行程序：

```bash
# 指定入口程序的全类名
java org.example.app.App
```

输出结果为：

```
HelloServiceImpl -> HelloService.hello()
```

## 六、创建可执行 jar 包

使用 jar 命令，我们可以把生成的 class 文件打包成一个 jar 包。首先我们需要进入 target/classes 目录，然后输入以下命令即可进行打包：

```bash
# 备注：
# 1) c 代表创建归档文件（即表明：此操作为打包而不是解压）
# 2) v 代表打印日志信息
# 3) f 代表指定输出文件名
# 4) ../demo-project.jar 即目标文件名
# 5) * 表示打包当前路径下的所有文件
jar cvf ../demo-project.jar *
```

通过上面的命令创建的不是一个这里所说的可执行 jar 包，但我们可以通过以下命令运行 main 方法：

```bash
# 备注：
# 1) -cp 代表指定 classpath，此处指定为生成的 jar 包
# 2) org.example.app.App 表示主程序入口
java -cp demo-project.jar org.example.app.App
```

上面的方式虽然能够执行 jar 包，但步骤稍显麻烦，而且需要我们记住主程序的全类名，比如这里的 org.example.app.App 这一长串。

下面我们要介绍的打包方式可以在打包时记录主程序的全类名，这样在我们执行这个 jar 包的时候，就不用输入全类名了。首先进入 target/classes 目录，然后执行以下命令：

```bash
# 备注：
# 1) 此处添加了 e 选项
# 2) 此处指定了主程序全类名 org.example.app.App
jar cvfe ../demo-project.jar org.example.app.App *
```

打包完成后，进入 target 目录，使用以下命令即可运行 jar 包：

```bash
java -jar demo-project.jar
```

下一节我们将讨论如何解压 jar 包，并说明 jar 包是如何记录主程序全类名的。

## 七、解压 jar 包

jar 包其实也是一种压缩包格式，我们可以使用 jar 命令解压 jar 包。以上面生成的 demo-project.jar 为例，首先我们进入 target/unpackaged 目录，确保 target/demo-project.jar 文件存在，然后执行以下命令：

```bash
# 备注：
# 1) x 代表解压
# 2) v 表示打印日志
# 3) f 指定要解压的文件名
# 4) 当前目录为 unpackaged，解压结果会保存到当前目录
jar xvf ../demo-project.jar
```

解压完成后，unpackaged 的目录结构如下：

```text
unpackaged
├── META-INF
│   └── MANIFEST.MF
└── org
    └── example
        ├── app
        │   └── App.class
        └── service
            ├── HelloService.class
            └── impl
                └── HelloServiceImpl.class
```

可以看到，解压后的文件夹中除了我们的 class 文件外，还多了一个 META-INF 文件夹，该文件夹中的文件就是用来保存当前 jar 包的相关信息的。其中 META-INF/MANIFEST.MF 的文件内容如下：

```text
Manifest-Version: 1.0
Created-By: 1.8.0_191 (Oracle Corporation)
Main-Class: org.example.app.App
```

可以看到，该文件使用 Main-Class 字段保存了主程序的全类名。

## 八、编译所有源文件

前面我们已经说过，由于我们的程序没有引用 ByeService.java 这个文件，所以我们在编译 App.java 的时候，编译器并不会去编译 ByeService.java 这个文件。但有些时候，我们需要编译源码目录下的所有文件，不管这些文件是否被引用。

要做到这一点，我们需手动告诉编译器我们需要编译哪些文件，比如下面这样：

```bash
# 备注：运行时确保我们处于 src 目录下
javac org/example/app/App.java org/example/service/ByeService.java -d ../target/classes
```

在上面的命令中，我们明确指示编译器要对 org/example/service/ByeService.java 这个文件进行编译。命令完成后，我们可以发现 org/example/service/ByeService.class 已经编译完成。

如果我们的项目很大，里面有无数的 .java 源文件，我们也不能清楚的记得哪些文件被引用了，而哪些文件没有被引用。这个时候，如果要求我们在编译时指定没有被引用的文件，就稍显麻烦了。所以最保险的办法是让编译器编译所有的源文件。也就是说，我们需要在 javac 命令中指定所有 .java 文件的路径。不过由于这个操作太反人类了，我们可以使用以下的 shell 脚本来帮我们完成：

```bash
#!/bin/bash
# 备注：
# 请将这个文件保存在项目根目录下（与 src 目录同级）
# 并命名为 build.sh

# 获取脚本文件所在目录
readonly __DIR__=$(cd $(dirname $0) && pwd)
# 源码目录
readonly SRC_DIR="${__DIR__}/src"
# 目标目录
readonly TARGET_DIR="${__DIR__}/target"
# class 文件目录
readonly CLASSES_DIR="${TARGET_DIR}/classes"
# 创建一个临时文件路径
readonly TEMP_FILE=$(mktemp)

# 打印提示信息
echo
echo "    SRC_DIR: ${SRC_DIR}"
echo " TARGET_DIR: ${TARGET_DIR}"
echo "CLASSES_DIR: ${CLASSES_DIR}"
echo "  TEMP_FILE: ${TEMP_FILE}"
echo

# 如果源码目录不存在，则退出程序
if [ ! -d "${SRC_DIR}" ]
then
    echo "ERROR: ${SRC_DIR} is not a directory."
    echo
    exit 1
fi

# 查找所有 .java 文件，并将文件名保存至临时文件
# 1. 首先进入源码目录
cd $SRC_DIR
# 2. 找到所有以 .java 结尾的文件名，并判断该文件是不是普通文件（排除目录）
for filename in $(find . -name "*.java")
do
    # 如果是普通文件，则将文件名保存至临时文件
    if [ -f "${filename}" ]
    then
        echo $filename >> $TEMP_FILE
    fi
done

# 将文件名列表保存至变量
readonly FILE_LIST=$(cat $TEMP_FILE)

# 如果文件列表为空，则退出程序
if [ "${FILE_LIST}" == "" ]
then
    echo "ERROR: There is no java file in ${SRC_DIR} directory."
    echo
    exit 1
fi

# 开始编译
# 1. 首先删除原有文件
rm -rf $CLASSES_DIR
# 2. 创建一个空目录
mkdir -p $CLASSES_DIR
# 3. 编译（此处可以根据实际需要添加其他参数）
javac $FILE_LIST -d $CLASSES_DIR

# 打印已经编译的文件名列表
echo "Compiled file list:"
echo
cat $TEMP_FILE
echo

# 删除临时文件
rm -rf $TEMP_FILE

# 编译完成，退出程序
exit
```

将以上文件内容保存至项目根目录下，并命名为 build.sh，然后执行以下命令给该文件添加可执行权限：

```bash
chmod +x build.sh
```

然后执行 build.sh 文件即可编译所有源文件：

```bash
./build.sh
```

本文完。
