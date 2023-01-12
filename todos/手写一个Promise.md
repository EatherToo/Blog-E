1. 新建一个函数参数为： 一个参数为两个函数`resolve` `reject`的函数
2. 声明两个值：成功执行时要传递的值，失败执行时要传递的值
3. 声明一个值表示promise的三个状态：`pending` `fulfilled` `rejected`
4. 执行成功后执行`then`, 执行失败后执行`catch`