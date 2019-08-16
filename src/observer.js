// 给data里面的属性增加getter setter
 class ObServer{
   constructor(data){
     // 获得到data
     this.data = data
     console.log(data)
     this.walk(data)
   }
   walk(data){
     console.log(data)
     // 首先对data进行判断
     if(!data || typeof data !== 'object'){
       return
     }
     // 遍历data里面的所有属性
     Object.keys(data).forEach(item => {
       console.log(data[item])
       // 给所有属性设置 getter 和 setter
       this.defineReactive(data,item,data[item])
       console.log(data)
       // 如果属性是一个对象，需要对对象里的每一个属性，同样进行设置getter 和 setter
       this.walk(data[item])
     })
   }

   // data中的每一个数据都应该维护一个dep对象
   // dep保存了所有订阅了该数据的订阅者
   defineReactive(obj,item,value){
     let that = this
     let dep = new Dep()
    Object.defineProperty(obj,item,{
      enumerable: true,
      configurable: true,
      get(){
        // 如果Dep.target中有watcher对象，存储到订阅者数组中
        Dep.target && dep.addSub(Dep.target)
        console.log(dep)
        return value
      },
      set(newValue){
        if(value === newValue){
          return
        }
        value = newValue
        // 如果newValue 是一个对象，我们需要对新修改的属性也设置getter 和 setter。做劫持操作 
        that.walk(newValue)
        
        // 需要调用watcher的update方法
        dep.notify()
      }
    })
   }
 }