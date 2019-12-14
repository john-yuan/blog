---
layout: post
title: Java Proxy 使用笔记
category: java
tags: Java Proxy InvocationHandler
---

Java 的代理和反射等功能是框架开发中常用的功能，虽然我们不太可能自己开发框架，但熟悉这些技术能帮我更好的理解框架的运行原理。本文主要以 MyBatis 的 getMapper 方法为引子，提出两个问题并给出解决办法，从而演示 Java 中代理（Proxy）相关的 API 及功能。

<!--more-->

在 MyBatis 中，我们可以使用 getMapper 方法获取 Mapper 接口的实例并在该实例上调用接口定义的方法来查询数据，比如：

```java
UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
User user = userMapper.findUserById(1);
```

看了以上代码，可能会有以下两个疑问：

1. getMapper 方法怎么知道返回值类型为 UserMapper（此处没有使用强制类型转换）
2. getMapper 方法是如何创建 UserMapper 实例的（我们只是指定了接口，并没有提供实现类）

## 问题 1

关于第一个问题，我们只要使用 Java 的泛型即可，比如以下代码：

```java
package org.example.proxy.demo;

public class GenericTypeDemo {
    /**
     * 主函数
     */
    public static void main(String[] args) {
        Integer i = Integer.valueOf(1);
        Number d = GenericTypeDemo.transform(i, Number.class);
    }

    /**
     * 将 obj 转换为目标类型的实例
     * @param obj 需要转换的对象
     * @param cls 目标类型
     * @return 目标类型实例
     */
    public static <T> T transform(Object obj, Class<T> cls) {
        System.out.println("原始类型: " + obj.getClass().getName());
        System.out.println("目标类型: " + cls.getName());

        // 强制转换为目标类型，如果无法完成转换，会抛出运行时错误
        return (T) obj;
    }
}
```

输出结果为：

```text
原始类型: java.lang.Integer
目标类型: java.lang.Number
```

## 问题 2

第二个问题比较有意思，主要是利用了 Java 中的 Proxy。Proxy 类的静态方法 newProxyInstance 可以根据指定的接口列表创建一个对象。该方法的签名如下：

```java
Object newProxyInstance(ClassLoader loader,
                        Class<?>[] interfaces,
                        InvocationHandler handler);
```

该方法会返回一个对象，该对象实现了 interfaces 列表中指定的所有接口。其中 loader 是用来定义代理类的**类加载器**。interfaces 是接口列表，元素**必须是接口而不能为类**。handler 是用来分发目标对象方法调用的**调用处理器**。InvocationHandler 是一个接口，她包含一个 invoke 方法，该方法的签名如下：

```java
public Object invoke(Object proxy, Method method, Object[] args);
```

当我们在目标对象上调用某个方法时，handler 的 invoke 方法将会被调用，所以我们可以在 invoke 中通过判断参数的类型来处理代理逻辑。

现在回到第二个问题，我们可以使用以下代码来动态创建接口实例：

```java
package org.example.proxy.demo;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 *  一个用于演示的接口
 */
interface DemoInterface {
    void demoMethodOne();
    void demoMethodTwo(int i);
}

public class ProxyDemo {
    /**
     * 主函数
     */
    public static void main(String[] args) {
        DemoInterface demo = createInterfaceInstance(DemoInterface.class);

        demo.demoMethodOne();
        demo.demoMethodTwo(1);
    }

    /**
     * 动态创建接口实例并设置代理
     *
     * @param interfaceClass 接口的 Class 对象
     * @return interfaceClass 实例
     */
    public static <T> T createInterfaceInstance(Class<T> interfaceClass) {
        ClassLoader loader = interfaceClass.getClassLoader();
        Class<?>[] interfaces = new Class<?>[] { interfaceClass };

        // 创建一个 InvocationHandler
        InvocationHandler handler = new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) {
                System.out.println("被调用的函数为: " + method.getName());
                return null;
            }
        };

        // 创建代理对象
        Object proxy = Proxy.newProxyInstance(loader, interfaces, handler);

        // 将结果强制类型转换为目标类型
        return (T) proxy;
    }
}
```

输出结果为：

```text
被调用的函数为: demoMethodOne
被调用的函数为: demoMethodTwo
```

关于细节不在赘述，以上代码意图明显，详细请翻阅相关 API，本文完。
