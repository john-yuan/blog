---
layout: post
title: Docker 常用操作笔记
category: docker
tags: docker
---

Docker 常用操作笔记：端口映射，登录容器，容器内访问宿主主机端口，Dockerfile 编写，日志查看，文件夹映射。

<!--more-->

## 一、端口映射

将宿主主机的端口映射到容器内部端口，以 redis 为示例：

```bash
docker run -p 9527:6379 --name redis-example -d redis
```

以上命令启动一个 redis 容器，并将宿主主机的 9527 端口映射到容器的 6379 端口，可用以下命令可以查看容器运行情况：

```bash
docker container ls
```

如果宿主主机安装了 redis 客户端，可以使用以下命令测试 9527 端口是否可以正常使用：

```bash
./redis-cli -p 9527
```

## 二、登录容器

首先通过以下命令找到需要登录的容器的 ID：

```bash
docker container ls
```

此处以上一节创建的 redis 容器为例子，该容器的 ID 为 `574ba89e8d4e`，使用以下命令登录该容器：

```bash
docker exec -it 574ba89e8d4e /bin/bash
```

登录容器以后，可以使用以下命令连接容器内运行的 redis：

```bash
redis-cli
```

## 三、容器内访问宿主主机端口

保持上一节容器登录状态，使用以下命令连接暴露在宿主主机 9527 端口上的 redis 服务器：

```bash
redis-cli -h 172.17.0.1 -p 9527
```

IP 地址 `172.17.0.1` 是 docker 在宿主上主机创建的一个网卡，使用这个地址我们可以访问宿主主机上暴露的端口。一般情况下为 `172.17.0.1`，如果不确定可以查看宿主主机网卡配置（ifconfig），并查看名为 `docker0` 的网卡的 IP 地址。

> 这个网卡在 linux 环境下可用，在 macOS 下不可用，此处不讨论 macOS 系统的解决方法。

利用这个方式，我们可以在一个容器内访问另一个容器暴露在宿主主机端口上的服务。比如我们有两个容器，一个是 redis 服务，另一个是 web 服务器。我们可以在 web 服务器容器内访问 redis 容器提供的 redis 服务。

## 四、Dockerfile 编写

本小节以一个 node WEB 应用为例演示如何编写 Dockerfile，首先创建一个临时目录并初始化项目：

```bash
cd /tmp
mkdir example-node-server
cd example-node-server
npm init -y
npm i express --registry=https://registry.npm.taobao.org
```

然后添加一个 `server.js` 文件，并输入以下内容：

```js
const express = require('express')
const app = express()

app.get('/hello', (req, res) => {
  const log = req.method + ' /hello ' + new Date().toISOString()
  console.log(log)
  res.send('hello')
})

app.listen(8080, () => {
  console.log('Listening on http://localhost:8080')
})
```

此时项目内文件结构如下：

```text
- node_modules
- package-lock.json
- package.json
- server.js
```

然后再添加一个 Dockerfile，输入以下内容：

```dockerfile
# 基于 node:12 基础继续创建一个容器
FROM node:12

# 创建一个目录存放应用代码
RUN mkdir -p /srv/server

# 将 Dockerfile 所在目录的所有文件拷贝到容器内的 /srv/server 目录下
COPY . /srv/server

# 将工作目录切换到 /srv/server 目录
WORKDIR /srv/server

# 安装应用所需所有依赖
RUN npm i --registry=https://registry.npm.taobao.org

# 暴露 8080 端口
EXPOSE 8080

# 指定容器启动时运行的命令
CMD ["node", "./server.js"]
```

以上 Dockerfile 会将应用内所有文件拷贝到容器内，包括 `node_modules` 文件夹，这不是我们想要的结果，因为这个文件夹是安装依赖时自动生成的，而且可能包含非常多的文件，从而导致拷贝时间很长。

我们可以通过以下方式将 `node_modules` 排除在拷贝的文件内。

添加一个 `.dockerignore` 文件，并输入以下内容：

```dockerignore
node_modules
```

现在项目内的文件如下：

```text
- .dockerignore
- Dockerfile
- node_modules
- package-lock.json
- package.json
- server.js
```

然后在项目文件夹内运行以下命令创建镜像：

```bash
# 根据当前文件夹下的 Dockerfile 创建镜像
# 并命名为 example-node-server
# 指定使用宿主主机网络（host）
docker build . --tag example-node-server --network host
```

> 注意：如果没有使用 `--network host` 参数，可能会导致 `npm install` 失败。我在编写本文时没有使用此参数，导致 build 过程一直卡死，直到报 `EAI_AGAIN` 错误，构建失败并退出。

构建完成后，使用以下命令运行容器：

```bash
# 基于 example-node-server 镜像启动一个容器
# -d 后台运行
# -p 将宿主主机的 8000 端口映射到容器内的 8080 端口
# --name 将容器命名为 my-node-server
docker run -d -p 8000:8080 --name my-node-server example-node-server
```

启动完成后，可以使用以下命令测试容器内的 WEB 服务是否可用：

```bash
curl http://localhost:8000/hello
```

容器操作相关命令：

```bash
# 杀死容器
docker container kill [容器 ID 或者名称]

# 停止容器
docker container stop [容器 ID 或者名称]

# 启动容器
docker container start [容器 ID 或者名称]

# 重启容器
docker container restart [容器 ID 或者名称]

# 删除容器
docker container rm [容器 ID 或者名称]
```

## 五、日志查看

使用以下命令可以查看容器内的日志：

```bash
docker logs [容器 ID 或者名称]
```

以上一节的 `my-node-server` 为例子，运行：

```bash
docker logs my-node-server
```

输出：

```text
Listening on http://localhost:8080
GET /hello 2021-06-26T02:34:28.170Z
```

## 六、文件夹映射

每个容器内的文件系统都是独立的，当容器被删除的时候，容器运行过程中产生的文件也会被删除。我们可以将宿主主机的文件夹映射到容器内的文件夹，并将容器运行时生成的文件保存在这个文件夹下，这样即使容器被删除，容器运行时生成的文件也可以被保存下来。

我们仍然以上面的 `example-node-server` 为例子，将 `server.js` 文件内容更新如下：

```js
const express = require('express')
const fs = require('fs')
const app = express()

app.get('/hello', (req, res) => {
  const log = req.method + ' /hello ' + new Date().toISOString()

  fs.appendFile('/data/logs/access.log', log + '\n', (err) => {
    if (err) {
      console.error(err)
      res.send('Error: failed to write log')
    } else {
      console.log(log)
      res.send('hello')
    }
  })
})

app.listen(8080, () => {
  console.log('Listening on http://localhost:8080')
})
```

> 在上面的代码中，我们将访问日志保存在 `/data/logs` 目录下的 `access.log` 文件中。

运行以下命令：

```bash
# 停止之前启动的服务器
docker container kill my-node-server

# 删除之前的容器
docker container rm my-node-server

# 重新构建镜像
docker build . -t example-node-server --network host
```

然后重新启动容器，并设置挂载目录：

```bash
# 在宿主主机上创建文件夹
mkdir -p /data/my-node-server/logs

# 启动容器并将该文件夹映射到容器内的 /data/logs 目录
docker run -d -v /data/my-node-server/logs:/data/logs -p 8000:8080 --name my-node-server example-node-server
```

测试是否成功：

```bash
curl http://localhost:8000/hello
cat /data/my-node-server/logs/access.log
```

输出结果：

```text
GET /hello 2021-06-26T03:58:45.917Z
```

现在，即使 `my-node-server` 容器被删除，日志文件仍然被永久保存在 `/data/my-node-server/logs` 目录下。

本文完。