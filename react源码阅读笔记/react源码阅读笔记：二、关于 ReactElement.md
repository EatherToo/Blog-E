## react源码阅读笔记：二、关于 React.createElement

函数定义

```js
const ReactElement = function(type, key, ref, self, source, owner, props) { ... }
```

1. `ReactElement`是个啥
   
 ```js
  /**
    * Factory method to create a new React element. This no longer adheres to
    * the class pattern, so do not use new to call it. Also, instanceof check
    * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
    * if something is a React Element.
    *
    **/
 ```

  根据注释说明：`ReactElement`是一个创建React元素的工厂方法，简言之就是React类型的元素对象就是`ReactElement`,再具体一点的东西到后面再进行分析。

2. 关于`ReactElement`方法的参数
    `type, key, ref, owner, props`不多说
    1. `self`
      用来检测`this`和`owner`的不同，用在dev环境里面，调用`React.createElement`的时候从`config`中取出来的。
    2. `source`
      用来标注文件名，行号和其它信息的参数，也只用在dev环境里面

3. 关于此函数的返回值
  `ReactElement`的返回值是一个如下的对象 
  ```js
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };
  ```
  `$$typeof`用来标识此对象是否是一个`ReactElement`元素
