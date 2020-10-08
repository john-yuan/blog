---
layout: post
title: 开发环境常用配置
category: linux
tags: linux mariadb apache php
---

## .editorconfig

```
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

## .vimrc

```
set ai
set et
set ts=4
set sts=4
syntax on
```

## Git alias

```
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.cl log --oneline
```
