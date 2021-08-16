#### 从initProps开始理解vue2的响应式原理



在vue2中初始化一个vue实例会先调用`this._init(options)`方法(代码位于`src/core/instance/index.js`)，`this._init`函数则是在`initMixin`函数(代码位于`src/core/instance/init.js`)中扩展而来，`_init`函数中对组件状态值的初始化，调用的是`initState`函数。

```js
export function initMixin (Vue: Class<Component>) {
	// .......省略其他代码
  
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
    callHook(vm, 'beforeCreate')
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
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')
	
	// .......省略其他代码
}
```



`initState`函数位于`src/core/instance/state.js`文件中，它最开始初始化的就是`props`

```js
export function initState (vm: Component) {
  // 初始化watcher数组
  vm._watchers = []
  // 获取options
  const opts = vm.$options
  // 初始化props
  if (opts.props) initProps(vm, opts.props)
  // 初始化methods
  if (opts.methods) initMethods(vm, opts.methods)
  // 初始化data
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```





##### 现在从`initProps`函数开始来理解一下vue2的响应式原理



`initProps`遍历`options`中的`props`，并将`prop key`缓存起来，然后获取`prop`的值，获取值的时候没有直接获取，而是调用了`validateProp`函数

1. `validateProp`函数接受四个参数，返回对应的prop的值

   ```js
   export function validateProp (
     key: string, // prop key
     propOptions: Object, // 所有的props配置（这里怀疑尤大写错了？应该是propsOptions吧）
     propsData: Object, // 传递到此实例的prop数据
     vm?: Component
   ): any
   ```

   `propsOptions`来自于`this.$options.props`，而此处的`props`是经过`normalizeProps`函数规整化后的`props`

   `propOptions`(不是`propsOptions`）的完整定义是：

   ```js
   type PropOptions = {
     type: Function | Array<Function> | null,
     default: any,
     required: ?boolean,
     validator: ?Function
   };
   ```

   **`validateProp`主要干了这么几件事情：**

   i. 获取prop的完整配置，获取传递进来的prop值
   ii. 当*`prop`期望类型中有`boolean`*：
   
   	-  若*`prop`值缺失且prop配置中没有`default `   =>  `value`值为`false`*
   	-  *若获取到的`value`值为空字符串或与`key`同名且`prop`期待类型中没有`string`或者`boolean`优先级更高*    =>  *value值为true*
   
   iii. 经过以上两步操作后如果value值依然为`undefined`，**则从`propOption`中获取`default`值并`observe`它**
   
   ```js
   export function validateProp (
     key: string,
     propOptions: Object,
     propsData: Object,
     vm?: Component
   ): any {
     // 获取属性的完整配置
     const prop = propOptions[key]
     // 值是否缺失
     const absent = !hasOwn(propsData, key)
     // 获取属性值
     let value = propsData[key]
     // boolean casting：布尔值构造
     const booleanIndex = getTypeIndex(Boolean, prop.type)0
     // prop期望类型中有boolean
     if (booleanIndex > -1) {
       // prop值缺失且prop配置中没有default，value值为false
       if (absent && !hasOwn(prop, 'default')) {
         value = false
       } else if (value === '' || value === hyphenate(key)) {
         // only cast empty string / same name to boolean if
         // boolean has higher priority
         const stringIndex = getTypeIndex(String, prop.type)
         // prop期待类型中没有string或者boolean优先级更高
         if (stringIndex < 0 || booleanIndex < stringIndex) {
           value = true
         }
       }
     }
     // check default value  检测默认值
     if (value === undefined) {
       value = getPropDefaultValue(vm, prop, key)
       // since the default value is a fresh copy,
       // make sure to observe it.
       const prevShouldObserve = shouldObserve
       toggleObserving(true)
       observe(value)
       toggleObserving(prevShouldObserve)
     }
     if (
       process.env.NODE_ENV !== 'production' &&
       // skip validation for weex recycle-list child component props
       !(__WEEX__ && isObject(value) && ('@binding' in value))
     ) {
       assertProp(prop, key, value, vm, absent)
     }
     return value
   }
   ```
   
2. **接下来说一下`obsever`函数**

   `observe`函数的内容很简单，对传递进来的值做了几个判断：

   1. 非对象或值是`VNode`类型 ==> 不做任何处理
   2. 值被`observe`过 ==> 返回 `value.__ob__`
   3. 非服务端渲染，值为数组或者朴素对象，且可扩展，且不是vue实例 ==> 新建一个`Observer`实例并返回

   关于`Observer类`：

    1. 构造函数：接手一个`value`参数，然后保存了`value`值，创建了一个`Dep`对像，初始化了`vmCoun`t值，如果`value`是数组，在构造函数中将会扩展数组的七个改变数组值的方法（`'push', 'pop',   'shift',  'unshift',  'splice',   'sort',  'reverse'`），使数组的修改响应式。对数组中的值也会都被递归执行一遍`observer`函数。对于普通的对象，构造函数会遍历`value`中所有值并对他们进行`defineReactive`。

    2. 源码：

       ```js
       export class Observer {
         value: any;
         dep: Dep;
         vmCount: number; // number of vms that have this object as root $data
       
         constructor (value: any) {
           this.value = value
           this.dep = new Dep()
           this.vmCount = 0
           def(value, '__ob__', this)
           // 扩展数组的'push', 'pop',   'shift',  'unshift',  'splice',   'sort',  'reverse'
           if (Array.isArray(value)) {
             if (hasProto) {
               protoAugment(value, arrayMethods)
             } else {
               copyAugment(value, arrayMethods, arrayKeys)
             }
             this.observeArray(value) // 遍历数组中的值
           }  else {
             this.walk(value) // 遍历对象中的值
           }
         }
           // ·········省略·········
       }
       ```

       

   3. `Observer`类的构造函数中还新建了一个`Dep`对象用作依赖收集，这个后面再讲

   4. 对于普通的`js`对象，`Observer`遍历时会对对象中的属性调用`defineReactive`函数

      `defineReactive`函数的作用就是让数据变成响应式数据，实现方式就是使用了`Object.defineProperty`函数对对象属性的`get`和`set`做拦截，在`get`时进行依赖收集（`dep.depend()`），在`set`时通知响应的组件更新。

      ```js
      	let childOb = !shallow && observe(val) // 获取子observer（若当前的val时一个对象）
        Object.defineProperty(obj, key, {
          enumerable: true,
          configurable: true,
          get: function reactiveGetter () {
            const value = getter ? getter.call(obj) : val
            if (Dep.target) { // 当前依赖存在
              dep.depend() // 添加当前的observer到此时的Dep.target上
              if (childOb) {
                // 子对象和子数组也做相同的操作
                // 若此时的值是一个对象，上面已经observe了这个对象，等于是递归observe了整个对象树，所以子对象也必然会有__ob__
                childOb.dep.depend()
                if (Array.isArray(value)) {
                  dependArray(value)
                }
              }
            }
            return value
          },
          set: function reactiveSetter (newVal) {
            const value = getter ? getter.call(obj) : val // 获取当前值
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
              return
            }
            /* eslint-enable no-self-compare */
            if (process.env.NODE_ENV !== 'production' && customSetter) {
              customSetter()
            }
            // #7981: for accessor properties without setter
            if (getter && !setter) return
            if (setter) {
              setter.call(obj, newVal)
            } else {
              val = newVal
            }
            childOb = !shallow && observe(newVal) // 重新observe新的值
            dep.notify() // 通知更新
          }
        })
      ```

      关于`Dep.target`的问题留个坑，后面再来填

3. 回到`state.js`文件，`validateProp`函数调用完成后，对`props`中的`key`，这里又调用了一次`defineReactive`函数

   和`validateProp`函数中`observe(value)`中不同的是，这里是对props中的值做了响应式的处理，而`validateProp`式对`props.value`中的值做了响应式处理

4. `proxy(vm, _props, key)`

   此函数将`props`中的`key`代理到了`vue`实例的`_props`属性上了
