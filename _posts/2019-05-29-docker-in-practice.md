---
layout: post
title: 使用 Docker 创建一个最简单的 Node.js 应用镜像
category: docker
tags: docker
---

最近在项目中用到了服务端渲染，需要搭建 Node.js 服务器。在项目部署时，需要向运维人员提供源码和 Dockerfile，以便生成镜像来部署。以前对 Docker 只是简单的了解，并没有实战应用，恰巧借此机会深入研究一下。本文涵盖了 Docker 的安装、国内源的配置以及一个创建 Node.js 应用镜像的例子。

<!--more-->

## 一、环境说明

本文使用的 Linux 系统为 CentOS 7，安装于本地虚拟机中，IP 地址为 `192.168.56.103`，操作用户为 `root`。

## 二、安装 Docker

安装 Docker 相当简单，主要[参考这篇文档][install-docker-ce]。本文做简要总结，只需执行以下命令即可完成安装，若未成功，请参考原文。

```sh
# 安装相关依赖
yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加 Dokcer 源
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装最新版本 Docker
yum install docker-ce docker-ce-cli containerd.io

# 查看 Docker 版本
docker -v

# 启动 Docker
systemctl start docker

# 如果需要开机启动 Docker，请执行以下命令
systemctl enable docker
```

[install-docker-ce]: https://docs.docker.com/install/linux/docker-ce/centos/#install-docker-ce

## 三、使用阿里云仓库

以 Dockerfile 创建镜像时需要联网从仓库下载基础镜像文件，默认的官方仓库在国内访问很不稳定，此处将仓库替换为阿里云提供的镜像仓库。首先将以下内容保存到 `/etc/docker/daemon.json` 中（如果没有这个文件请手动创建）：

```json
{
  "registry-mirrors": ["https://yourcode.mirror.aliyuncs.com"]
}
```

然后使用以下命令重启 Docker：

```sh
# 重启 Docker
systemctl restart docker
```

## 四、Hello, World

安装和配置完 Docker 后，可以运行官方提供的 `hello-world` 镜像来检查安装是否成功。执行以下命令即可：

```sh
# 运行 hello-world 镜像
docker container run hello-world
```

以上命令会尝试在本地查找 `hello-world` 这个镜像，如果本地没有找到，会先从远程仓库中下载后再运行。如果成功，会输出类似以下的信息：

```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

## 五、示例：创建应用镜像

### 应用说明

假设有一个简单的 Express 应用，其目录结构如下（为了简洁，这里没有使用 package.json）：

```
docker-demo-node-server
 ├─ server.js
 └─ Dockerfile
```

其中 `server.js` 内容如下：

```js
const express = require('express');
const app = express();

app.get('/greeting', (req, res) => {
    res.send('Hello, docker!');
});

app.listen(4003, () => {
    console.log('http://127.0.0.1:4003');
});
```

以上代码定义了一个接口 `GET /greeting`，当我们通过浏览器访问这个地址时，会返回 `Hello, docker!`。

当我们部署上面的应用时，需要以下几个必要条件：

1. Node 环境：可执行的 `node` 命令
2. 源代码：也就是 `server.js`
3. 应用依赖：也就是 `express`

我们将在下一小节描述如何编写一个满足以上要求的 Dockerfile。

### Dockerfile

当我们通过 Dockerfile 创建镜像时，通常是在现有的镜像基础进行扩展，然后形成自己的镜像，而不是从零开始。Docker 官方提供很多了可靠的基础镜像，Node.js 官方也为我们提供了各个版本的基础镜像。下面，我们将基于 Node.js 10.x 的版本创建自己的应用镜像。首先，在工程根目录下创建一个名为 Dockerfile 的文本文件，其内容如下：

```docker
# 基于 Node.js 10.x 镜像进行创建
FROM node:10

# 创建 /srv/node/docker-demo-node-server 目录，应用将部署在这个目录下
RUN mkdir -p /srv/node/docker-demo-node-server

# 将当前目录下的 server.js 拷贝到容器的 /srv/node/docker-demo-node-server 目录下
# 备注：Dockerfile 与 server.js 在同一个目录下
COPY server.js /srv/node/docker-demo-node-server

# 将工作目录切换至 /srv/node/docker-demo-node-server
WORKDIR /srv/node/docker-demo-node-server

# 使用 npm 安装 express
RUN npm install express --registry=https://registry.npm.taobao.org

# 开发 4003 端口
EXPOSE 4003

# 运行容器时执行以下命令
# 备注：如果有多个 CMD，只有最后一个会生效
CMD [ "node", "./server.js" ]
```

### 创建镜像

编写好 Dockerfile 后，进入 Dockerfile 所在目录，执行以下命令即可创建镜像：

```sh
# 从当前目录（.）创建一个镜像，命名为 docker-demo-node-server
docker build -t docker-demo-node-server .
```

创建镜像成功后，使用以下命令即可查看构建好的镜像：

```sh
# 查看镜像列表
docker image ls
```

### 运行镜像

使用以下命令运行镜像，并将容器的 4003 端口映射到本机的 8080 端口：

```sh
docker container run -p 8080:4003 -it docker-demo-node-server
```

镜像运行成功后，访问 `http://192.168.56.103:8080/greeting` 即可看到相应结果。

### 停止镜像

如需停止镜像，首先在控制台分别按下 `Ctrl-P` 和 `Ctrl-Q`。然后使用以下命令查找容器 ID：

```sh
# 查看正在运行的容器列表
docker container ls
```

假设我们的容器 ID 为 `4b45f742ee9f`，使用以下命令即可停止容器：

```sh
# 停止运行 ID 为 4b45f742ee9f 的容器
docker container kill 4b45f742ee9f
```

## 六、镜像的保存与加载

我们可以将通过 Dockerfile 生成的镜像保存到一个 tar 文件中，并在其他机器上加载并运行此镜像。使用以下命令即可将指定的镜像保存到 tar 文件中：

```sh
# 将 docker-demo-node-server 镜像保存到 docker-demo-node-server.tar 中
# 备注：时间较长，耐心等待 ^_^
docker save docker-demo-node-server > docker-demo-node-server.tar
```

镜像保存成功后，我们可以将其拷贝到最终的部署机器上进行加载和运行，使用以下命令即可加载打包好的镜像：

```sh
# 加载镜像
# 备注：文件 docker-demo-node-server.tar 保存在当前目录下
docker load < docker-demo-node-server.tar

# 加载镜像完成后，可以使用以下命令查看镜像列表
docker image ls
```

## 七、参考文档

* [Install Docker CE](https://docs.docker.com/install/linux/docker-ce/centos/#install-docker-ce)
* [docker save](https://docs.docker.com/engine/reference/commandline/save/)
* [docker load](https://docs.docker.com/engine/reference/commandline/load/)
