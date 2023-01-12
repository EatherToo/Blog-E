#### vue和react的区别

1. 数据流
  vue组件内部数据直接更改data就会触发视图更新
  react强调数据的不可变性，需要手动调用数据更改方法才会引发视图更新

  - react不监听数据的更改，因为数据的更改都是手动去做的啊，直接在setState的同时去做操作就可以了
  - React监听状态更改可以使用useState和compnentWill/DidUpdate生命周期函数

  - vue是单向数据流，不是双向绑定，vue的双向绑定只是语法糖
  - 关于响应式更新
    vue2.x和vue3是不一样的，vue2使用Object.defineProperty劫持对象的get和set，vue3直接使用了Proxy

2. mixins和HoC
3. 组件通信，其他的都差不多，除了Provide/inject和Context，以及VUE有事件
4. 模版渲染和jsx，vue组件import后还要挂载
5. vuex和Redux
   1. vuex：store直接挂载到了this上
   2. vuex和redux的区别
   3. vuex实际上是更新数据，redux实际上是更换数据
6. Redux的Provide干了啥？
   1. 使用usememo定义了一个一个contextValue，返回store和subscription对象，触发更改的对象是store
   2. 返回Context.Provider组件，contex是传递进来的组件上下文
   3. （Context在组件树之间进行数据传递，provide组件允许消费组件去监听value的更改）


  