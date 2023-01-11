1. `__patch__`

2. `Watcher`

   构造函数中会调用 this.get 函数，this.get 调用了 getter 函数，也就是传进来的 updateComponent 函数

   1. mountCompont 会新建一个 Watcher 对象，构造函数中传入 vm 实例，updateComponent 函数 noop before 选项调用 beforeUpdate
   2. `updateComponent`函数封装的是 `vm._update(vm._render(), hydrating)` 函数
      1. `_render`函数返回的是 VNode
      2. `_update`函数来自于 `lifecycleMixin`
         1. update 中初始化时先插入再删除
         2. todo
