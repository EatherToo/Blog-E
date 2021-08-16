#### Vue的初始化过程


##### 一、Vue的构造函数

  打开`src/core/instance/index.js`文件

  ```js
  import { initMixin } from './init'
  import { stateMixin } from './state'
  import { renderMixin } from './render'
  import { eventsMixin } from './events'
  import { lifecycleMixin } from './lifecycle'
  import { warn } from '../util/index'

  // Vue的构造函数
  function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword')
    }
    // 根据options初始化
    this._init(options)
  }

  initMixin(Vue)
  stateMixin(Vue)
  eventsMixin(Vue)
  lifecycleMixin(Vue)
  renderMixin(Vue)

  export default Vue
  ```

  Vue的构造函数很简单，仅仅是使用`_init`函数进行了初始化，然后下面几行`Mixin`对`Vue`的构造函数进行了扩展。
  1. **initMixin**：混入了`init`函数
     
      **`initMixin`** 函数位于`src/core/instance/init.js`文件，其作用就是在Vue的原型上添加`_init`函数。



  i. `_init`函数先使用`mergeOptions`和`resolveConstructorOptions`函数合并了构造函数默认的`options`

      ```js
      
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
          options || {},
            vm
        )
      
      ```
  ii. 然后做了如下操作

    ------
    ```js
      /**
       * 1. 挂载Vue实例的父节点$parent
       * 2. 将本实例push到父节点的$children中
       * 3. 挂载Vue实例的$root节点
       * 4. 初始化children, refs, _watcher, _inactive, _directInactive,
       *     _isMounted, _isDestroyed, _isBeingDestroyed的值
       */
      initLifecycle(vm)
      /**
       * 获取父组件中附加到此实例上的事件，然后更新组件的事件监听
       */
      initEvents(vm)
      /**
       * 初始化渲染函数
       * 1. 挂载插槽内容，slot和scopedslot到实例上
       * 2. 绑定createElement函数到实例上（_c函数和$createElement函数，具体分析后面再说）
       * 3. 将$attrs和$listeners属性变温响应式属性
       */
      initRender(vm)
      /**
       * 调用beforeCreate钩子函数
       */
      callHook(vm, 'beforeCreate')
      // 初始化inject属性
      initInjections(vm) // resolve injections before data/props
      /**
       * 按照顺序依次
       * 1. 初始化props
       * 2. 初始化methods
       * 3. 初始化data
       * 4. 初始化computed
       * 5. 初始化watch
       */
      initState(vm)
      // 初始化provide
      initProvide(vm) // resolve provide after data/props
      /**
       * 调用created钩子函数
       */
      callHook(vm, 'created')
    ``` 
  iii. 若el选项存在，通过el挂载Vue实例

    ```js
      if (vm.$options.el) {
        vm.$mount(vm.$options.el)
      }
    ```

  2. **stateMixin**：扩展了实例状态相关的属性
     1. 代理了`$data`和`$props`属性
        ```js
          Object.defineProperty(Vue.prototype, '$data', dataDef)
          Object.defineProperty(Vue.prototype, '$props', propsDef)
        ```
     2. 挂载`$set`、`$delete`、`$watch`函数
        ```js
        Vue.prototype.$set = set
        Vue.prototype.$delete = del
        
        Vue.prototype.$watch = function (
          expOrFn: string | Function,
          cb: any,
          options?: Object
        ): Function {
          const vm: Component = this
          if (isPlainObject(cb)) {
            return createWatcher(vm, expOrFn, cb, options)
          }
          options = options || {}
          options.user = true
          const watcher = new Watcher(vm, expOrFn, cb, options)
          if (options.immediate) {
            const info = `callback for immediate watcher "${watcher.expression}"`
            pushTarget()
            invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
            popTarget()
          }
          return function unwatchFn () {
            watcher.teardown()
          }
        }
        ```

  ###### 下面的mixin夜做着类似的工作，就不多加赘述了, 具体的分析以后再来搞
  3. **eventsMixin**: 扩展事件相关函数
     1. `$on`
     2. `$off`
     3. `$emit`
     4. `$once`
  4. **lifecycleMixin**: 扩展生命周期相关函数
     1. `Vue.prototype._update` 函数
     2. `$forceUpdate`
     3. `$destroy`
  5. **renderMixin**: 扩展渲染相关函数
     1. 扩展运行时的工具函数
     2. 扩展`$nextTick`函数
     3. 扩展`_render`函数

#### 二、说一下`_init`中的`$mount`过程
  `$mount`函数实际上就是`src/core/instance/lifecycle.js`中的`mountComponent`函数

  1. 获取要更新的渲染函数`_update`
  2. 新建一个Watcher对象，`before`中调用`beforeUpdate`钩子
  3. 渲染更新完成后调用`mounted`钩子
此处涉及到了具体的patch、渲染过程以及响应式原理，先挖个坑，后面再填