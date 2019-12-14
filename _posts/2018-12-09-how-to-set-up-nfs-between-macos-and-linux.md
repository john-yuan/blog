---
layout: post
title: 在 Mac OS 和 Linux 之间通过 NFS 设置共享文件夹
categroy: linux
tags: nfs linux macos
---

为了方便在 Mac OS 与 Linux 间进行文件共享，本文介绍如何在 Mac OS 系统上配置 NFS 服务器，以及如何在 Linux 系统上挂载 Mac OS 系统上共享出来的文件夹。

<!--more-->

## 1. 确定 Mac OS 和 Linux 的 IP 地址

本文中 Mac OS 的 IP 地址为：

```
192.168.56.1
```

Linux 主机的 IP 地址为：

```
192.168.56.102
```

## 2. 在 Mac OS 设置共享文件夹

因为所有操作都要在 root 权限下进行，所以我们使用以下命令切换到 root 用户：

```bash
sudo su root
```

然后创建一个文件夹存放我们想共享的文件，我们将在后面的操作中把这个文件夹共享给 Linux 系统：

```bash
mkdir -p /srv/nfs/share
```

在该共享文件夹下创建一个测试文件：

```bash
echo "test" >> /srv/nfs/share/test.txt
```

为了将上述文件夹共享给 Linux (192.168.56.102），我们需要编辑 /etc/exports 文件（如果不存在则手动创建该文件），添加以下内容：

```
/srv/nfs/share -mapall=john 192.168.56.102
```

> 其含义为允许 192.168.56.102 通过 NFS 挂载本机上的 /srv/nfs/share 文件夹，并将在该系统上创建的文件的用户设置为 Mac OS 上的 john 用户（当在 Mac OS 上查看该文件时）。

保存上述文件后，使用以下命令重启 NFS 服务：

```bash
nfsd restart
```

然后使用命令检查配置是否正确：

```bash
showmount -e
```

如果配置正确，输出内容会包含以下信息：

```
/srv/nfs/share 192.168.56.102
```

至此，Mac OS 系统上共享文件夹设置完毕。

## 3. 在 Linux 上安装 NFS 服务并挂载共享文件夹

本文示例 Linux 系统为 CentOS 7，以下操作均在该系统中完成。

首先安装 NFS 服务：

```bash
# 安装 NFS
yum install nfs-utils
# 启动 NFS
systemctl start nfs
# 设置开机启动 NFS
systemctl enable nfs
```

启动 NFS 后，我们使用 showmount 查看 192.168.56.1 上共享的文件夹：

```bash
showmount -e 192.168.56.1
```

如果一切正常的话将会看到共享文件夹的信息：

```
/srv/nfs/share 192.168.56.102
```

然后我们使用以下步骤挂载该共享文件夹到 /mnt/macos：

```bash
# 创建 /mnt/macos 目录
mkdir -p /mnt/macos
# 挂载共享目录
mount -t nfs -o nolock,tcp 192.168.56.1:/srv/nfs/share /mnt/macos
# 现在进入 /mnt/macos 目录即可查看到共享的文件
cd /mnt/macos
```

如果需要卸载共享目录，需使用以下命令：

```bash
umount /mnt/macos
```

本文完。
