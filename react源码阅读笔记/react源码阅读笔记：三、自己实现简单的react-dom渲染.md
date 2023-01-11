#### react 源码阅读笔记：三、自己实现简单的 react-dom 渲染

1. ###### 从初始入口文件开始

   用 CRA 工具创建一个 react 项目，入口文件（`index.js`）一般来说差不多长这样

   ```js
   import React, { Component } from 'react'
   import ReactDOM from './mockFiles/react-dom'
   import './index.css'
   // import App from './App';
   const FuncCom = () => {
     return (
       <div>
         <h1
           style={{
             color: 'blue',
           }}
         >
           函数组件
         </h1>
       </div>
     )
   }

   class ClassCom extends Component {
     render() {
       return (
         <h1
           style={{
             color: 'red',
           }}
         >
           类组件
         </h1>
       )
     }
   }

   ReactDOM.render(
     <div>
       <ClassCom />
       <h1>hello world!</h1>
       <h1>hello world2</h1>
       <FuncCom />
     </div>,
     document.getElementById('root')
   )
   ```

   所以，要实现一个 react dom 的渲染器，最主要的就是要实现`ReactDOM.render`函数。
   `render`函数接收三个参数(第三个参数我们可以暂时不关注)

   1. `element` 要渲染的元素
   2. `container` 要挂载的节点
   3. `callback` 渲染或更新后被执行的回调

粗略的看了一下源码，发现 render 函数调用的是`legacyRenderSubtreeIntoContainer`函数，字面意思就是渲染子树到容器中去，就喜欢这样清晰明了的命名。
`legacyRenderSubtreeIntoContainer`函数做的事情很简单：如果是初次渲染，调用`legacyCreateRootFromDOMContainer`函数创建根节点，然后调用`updateContainer`进行渲染；否则就直接调用`updateContainer`。

### TODO。。。
