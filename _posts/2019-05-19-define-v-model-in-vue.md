---
layout: post
title: Vue 中如何自定义 v-model
category: JavaScript
tags: vue v-model
---

在 Vue 中我们可以通过 v-model 来创建数据的双向绑定，默认情况下，只有 `input`、`textarea` 和 `select` 等元素支持 v-model。在 Vue 2.2.0+ 中，我们可以[自定义组件的 v-model][vue-v-model]。本文通过一个简单的示例来演示如何自定义组件的 v-model。

[vue-v-model]: https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model

<!--more-->

## 组件描述

在这个示例中，我们将着手开发一个选择题组件 `answer-list`，这个组件具有以下属性：

* `value`: `String` 类型，表示当前选中的答案对应的 value；
* `options`: `Array` 类型，一个数组，里面的每个元素为一个对象，保存着选项的 value 和描述；

在实际使用中，我们不会直接通过 `value` 设置当前选中的答案，而是通过 `v-model` 来进行数据双向绑定。也就是说当用户点击不同的选项时，父组件中对应数据也会自动跟着变化。这样一来，我们就不用通过调用子组件的方法或者监听相应的事件来获取最新的答案，从而减轻了使用成本，也让代码更加简洁明了。以下为使用示例：

```html
<answer-list v-model="answer" :options="options" />
```

## 具体实现

以下为实现源码：

```html
<div id="app">
    <div>
        <p>以下哪个选项是正确的（ {{ "{{" }} answer }} ）</p>
        <answer-list v-model="answer" :options="options" />
    </div>
</div>
<script>
    // 定义 answer-list 组件
    Vue.component('answer-list', {
        // 关键：定义 v-model
        // 对应的属性为：value
        // 监听的事件为：change
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            // 当前的答案
            value: {
                type: String,
                default: null
            },
            // 答案列表
            options: {
                type: Array,
                required: true
            }
        },
        methods: {
            // 当点击某个选项时调用
            onClickOption: function (value) {
                // 关键：手动触发 change 事件
                this.$emit('change', value);
            }
        },
        template: `
            <div>
                <div
                    v-for="option in options"
                    :key="option.value"
                    @click=onClickOption(option.value)
                >
                    <code v-if="value === option.value">[v]</code>
                    <code v-else>[ ]</code>
                    <span>{{ "{{" }} option.value }}. {{ "{{" }} option.description }}</span>
                </div>
            </div>
        `
    });

    // 使用 answer-list 组件
    var app = new Vue({
        el: '#app',
        data: {
            answer: 'B',
            options: [
                {
                    value: 'A',
                    description: '1 + 1 = 1'
                },
                {
                    value: 'B',
                    description: '1 + 1 = 2'
                },
                {
                    value: 'C',
                    description: '1 + 1 = 3'
                },
                {
                    value: 'D',
                    description: '1 + 1 = 4'
                }
            ]
        }
    });
</script>
```

你可以[点击此处查看运行效果][demo]，本文完。

[demo]: /shared/demo/vue-define-v-model.html
