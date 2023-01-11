React16之前virtualDOM的比对采用循环加递归的方式，diff一旦开始，则无法终止，如果页面中涉及了大量的组件计算，就会长时间占用主线程，造成用户输入行为，动画等被延迟。

React 16后的解决方案
1. 利用浏览器空闲时间执行任务，拒绝耗时任务长时间占用主线程
2. virtualDOM的比对放弃递归全部采用循环，因为循环是可以中断的
3. 将任务拆解，拆成一个个力度尽可能小的任务（也就是fiber的来源？？？？）

实现思路
vitualDOM算法被分为两个部分
1. 构建（fiber）：可以理解为diff过程，可以中断
2. 提交（commit）：可以理解为真是dom的渲染过程，不可以中断

DOM初始化渲染：virtualDOM -> Fiber -> Fiber[] -> DOM

DOM更新：newFiber vs oldFiber -> Fiber[] -> DOM

在使用React编写用户界面的时候，仍然使用JSX语法，babel会将JSX语法转换为React.createElement()方法的调用，返回virtualDOM对象。然后开始执行第一个阶段，构建Fiber对象，这里采用了循环的方式遍历virtualDOM对象，并找到每一个virtualDOM对象内部的virtualDOM对象，并逐一为其构建Fiber对象，Fiber对象也是JS对象；当所有Fiber对象构建完成，会将他们全部放入一个数组中Fiber[]，然后开始第二个阶段，循环Fiber[]，将Fiber对象中描述的节点信息操作，应用到真实DOM当中；

**requestIdleCallback**函数很关键，这是在浏览器空闲时间执行函数

fiber tree和virtual tree结构一样，只是携带信息不一样

1. 找到根节点优先级最高的workInProgress tree，取其待处理的节点（代表组件或DOM节点）
2. 检查当前节点是否需要更新，不需要的话，直接到4
3. 标记一下（打个tag），更新自己（组件更新props，context等，DOM节点记下DOM change），进行reconcileChildren并返回workInProgress.child
4. 不存在workInProgress.child,证明是叶子节点，向上收集effect
5. 把child或者sibling当做nextUnitWork,进入下一个工作循环。如果回到了workInProgress tree的根节点，则工作循环结束
6. 进入commit阶段
