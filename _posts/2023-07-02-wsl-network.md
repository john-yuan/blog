---
layout: post
title: WSL 子系统访问 Windows 网络
tags: wsl
snippet: true
---

本文介绍如何配置 Windows 防火墙以允许子系统访问以及如何在 WSL 子系统中获取 Windows 系统 IP。

<!--more-->

配置 Windows 防火墙以允许子系统访问：

```bash
# 在 Windows Powershell 中运行
New-NetFirewallRule -DisplayName "WSL" -Direction Inbound -InterfaceAlias "vEthernet (WSL)" -Action Allow
```

> 参考 [https://github.com/microsoft/WSL/issues/4585](https://github.com/microsoft/WSL/issues/4585)

在子系统获取 Windows IP：

```bash
# 在子系统终端中运行
cat /etc/resolv.conf |grep -oP '(?<=nameserver\ ).*'
```
