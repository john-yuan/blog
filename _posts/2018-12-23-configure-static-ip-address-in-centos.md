---
layout: post
title: CentOS 7 如何配置静态 IP 地址
category: linux
tags: centos 静态IP
---

我为虚拟机中的 CentOS 7 配置了两块网卡。一块为 NAT 模式，用于连接因特网下载软件。另一块为 Host-Only 模式，用于与宿主主机通信。但在系统安装完成后，发现 Host-Only 这块网卡的 IP 地址并不固定，因此需要我们手动进行相关配置。本文为相关操作记录，方便以后查阅。

<!--more-->

> 本文所演示的系统为 CentOS 7，虚拟机为 VirtualBox。


由于系统没有自带 ifconfig 命令，因此我们需要安装一个软件包：

```bash
# 这个软件包包含了 ifconfig 命令
yum install net-tools
```

安装完成后就可以使用 ifconfig 命令查看网卡信息了：

```bash
# 查看网卡信息
ifconfig
```

我的机器的输出信息如下：

```text
enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.2.15  netmask 255.255.255.0  broadcast 10.0.2.255
        inet6 fe80::dcdf:cf7e:4f58:4e65  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:7a:a9:16  txqueuelen 1000  (Ethernet)
        RX packets 477  bytes 52787 (51.5 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 505  bytes 40765 (39.8 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

enp0s8: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.56.101  netmask 255.255.255.0  broadcast 192.168.56.255
        inet6 fe80::a00:27ff:fee7:4553  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:e7:45:53  txqueuelen 1000  (Ethernet)
        RX packets 1367  bytes 169513 (165.5 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 823  bytes 143798 (140.4 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 32  bytes 2592 (2.5 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 32  bytes 2592 (2.5 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

其中网卡 enp0s3 (IP 地址 10.0.2.15) 即 NAT 网卡。enp0s8 (IP 地址为 192.168.56.101) 为 Host-Only 网卡。

现在进入以下目录查看上面的网卡是否拥有其对应的配置文件：

```bash
# 进入网卡配置文件目录
cd /etc/sysconfig/network-scripts/
# 查看此目录中的文件
ls
```

配置文件的命名规则为：ifcfg-网卡名称。比如 enp0s3 这块网卡的配置文件为 ifcfg-enp0s3。

在我的 `/etc/sysconfig/network-scripts` 目录中，并没有找到名为 ifcfg-enp0s8 这个配置文件。说明这块网卡没有一个固定的配置，它的 IP 是随机分配的，也就是说下次我们启动这个系统后，它的 Host-Only 这块网卡的 IP 地址可能发生变化。

为此，我们手动创建一个配置文件，其文件名为 ifcfg-enp0s8，文件内容如下：

```text
# 使用静态 IP 地址
BOOTPROTO=static
# 设置 IP 地址
IPADDR=192.168.56.101
# 网卡名称
NAME=enp0s8
# 设备名称
DEVICE=enp0s8
# 开机启动
ONBOOT=yes
```

保存后，使用以下命令可重启该网卡：

```bash
# 关闭 enp0s8 这个设备
ifdown enp0s8
# 开启 enp0s8 这个设备
ifup enp0s8
# 查看网络信息
ifconfig
```

配置完成了，那么，如何验证我们的配置的确固定了 IP 地址呢？因为以上的输出根本就看不出差别（更改前后的 IP 地址都一样）。为此，我们可以编辑配置文件，故意将 IP 地址更换为另外一个（比如 192.168.56.102），然后再重启网卡，并查看该网卡的 IP 地址是不是和我们预先设置的一样，如果是，则说明验证通过。

本文完。
