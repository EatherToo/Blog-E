## react源码阅读笔记：一、关于 React.createElement

函数定义

```js
export function createElement(type, config, children) { ... }
```



1. `React.createElement`干了点啥

   **创建了一个`ReactElement`类型的对象**

   `ReactElement`的构造函数需要一些必须的参数

   ```js
   return ReactElement(
       type,
       key,
       ref,
       self,
       source,
       ReactCurrentOwner.current,
       props,
     ) 
   ```

   关于`ReactCurrentOwner.current`的说明

   > Keeps track of the current owner.
   > The current owner is the component who should own any components that are currently being constructed.

   ---

   >```
   >追踪当前所有者
   >当前所有者是所有的正在构建的组件的根组件
   >```
   >
   >

   `ReactElement` 是啥????

2. 创建过程是啥样子的

   1. 关于`type`

      `type`可能是一个 原生的 html 标签字符串，也有可能是一个`ReactElement`，或者`React Fragment` 类型的对象
      
   2. 关于`config`

      1. 四个特殊的属性

         1. `key`
         2. `ref`
         3. `self`
         4. `source`

         如果config中存在有效的这四个属性，则这些属性会被传递到`ReactElement`的构造函数中，否则传递的值是`null`

      2. 其他属性

         config中的其他属性会被保存到`props`对象中，然后传递到`ReactElement`的构造函数中

   3. 关于`children`

      `createElement`函数的参数个数是有可能大于**三**个的，从第三个参数后的所有参数都是`children`，`React`会将所有的`children`元素合并为一个`children`数组，并挂载到`props`上面。
      
      ```js
      // Children can be more than one argument, and those are transferred onto
        // the newly allocated props object.
        const childrenLength = arguments.length - 2;
        if (childrenLength === 1) {
          props.children = children;
        } else if (childrenLength > 1) {
          const childArray = Array(childrenLength);
          for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
          }
          if (__DEV__) {
            if (Object.freeze) {
              Object.freeze(childArray);
            }
          }
          props.children = childArray;
        }
      ```
      
   4. 处理元素的默认属性
   
      对于`type`为`ReactElement`，或者`React Fragment`的情况，元素会自带一些默认属性，这些默认属性也要挂载到`props`上去

