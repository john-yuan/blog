---
layout: post
title: JavaScript 中对象的属性描述符
category: JavaScript
tags: javascript defineProperty
---

本文主要讨论 JavaScript 中对象的属性描述符及 Object.defineProperty() 的使用方法，以及属性描述符中的 configurable 的具体作用。

<!--more-->

## 默认的属性描述符

在 JavaScript 中，即使我们没有使用 `Object.defineProperty()` 方法来为某个对象定义某个属性，每个对象的每个属性也都会拥有一个默认的属性描述符。所谓的属性描述符其实也是一个 JavaScript 对象，用来描述它所对应的属性可以支持的操作。

我们可以通过 `Object.getOwnPropertyDescriptor` 来获取对象上某个属性的属性描述符。比如：

```js
var object = {};

// 直接添加属性，不使用 Object.defineProperty()
object.title = 'My first object.';

// 获取 object 上 title 属性的属性描述符，返回的内容如下：
// {
//     configurable: true,
//     enumerable: true,
//     value: "My first object.",
//     writable: true
// }
Object.getOwnPropertyDescriptor(object, 'title');
```

## 自定义属性描述符

当我们直接个一个对象添加一个属性时，该属性会得到一个默认的属性描述符。我们也可以通过 `Object.defineProperty()` 方法来自定义对象的属性描述符。比如：

```js
var object = {};

// 给 object 添加属性 title，将 writable 设置为 false
Object.defineProperty(object, 'title', {
    configurable: true,
    enumerable: true,
    value: "My first object.",
    writable: false
});

// true
console.log(object.title === 'My first object.');

// 不会报错，但是赋值操作不会成功
// 因为 title 属性的 writable 为 false
// 表示 title 属性的值不可以被重写
object.title = 'New title of the object.';

// 依然是 true
console.log(object.title === 'My first object.');
```

在上面的代码中，我们通过 `Object.defineProperty()` 给 object 对象添加了一个 title 属性，并将它的属性描述符中的 writable 字段设置为 false，表示不可以给 object 的 title 属性设置其他值。

## configurable 属性

当我们把一个属性的 writable 设置为 false 时，我们不能直接给该属性重新赋值。但是我们可以将该属性从对象中删除，以及可以通过 `Object.defineProperty()` 重新定义该属性，并在此时修改这个属性的值。比如：

```js
var object = {};

// 定义 title 属性
Object.defineProperty(object, 'title', {
    configurable: true,
    enumerable: true,
    value: "My first object.",
    writable: false
});

// true
console.log(object.title === 'My first object.');

// 重新定义 title 属性，并修改它的值
Object.defineProperty(object, 'title', {
    configurable: true,
    enumerable: true,
    value: "New title of the object.",
    writable: false
});

// true
console.log(object.title === 'New title of the object.');

// 我们可以删除这个属性
delete object.title;

// true
console.log(object.title === undefined);
```

如果你想阻止上面这种情况发生，可以在定义属性时将属性描述符中的 configurable 设置为 false。这样一来，这个属性的属性描述符将无法被修改，且这个属性也无法从对象中被删除。比如：

```js
var object = {};

// 定义 title 属性，将 configurable 设置为 false
Object.defineProperty(object, 'title', {
    configurable: false,
    enumerable: true,
    value: "My first object.",
    writable: false
});

// 不会报错，但是操作返回值为 false，此属性无法被删除
delete object.title;

// true
console.log(object.title === 'My first object.');

// 尝试重新定义 title 属性，会报错：
// Uncaught TypeError: Cannot redefine property: title
Object.defineProperty(object, 'title', {
    configurable: true,
    enumerable: true,
    value: "New title of the object.",
    writable: false
});
```

本文完，参考文章 [Object.defineProperty() - JavaScript \| MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。

