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