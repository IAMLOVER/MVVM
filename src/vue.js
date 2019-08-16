  // 定义一个类，用于创建vue实例
class Vue {
  constructor (options = {}) {
    // 给vue实例增加属性
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods


    new ObServer(this.$data)

    // 把data中的所有数据代理到vm上
    this.proxy(this.$data)
    this.proxy(this.$methods)

    // 如果指定了el参数，对el进行解析

    if (this.$el){
      // compile负责解析模板的内容
      // 需要： 模板和数据
      new Compile(this.$el,this)
    }
  }

  proxy(data){
    Object.keys(data).forEach(key => {
      Object.defineProperty(this,key, {
        enumerable: true,
        configurable: true,
        get(){
          return data[key]
        },
        set(){
          if(data[key] !== newValue){
            return
          }else{
            data[key] = newValue
          }
        }
      })
    })
  }
}