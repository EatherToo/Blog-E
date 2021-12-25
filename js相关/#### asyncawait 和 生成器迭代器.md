#### async/await 和 生成器/迭代器

1. 迭代器

   - 实现Iterable 接口就可以让一个对象变成可迭代对象
   - 自定义迭代器
     - 实现`[Symbol.iterator]`方法
     - 实现`next`方法，这里要注意的是：next方法是迭代器工厂函数返回的对象中持有的，而非被迭代对象持有的
       - `next`方法返回一个对象包含两个属性`done`和`value`
     - return方法，当内置语言结构在发现还有更多汁可以迭代，但不会消费这些值时，会自动调用return方法
       - return方法是可选的，所以不是所有迭代器都可以关闭（比如数组迭代器）
       - 给一个不可迭代对象实例添加return方法并不会使之子啊被调用时被关闭
     - 原则：迭代器实例之间一定是没有相互联系的

2. 生成器

   1. 函数名称前加一个 * 表示它是生成器

   2. 调用生成器函数会产生一个生成器对象，**生成器对象实现了Iterator和接口**

   3. 生成器对象**一开始**是处于**暂停执行**的状态的，**调用next方法**后就会让生成器**开始或恢复执行**

   4. **生成器函数的返回值**是next函数返回值中的**value**属性

   5. yield关键字可以让生成器停止和开始执行，生成器函数在遇到 yield 关键字之前会正常执行。遇到这个关键字后，执行会停止，函数作用域的状态会被保留，**yield生成的值会出现在next函数返回值的value属性中**

   6. next函数传入的参数会成为对应的yield的值，**但是第一个next除外，因为第一个next没有对应任何一个yield**

   7. `* yield`增强yield的行为，使yield能够迭代一个可迭代对象

      例: 

      ```js
      // 等价的 generatorFn：
      // function* generatorFn() { 
      // for (const x of [1, 2, 3]) { 
      // yield x; 
      // } 
      // } 
      function* generatorFn() { 
      yield* [1, 2, 3]; 
      }
      
      let generatorObject = generatorFn(); 
      for (const x of generatorFn()) { 
       console.log(x); 
      } 
      // 1 
      // 2 
      // 3
      ```

   8. 生成器具有三个方法：next、return、throw

3. #### 使用generator模拟async/await

   1. async/await用法不多说，详情看MDN

   2. 要实现类似的功能大概是这样一种形式

      ```js
      const getRes = () => {
        return Promise.resolve(100)
      }
      
      function * gen() {
        const res = yield getRes(); // 这里getRes()这个函数返回的是一个Promise
        console.log(res) // 但是这里要直接打印出来Promise的最终结果
      }
      ```

      如果像下面一样直接运行，只会得到`undefined`

      ```js
      const g = gen()
      g.next()
      g.next() // console.log(res)会打印undefined
      ```

      所以我们得像个办法使res的值变成promise的结果

      先来把每个next打印出来看看

      ```js
      const g = gen()
      console.log(g.next(), 'next 1') // { value: Promise { 100 }, done: false } next 1
      console.log(g.next(), 'next 2') // { value: undefined, done: true } next 2
      ```

      第一次运行`next`函数直接得到了promise对象，这是因为

      > **yield生成的值会出现在next函数返回值的value属性中**

      然后又因为

      > **next函数传入的参数会成为对应的yield的值**

      所以我们可以这样来执行这个生成器

      ```js
      const g = gen()
      const p = g.next().value
      p.then(res => g.next(res)) // console.log(res) 会打印 100
      ```

      ooooook！模拟成功！

      但是这样还不够优雅

      需要再解决两个问题：

      - 多个`yield`的情况
      - `yield`后面跟的不是Promise的情况

      举个例子:

      ```js
      const getRes = (param) => {
        return Promise.resolve(param)
      }
      
      function * gen() {
        const res1 = yield getRes('第一个yield')
        console.log(res1)
        const res2 = yield getRes('第二个yield')
        console.log(res2)
        const res3 = yield '第三个yield'
        console.log(res3)
        const res4 = yield getRes('第四个yield')
        console.log(res4)
      }
      ```

      对于这种情况，其实也很简单，只需要让这个生成器自动执行起来，然后每个`next`函数都传入合适的参数就行了

      最简单的做法就是一个while循环

      ```js
      let nextRes = g.next()
      while (!nextRes.done) {
        if (nextRes.value instanceof Promise) {
          console.log(nextRes)
          nextRes.value.then((res) => {
            nextRes = g.next(res);
          })
        } else {
          nextRes = g.next(nextRes.value)
        }
      }
      ```

      代码跑一下，嘿嘿😁，死循环了，因为`then`的回调是异步的，所以里面那个`next`永远都不会执行，那`nextRes`也就永远都不会改变，所以就死循环了，换一种方法，递归吧:

      ```js
      
      // 生成器实例
      const g = gen()
      
      /**
       * 自动运行生成器实例
       * @param {*} genRes 生成器实例
       */
      function autoRunGen(genRes) {
      
        /**
         * 继续往下执行的函数
         * @param {*} value 要传递给next函数的值
         * @returns 
         */
        function goNext(value) {
          const nextRes = genRes.next(value) // nextRes会获取到yield后表达式的值
          if(nextRes.done) { // 执行结束
            return nextRes.value
          } else {
            if (nextRes.value instanceof Promise) { // 得到promise就使用then
              nextRes.value.then(goNext)
            } else {
              goNext(nextRes.value)
            }
          }
        }
        goNext() // 不需要传递参数，因为第一次执行next函数是传入的参数是无效的
      }
      
      autoRunGen(g)
      
      
      // 打印结果
      // 第一个yield
      // 第二个yield
      // 第三个yield
      // 第四个yield
      ```

      ooooook，好像是完全模拟成功了的样子

      

      note: 那这里为啥不死循环呢

      因为执行到`nextRes.value.then(goNext)`这条语句的时候，当前正在执行的任务就已经执行完毕了，下一轮就该执行微任务队列中的消息了。

      

​		