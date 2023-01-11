### new 运算符新建一个对象的过程

1. 创建了一个对象，此对象绑定到构造函数的`this`上
2. 将此对象的`__proto__`设置为构造函数的`prototype`
3. 通过执行构造函数，对对象进行初始化操作
4. 返回`this`指向的新对象

- 通过new操作符，实例和构造函数通过原型链链接了起来

- 如果构造函数中返回原始值，则这个返回值将毫无意义
- 构造函数如果返回值为对象，那么这个返回值会被正常使用


若自己实现一个`new`功能，则必须要满足上面的条件

```js

/**
 * @param constructorFn 构造函数
 * @param ...args 构造函数的参数
 * */
function newMethod(constructorFn, ...args) {
  // 1. 创建一个空对象，构造函数的this将是此对象
  that = {}
  // 2. 执行构造函数
  const rtp = constructorFn.call(that, ...args)
  // 3. 判断构造函数返回值类型
  return typeof rtp === 'object' ? rtp : that

}

```