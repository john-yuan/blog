---
layout: post
title: 我的 EditorConfig 配置文件
category: development
tags: editorconfig
snippet: true
---

我的 EditorConfig 配置文件。

<!--more-->

以下是我常用的设置，支持的配置项请查看[此文档](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)或者[官网][editorconfig]。

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
max_line_length = 0
trim_trailing_whitespace = true

[*.md]
max_line_length = 0
trim_trailing_whitespace = false

[COMMIT_EDITMSG]
max_line_length = 0
```

[editorconfig]: https://editorconfig.org/
