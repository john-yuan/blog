---
layout: post
title: "Echarts 气泡图: 在 tooltip 中显示重叠区域所有数据信息"
category: JavaScript
tags: echarts
---

最近在项目中需要用到气泡图，气泡图中的每个气泡直径大小由数据的某个维度值确定，而且气泡个数通常在 200 左右。这导致图上有很多大大小小的圆圈重叠在一起，并且存在大圆圈完全盖住小圆圈的情况。由于 echarts 的 tooltip 是根据 item（也就是图中的圆圈）触发的，这就导致了被盖住的圆圈永远无法显示 tooltip。虽然可以通过配置将 tooltip 的 trigger 设置为 x 轴，但操作起来仍不顺手。本文介绍了一种方法，用于检测气泡图重叠区域，可以实现在用户鼠标移动到圆圈重叠区域时，在 tooltip 中显示当前鼠标下所有圆圈的信息。本文所讨论的 echarts 版本为 5.5.1。

<!--more-->

实现效果如下（具体实现<a href="/shared/demo/echarts-bubble-chart-overlap.html" target="_blank">请打开此页面</a>并查看源代码，或<a href="https://github.com/john-yuan/blog/blob/master/shared/demo/echarts-bubble-chart-overlap.html" target="_blank">点击此处前往 Github 查看源代码</a>）：

<iframe
    class="iframe"
    height="384px"
    src="/shared/demo/echarts-bubble-chart-overlap.html"
></iframe>
