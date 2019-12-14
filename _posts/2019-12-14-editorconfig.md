---
layout: post
title: EditorConfig 配置文件
category: development
tags: editorconfig
---

为了保证整个项目缩进风格统一，每次新建项目时，我往往会添加一个 `.editorconfig` 文件，但总是记不住里面的配置项名称，导致每次都要去找[官方文档][editorconfig]或者查看以前的项目，所以在此记录一个，希望以后找起来会快一点。

<!--more-->

以下是我常用的设置，支持的配置项请查看[此文档](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)或者[官网][editorconfig]。

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true

[*.{html,js,css}]
tab_width = 4
indent_size = 4
indent_style = space
trim_trailing_whitespace = true
```

下面是[官网][editorconfig]给出的一个示例：

```ini
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true

# Matches multiple files with brace expansion notation
# Set default charset
[*.{js,py}]
charset = utf-8

# 4 space indentation
[*.py]
indent_style = space
indent_size = 4

# Tab indentation (no size specified)
[Makefile]
indent_style = tab

# Indentation override for all JS under lib directory
[lib/**.js]
indent_style = space
indent_size = 2

# Matches the exact files either package.json or .travis.yml
[{package.json,.travis.yml}]
indent_style = space
indent_size = 2
```

[editorconfig]: https://editorconfig.org/
