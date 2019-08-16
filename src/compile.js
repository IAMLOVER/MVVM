// 负责解析模板内容

class Compile{
  // 参数一，是模板，参数二，是vue实例
  constructor(el,vm) {
    // el 是 new Vue 传递的选择器
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm 

    // 编译模板
    if(this.el) {
      // 1. 把el中的所有子节点都放入到内存中，fragment( 文档碎片 )
      let fragment = this.node2fragment(this.el)
      // 2. 在内存中编译fragment
      this.compile(fragment)
      // 3. 把fragment一次性的添加到页面中
      this.el.appendChild(fragment)
    }
  }

  // 核心方法
  node2fragment(node) {
    let fragment = document.createDocumentFragment()
    // 把el的所有子节点挨个添加到文档碎片中
    let childNodes = node.childNodes

    this.toArray(childNodes).forEach( node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  compile(fragment){
    let childNodes = fragment.childNodes
    this.toArray(childNodes).forEach(node => {
      // 编译子节点
      // 如果是元素，需要解析指令
      if(this.isElementNode(node)){
        this.compileElement(node)
      }
      // 如果是文本节点，需要解析插值表达式
      if(this.isTextNode(node)){
        this.compileText(node)
      }

      // 如果当前节点还有子节点，需要递归的解析
      if(node.childNodes && node.childNodes.length > 0){
        this.compile(node)
      }
    })
  }

  // 解析html标签
  compileElement(node){
    // 1. 获取到当前节点下的所有属性
    let attributes = node.attributes
    this.toArray(attributes).forEach( attr => {
    // 2. 解析vue的指令(所有以v-开头的属性)
      let attrName = attr.name
      if(this.isDirective(attrName)){
        let type = attrName.slice(2)
        let attrVaule = attr.value
        // 如果是v-on指令
        if(this.isEventDirective(type)){
          // 给当前元素注册事件即可
          CompileUtil['eventHandler'](node,this.vm,type,attrVaule)
        } else{
          CompileUtil[type] && CompileUtil[type](node,this.vm,attrVaule)
        }
      }
    })
  }
  
  // 解析文本节点
  compileText(node){
    CompileUtil.mustache(node,this.vm)
  }
  // 工具方法
  toArray(likeArray){
    return [].slice.call(likeArray)
  }
  
  isElementNode(node) {
    // nodeType 节点的类型，1：元素节点； 3：文本节点
    return node.nodeType === 1
  }

  isTextNode(node){
    return node.nodeType === 3
  }

  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  isEventDirective(attrName) {
    return attrName.split(":")[0] === "on"
  }

}

let CompileUtil = {
  mustache(node,vm){
    let txt = node.textContent
    let reg = /\{\{(.+)\}\}/
    if(reg.test(txt)){
      let expr = RegExp.$1.trim()
      node.textContent = txt.replace(reg,this.getVNValue(vm,expr))
      new Watcher(vm,expr,newValue => {
        node.textContent = txt.replace(reg,newValue)
      })
    }
  },
  text(node,vm,attrVaule){
    node.textContent = this.getVNValue(vm,attrVaule)
    // 通过watcher对象，监听attrValue的数据变化，一旦变化了，执行回调
    window.watcher = new Watcher(vm,attrVaule,newValue => {
      console.log('我会执行吗')
      node.textContent = newValue
    })
  },
  html(node,vm,attrVaule){
    node.innerHTML = this.getVNValue(vm,attrVaule)
    new Watcher(vm,attrVaule,newValue => {
      node.innerHTML = newValue
    })
  },
  model(node,vm,attrVaule){
    let self = this
    node.value = this.getVNValue(vm,attrVaule)
    node.addEventListener('input',function(){
      self.setVmValue(vm,attrVaule,this.value)
    })
    new Watcher(vm,attrVaule,newValue => {
      node.value = newValue
    })
  },
  eventHandler(node,vm,type,attrVaule){
    let eventType = type.split(":")[1]
    let fn = vm.$methods && vm.$methods[attrVaule]
    if(eventType && fn){
      node.addEventListener(eventType,vm.$methods[attrVaule].bind(vm))
    }
  },
  getVNValue(vm,attrVaule){
    // 获取到data中的数据
    let data = vm.$data
    attrVaule.split('.').forEach(item => {
      data = data[item]
    })
    return data
  },
  setVmValue(vm,expr,value){
    let data = vm.$data
    let arr = expr.split('.')
    arr.forEach((item,index) => {
      // 如果index是最后一个
      if(index < arr.length -1){
        data = data[item]
      }else{
        data[item] = value
      }
    })
  }
}