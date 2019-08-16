// watcher
// 在自身实例化时往属性订阅器(dep)里面添加自己

// 自身必须有一个update()方法

// 待属性变动dep.notice()通知时，能调用自己身的update()方法，并触发compile中的绑定回调。

class Watcher{
  // 三个参数 vm实例，exp属性名，cb回调函数
  constructor(vm, exp,cb){
    this.vm = vm
    this.exp = exp
    this.cb = cb

    // this表示的就是新创建的watcher对象
    // 存储到Dep.target属性上
    Dep.target = this

    // 需要把exp的旧值给存储起来
    this.oldValue = this.getVNValue(vm,exp)

    // 清空Dep.target 
    Dep.target = null 
  }
  update(){
    // 对比exp是否发生变化，如果发生了改变就调用cb
    let oldValue = this.oldValue
    let newValue = this.getVNValue(this.vm,this.exp)
    if(oldValue != newValue){
      this.cb(newValue,oldValue)
    }
  }

  getVNValue(vm,attrVaule) {
    // 获取到data中的数据
    let data = vm.$data
    attrVaule.split('.').forEach(item => {
      data = data[item]
    })
    return data
  }
}

// dep对象用于管理所有的订阅者和通知这些订阅者
class Dep {
  constructor(){
    // 用于管理订阅者
    this.subs = []
  }

  // 添加订阅者
  addSub(watcher) {
    this.subs.push(watcher)
  }

  // 通知
  notify() {
    // 遍历所有的订阅者，调用watcher的update方法
    this.subs.forEach(sub => {
      sub.update()
    })

  }
}