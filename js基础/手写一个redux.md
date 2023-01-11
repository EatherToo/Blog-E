一个redux应该返回三个东西

1. `getState`获取store中的值
2. `dispatch`触发更新
3. `subscribe`订阅更新

然后来一步步实现这个`redux`

##### 一、创建存储状态的store

1. 新建一个函数`createStore`，先接受一个参数`reducer`，`reducer`的注释如下

   > A function that returns the next state tree, given the current state tree and the action to handle.
   >
   > 说人话就是：reducer是一个函数，这个函数接受两个参数：一个参数是当前的state tree，另一个参数是action，action是用来控制state tree变更的。然后reducer这个函数返回的东西是state tree的下一个状态，也就是被action变更后的状态。

2. 根据上面所说，`reducer`根据`action`来更新状态树，所以自然而然就应该联想到，`dispatch`是用`reducer`来更新状态树的


然后第一版代码如下：

```js
function createStore(reducer) {
  // 保存状态树
	let currentState;
  
  // 获取状态树
  function getState() {
    return currentState;
  }
  
  // 更新订阅
  function dispatch(action) {
    currentState = reducer(currentState, action);
    
    return action;
  }
  
  return {
    getState,
    dispatch
  }

}
```

3. 还缺了个东西订阅`state tree`的更新

   这个东西很好解决，简简单单一个发布订阅模式，想外部暴露订阅的方法，然后`dispatch`的时候调用订阅的时候传进来的方法就行了

第二版代码如下：

```js
export default function createStore(reducer) {
  // 保存状态树
	let currentState;
  // 爆粗订阅传进来的函数
  let currentListeners = [];


  // 获取状态树
  function getState() {
    return currentState;
  }

  // 触发更新
  function dispatch(action) {
    // 获取新的状态树
    currentState = reducer(currentState, action);
    // 运行订阅时传进来的函数
    currentListeners.forEach(listener => listener());
    return action;
  }

  // 订阅更新
  function subscribe(listener) {
    // push到当前订阅函数的队列中
    currentListeners.push(listener);
    // 返回一个函数清除订阅
    return () => {
      const index = currentListeners.indexOf(listener);
      currentListeners.splice(index, 1);
    }
  }
  return {
    getState,
    dispatch,
    subscribe
  }
}
```

就这么几行树就实现了一个最简单的`redux`！！！！！！

##### 二、初始化store

最容易想到的方法就是直接传入一个预设的state tree的初始值，redux的官方实现中的确有这样做

