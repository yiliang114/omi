## omix

> 极小却精巧的小程序框架，对小程序入侵性几乎为零

## 5分钟精通 

### API

#### 去中心化 API

* `create.Page(option)`             创建页面，option.context 页面级别共享
* `create.Component(option)`        创建组件
* `this.oData`                      操作页面或组件的数据（会自动更新视图）
* `this.context`                    页面注入的 context，页面和页面所有组件可以拿到
* `create.mitt()`                   事件发送和监听器

#### 中心化 API

* `create(store, option)`      创建页面， store 可跨页面共享
* `create(option)`             创建组件
* `this.store.data`            全局 store 和 data，页面和页面所有组件可以拿到， 操作 data 会自动更新视图
* `create.emitter`                  事件发送和监听器，不同于 mitt() 每次会创建新的实例，emitter 是全局唯一，可以用于跨页面通讯

### 实战去中心化 API

#### 页面

```js
import create from '../../utils/create'

const app = getApp()

create.Page({
  //页面级别上下文，跨页面不共享
  context: {
    abc: '公共数据从页面注入到页面的所有组件'
    //事件发送和监听器,或者 create.mitt()
    emitter: create.emitter
  },
  data: {
    motto: 'Hello World',
    userInfo: { },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  ...
  ...
  onLoad: function () {

    ...
    ...
    ...
    //监听事件
    this.context.emitter.on('foo', e => console.log('foo', e) )
    setTimeout(() => {
      this.oData.userInfo = {
        nickName: 'dnt',
        avatarUrl: this.data.userInfo.avatarUrl
      }
    }, 2000)


    setTimeout(() => {
      this.oData.userInfo.nickName = 'dntzhang'
    }, 4000)
  }
})
```

这里需要注意，oData 必须直接操作 data 里定义好的数据才能直接更新视图，比如 `nickName` 一开始没有定义好，更新它是不会更新视图，只有通过下面代码执行之后，才能更新 nickName，因为 userInfo 的变更会自动监听 userInfo 内的所有属性：

```js
this.oData.userInfo = {
  nickName: 'dnt',
  avatarUrl: this.data.userInfo.avatarUrl
}
```

当然你也可以直接在 data 里声明好：

```js
  data: {
    motto: 'Hello World',
    userInfo: { nickName: null },
    ...
```

#### 组件

```js
import create from '../../utils/create'

create.Component({
  data: {
    a: { b: Math.random() }
  },

  ready: function () {
    //这里可以获取组件所属页面注入的 store
    console.log(this.context)
    //触发事件
    this.context.emitter.emit('foo', { a: 'b' })
    setTimeout(()=>{
      this.oData.a.b = 1
    },3000)
  },
})
```

#### 数组

```js
import create from '../../utils/create'
import util from '../../utils/util'

create.Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.oData.logs = (wx.getStorageSync('logs') || []).map(log => {
      return util.formatTime(new Date(log))
    })

    setTimeout(() => {
      this.oData.logs[0] = 'Changed!'
    }, 1000)

  }
})
```

这里需要注意，改变数组的 length 不会触发视图更新，需要使用 size 方法:

```js
this.oData.yourArray.size(3)
```

#### 其他

```js
this.oData.arr.push(111) //会触发视图更新
//每个数组的方法都有对应的 pureXXX 方法
this.oData.arr.purePush(111) //不会触发视图更新

this.oData.arr.size(2) //会触发视图更新
this.oData.arr.length = 2 //不会触发视图更新

```

####  函数属性

```js
data: {
    motto: 'Hello World',
    reverseMotto() {
      return this.motto.split('').reverse().join('')
    }
},
```

其中 reverseMotto 可以直接绑定在 wxml 里，motto 更新会自动更新 reverseMotto 的值。

#### mitt 语法

```js
const emitter = mitt()

// listen to an event
emitter.on('foo', e => console.log('foo', e) )

// listen to all events
emitter.on('*', (type, e) => console.log(type, e) )

// fire an event
emitter.emit('foo', { a: 'b' })

// working with handler references:
function onFoo() {}
emitter.on('foo', onFoo)   // listen
emitter.off('foo', onFoo)  // unlisten
```

[详细参见 mitt github](https://github.com/developit/mitt)

omix 为 mitt 新增的语法：

```js
emitter.off('foo') // unlisten all foo callback
```

### 实战中心化 API

定义 store:

```js
export default {
  data: {
    logs: []
  }
}
```

定义页面:

```js
import create from '../../utils/create'
import util from '../../utils/util'
import store from '../../store'

create(store, {
  onLoad: function () {
    this.store.data.logs = (wx.getStorageSync('logs') || []).map(log => {
      return util.formatTime(new Date(log))
    })


    setTimeout(() => {
      this.store.data.logs[0] = 'Changed!'
    }, 1000)


    setTimeout(() => {
      this.store.data.logs.push(Math.random(), Math.random())
    }, 2000)

    setTimeout(() => {
      this.store.data.logs.splice(this.store.data.logs.length - 1, 1)
    }, 3000)
  }
})
```

```html
<view class="container log-list">
  <block wx:for="{{store.logs}}" wx:for-item="log">
    <text class="log-item">{{index + 1}}. {{log}}</text>
  </block>
  <view>
    <test-store></test-store>
  </view>
</view>
```

可以看到里面使用 test-store 组件, 看下组件源码:

```js
import create from '../../utils/create'

create({
  
})
```

```html
<view class="ctn">
  <view>
    <text>Log Length: {{store.logs.length}}</text>
  </view>
</view>
```

喜欢中心化还是喜欢去中心化任你挑选，或者同一个小程序可以混合两种模式。
<!-- 
## 原理

最开始 `omix` 打算使用 proxy，但是调研了下兼容性，还是打算使用 obaa 来进行数据变更监听。

因为小程序 IOS 使用内置的 jscore，安卓使用 x5，所以 Proxy 兼容性(IOS10+支持，安卓基本都支持)

![](https://github.com/Tencent/westore/raw/master/asset/ios.jpg)

实时统计地址：https://developer.apple.com/support/app-store/



```js
this.setData({
  logs: [1, 2, 3]
})
setTimeout(() => {
  this.setData({
    'logs[2]': null
  })
}, 2000)

setTimeout(() => {
  console.log(this.data.logs.length)
}, 3000)
```

#### 页面生命周期函数

| 名称 | 描述  |
| ------ | ------  |
| onLoad | 	监听页面加载	  |
| onShow | 监听页面显示	  |
| onReady | 监听页面初次渲染完成  |
| onHide | 监听页面隐藏	  |
| onUnload | 监听页面卸载  |

### 组件生命周期函数

| 名称 | 描述  |
| ------ | ------  |
| created | 	在组件实例进入页面节点树时执行，注意此时不能调用 setData	  |
| attached | 在组件实例进入页面节点树时执行	  |
| ready | 在组件布局完成后执行，此时可以获取节点信息（使用 SelectorQuery ）	  |
| moved | 在组件实例被移动到节点树另一个位置时执行	  |
| detached | 在组件实例被从页面节点树移除时执行  | -->


## MIT Lic
