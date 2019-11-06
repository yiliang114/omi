[English](./README.md) | 简体中文 

<p align="center"><img src="https://tencent.github.io/omi/assets/omi-logo2019.svg" alt="omi" width="100"/></p>
<p align="center"><img src="https://tencent.github.io/omi/assets/omi-v6.jpg" alt="omi" width="1000"/></p>
<h2 align="center">Omi - 前端跨框架跨平台框架</h2>
<p align="center"><b>基于 Web Components 并支持 IE8+(omio)，小程序(omip) 和 任意前端框架集成</b></p>

## 快速概览

整个组件树共享数据，并且数据变更自动更新视图。

```jsx
import { define, render } from 'omi'

class Store {
  data = {
    count: 1
  }
  sub = () => {
    this.data.count--
  }
  add = () => {
    this.data.count++
  }
}

define('my-counter', _ => (
  <div>
    <button onClick={_.store.sub}>-</button>
    <span>{_.store.data.count}</span>
    <button onClick={_.store.add}>+</button>
  </div>
), {
    use: ['count'], 
    //或者使用 useSelf, useSelf 只会更新自身，不更新子组件
    //useSelf: ['count'], 
    css: `span { color: red; }`,
    installed() {
      console.log('installed')
    }
  })

render(<my-counter />, 'body', new Store)
```

* `<my-counter></my-counter>` 可以用于任意框架或者无框架，比如 `document.createElement('my-counter')`


你也可以使用 `useSelf`, `useSelf` 只会更新自身，不更新子组件。使用 `useSelf` 的时候在 JSX 里通过 `usingSelf` 访问对应属性。

你也可以通过 `compute` 去实现 `computed` 计算属性，比如:

```jsx
define('my-counter', _ => (
  <div>
    <button onClick={_.store.sub}>-</button>
    <span>{_.store.data.count}</span>
    <button onClick={_.store.add}>+</button>
    <div>Double: {_.computed.doubleCount}</div>
  </div>
), {
    use: ['count'],
    compute: {
      doubleCount() {
        return this.count * 2
      }
    }
  })
```

路径也是支持的，比如下面的例子:

```js
class Store {
  data = {
    list: [
      { name: { first: 'dnt', last: 'zhang' } }
    ]
  }
}

...
...

define('my-counter', _ => (
  ...
  ...
), {
    use: [
      'list[0].name', //可以通过 this.using[0] 访问
    ],
    compute: {
      fullName() {
        return this.list[0].name.first + this.list[0].name.last
      }
    }
  })
```

![](https://tencent.github.io/omi/assets/store.cn.jpg)

### 多个 store 注入

```jsx
import { define, render } from 'omi'

define('my-app', _ => {
  const store = _.store.storeA
  const { data, add, sub } = store
  return (
    <p>
      Clicked: {data.count} times
      <button onClick={add}>+</button>
      <button onClick={sub}>-</button>

      <div>
        {_.store.storeB.data.msg}
        <button  onClick={_.store.storeB.changeMsg}>
          change storeB's msg
        </button>
      </div>
    </p>
  )
}, {
  useSelf: {
    storeA: ['count', 'adding'],
    storeB: ['msg']
  }
})

const storeA = new class Store {
  data = {
    count: 0,
    adding: false
  }
  sub = () => {
    this.data.count--
  }
  add = () => {
    this.data.count++
  }
}

const storeB = new class Store {
  data = {
    msg: 'abc'
  }
  changeMsg = () => {
    this.data.msg = 'bcd'
  }
}

render( <my-app /> , 'body', {
  storeA,
  storeB
})
```

怎么在注入多 store 的时候使用 `compute` and `computed`? 非常简单：

```jsx
define('my-app', _ => {
  const store = _.store.storeA
  const { data, add, sub } = store
  return (
    <p>
      Clicked: {data.count} times
      <button onClick={add}>+</button>
      <button onClick={sub}>-</button>

      <div>
        {_.store.storeB.data.msg}
        <button onClick={_.store.storeB.changeMsg}>
          change storeB's msg
        </button>
      </div>

      <div>{_.computed.dobuleCount}</div>
      <div>{_.computed.reverseMsg}</div>
    </p>
  )
}, {
    useSelf: {
      storeA: ['count', 'adding'],
      storeB: ['msg']
    },
    compute: {
      dobuleCount() {
        return this.storeA.data.count * 2
      },
      reverseMsg() {
        return this.storeB.data.msg.split('').reverse().join('')
      }
    }
  })
```

### API 和 钩子

```jsx
define('my-component', _ => (
  ...
  ...
), {
    use: ['path', 'path.a', 'path[1].b'],
    useSelf: ['path.c', 'path[1].d'],
    css: 'h1 { color: red; }',
    propTypes: {

    },
    defaultProps: {

    },

    //生命周期
    install() { }, 
    installed() { }, 
    uninstall() { }, 
    receiveProps() { },
    beforeUpdate() { }, 
    updated() { }, 
    beforeRender() { }, 
    rendered() { },
    
    //自定义方法
    myMethodA() { },
    myMethodB() { }

  })
```

## Omi 生态

[→ Omi 生态学习路线图](https://github.com/Tencent/omi/tree/master/assets/rm.md)

#### 基础生态

| **项目**                         | **描述**                           |
| ------------------------------- | ----------------------------------- |
| [omi-docs](https://tencent.github.io/omi/site/docs/cn.html) 和 [例子](https://codepen.io/collection/DrMYgV/) 和 [webcomponents.dev](https://webcomponents.dev/)| Omi 官方文档 |
| [omix![](https://dntzhang.github.io/cax/asset/hot.png)](https://github.com/Tencent/omi/tree/master/packages/omix)| 小程序全局状态管理框架，数据触手可及，状态无处遁形 |
| [omim![](https://dntzhang.github.io/cax/asset/hot.png)](https://github.com/Tencent/omi/tree/master/packages/omim)|  Omi 打造的跨框架 Material Design UI 组件库, 任意框架可以使用,([DOCS & REPL](https://tencent.github.io/omi/packages/omim/docs/build/cn.html) && [加入我们](https://github.com/Tencent/omi/tree/master/packages/omim#contribution)!)|
| [omi-kbone![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omi-kbone)| 使用 omi + [kbone](https://github.com/wechat-miniprogram/kbone) 多端开发(小程序和Web)的贪吃蛇游戏。|
| [omio](https://github.com/Tencent/omi/tree/master/packages/omio)| 兼容老浏览器的 Omi 版本(支持到 IE8+) |
| [omis![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omis)| Omis + React|
| [omiv![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omiv)| Omiv + Vue|
| [omi-ssr](https://github.com/Tencent/omi/tree/master/packages/omi-ssr)| 服务端同构渲染解决方案(目前只能用 omio) |
| [omiu](https://tencent.github.io/omi/packages/omiu/examples/build/zh-cn.html)| 简单 Omi UI|
| [omi-router ](https://github.com/Tencent/omi/tree/master/packages/omi-router) |Omi 官方路由,超级小的尺寸，只有 1KB 的 js|
| [omi-devtools](https://github.com/f/omi-devtools)| 谷歌浏览器开发工具扩展|
| [omi-cli](https://github.com/Tencent/omi/tree/master/packages/omi-cli)| 项目脚手架工具，各种模板任你选 [→ 基础模板](https://github.com/Tencent/omi/tree/master/packages/omi-cli/template) and [→ 其他模板](https://github.com/omijs) |
| [omil](https://github.com/Wscats/omil)| 基于 .omi 单文件组件的 webpack 模块加载器 |
| [omi-snippets](https://github.com/Wscats/omi-snippets) | VSCode omi 文件扩展, [立即安装!](https://marketplace.visualstudio.com/items?itemName=Wscats.omi-snippets) |
| [obaa](https://github.com/Tencent/omi/tree/master/packages/obaa) 或 [JSONPatcherProxy](https://github.com/Palindrom/JSONPatcherProxy) | 监听或代理任意对象的任意变化 |

#### Snake MVP

| **Project**                         | **Description**                           |
| ------------------------------- | ----------------------------------- |
| [omi-snake![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omi-snake)| omi 写的 MVP 架构的贪吃蛇游戏 |
| [omi-kbone-snake![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omi-kbone)| omi-kbone 写的 MVP 架构的贪吃蛇小程序 |
| [Preact-snake](https://github.com/Tencent/omi/tree/master/packages/preact-css/examples/snake) & [→ Touch the demo](https://tencent.github.io/omi/packages/preact-css/examples/snake/build/)| Preact + [Preact-CSS](https://github.com/Tencent/omi/tree/master/packages/preact-css) + Omis 写的贪吃蛇 |
| [[P]react-snake ](https://github.com/Tencent/omi/tree/master/packages/react-snake) & [→ Touch the demo](https://tencent.github.io/omi/packages/react-snake/build/index.html)| react/preact 写的 MVP 架构的贪吃蛇游戏 |
| [vue-snake](https://github.com/Tencent/omi/tree/master/packages/vue-snake) | Vue + Omiv 写的 MVP 架构的贪吃蛇游戏 |
| [omix-snake![](https://dntzhang.github.io/cax/asset/hot.png)](https://github.com/Tencent/omi/tree/master/packages/omix-snake) | Omix 写的 MVP 架构贪吃蛇  |

#### 小程序生态

| **项目**                         | **描述**                           |
| ------------------------------- | ----------------------------------- |
| [omix![](https://dntzhang.github.io/cax/asset/hot.png)](https://github.com/Tencent/omi/tree/master/packages/omix)| 小程序全局状态管理框架，数据触手可及，状态无处遁形 |
| [react-kbone![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/react-kbone)| 直接使用 React 开发小程序或 Web，基于 [kbone](https://github.com/wechat-miniprogram/kbone) |
| [preact-kbone![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/preact-kbone)| 直接使用 Preact 开发小程序或 Web，基于 [kbone](https://github.com/wechat-miniprogram/kbone) |
| [omi-cloud](https://github.com/Tencent/omi/tree/master/packages/omi-cloud)| 小程序•云开发|
| [omip](https://github.com/Tencent/omi/tree/master/packages/omip)| 直接使用 Omi 开发小程序或 H5 SPA|
| [mps](https://github.com/Tencent/omi/tree/master/packages/mps)| 原生小程序增强框架(JSX + Less 输出 WXML + WXSS)，也支持 QQ 轻应用  |
| [cax](https://github.com/Tencent/omi/tree/master/packages/cax)| 小程序 Canvas 和 SVG 渲染引擎 |
| [omi-mp](https://github.com/Tencent/omi/tree/master/packages/omi-mp)| 通过微信小程序开发和生成 Web 单页应用(H5 SPA) |
| [westore](https://github.com/Tencent/westore/)| 小程序状态管理 |
| [comi](https://github.com/Tencent/omi/tree/master/packages/comi)| 小程序代码高亮和 markdown 渲染组件 |
| [wx-touch-event](https://github.com/qbright/wx-touch-event)| 基于 AlloyFinger/omi-finger 改造的小程序手势解决方案 |

#### 其他

| **项目**                         | **描述**                           |
| ------------------------------- | ----------------------------------- |
| [omi-piano![](https://dntzhang.github.io/cax/asset/hot.png)](https://github.com/Wscats/piano) |Omi 钢琴, [开始演奏吧!](https://wscats.github.io/piano/build/)|
| [md2site](https://tencent.github.io/omi/assets/md2site/)| 用 markdown 生成静态网站文档.|
| [omi-chart](https://github.com/Tencent/omi/tree/master/packages/omi-chart)| 一个 chart-x 标签搞定报表|
| [omi-30-seconds](https://github.com/Tencent/omi/tree/master/packages/omi-30-seconds)| 30 秒理解一段有用的 Omi 代码片段.|
| [omi-swiper](https://github.com/loo41/Omi-Swiper)| Omi + Swiper  |
| [omi-vscode](https://github.com/ZainChen/omi-vscode)| VSCode extension for omi, [Install now!](https://marketplace.visualstudio.com/items?itemName=ZainChen.omi) |
| [omi-sprite](https://github.com/Tencent/omi/tree/master/packages/omi-sprite)| Web Components, JSX 和 Canvas 的完美融合|
| [omi-canvas](https://github.com/Tencent/omi/tree/master/packages/omi-canvas)| Web Components, JSX 和 Canvas 的完美融合|
| [omi-ex](https://github.com/Tencent/omi/tree/master/packages/omi-ex)| Omi.js 扩展(TypeScript) |
| [omi-transform](https://github.com/Tencent/omi/tree/master/packages/omi-transform)|Omi 和 [css3transform](https://tencent.github.io/omi/packages/omi-transform/css3transform/) 完美结合. 让 css3 transform 在你的 Omi 项目中变得超级简单.|
| [omi-finger](https://github.com/Tencent/omi/tree/master/packages/omi-finger)|Omi 官方手势库|
| [omi-touch](https://github.com/Tencent/omi/tree/master/packages/omi-touch)|丝般顺滑的触摸运动|
| [omi-snap](https://github.com/Tencent/omi/blob/master/tutorial/omi-snap.cn.md)|预渲染骨架屏|
|[omi-i18n](https://github.com/i18next/omi-i18n)| Omi 国际化解决方案 |
| [omi-page](https://github.com/Tencent/omi/tree/master/packages/omi-page) | 基于 [page.js](https://github.com/visionmedia/page.js) 的 Omi 路由|
| [omie](https://github.com/Wscats/omi-electron) | Omi.js 和 Electron.js 打造跨平台桌面应用 |
| [Soo](https://github.com/tonis2/Soo)| 和 Omi 一样的 API，但是更小且没有 JSX, virtual DOM 和 store|
| [CEE](https://omijs.github.io/cee/out/)| custom-elements-everywhere 评分 |

### 特性

- 框架无关，任何框架可以使用 Omi 自定义元素
- 提供桌面、移动和小程序整体解决方案
- 无状态视图的架构设计
- 小巧的尺寸和[高性能](https://tencent.github.io/omi/packages/omi/examples/perfs/)
- 对 custom elements 友好, 通过字符串 `'0'`或者`'false'`传递 `false`，[通过`:`和`Omi.$`传递任意复杂类型](https://github.com/Tencent/omi/releases/tag/v6.8.0)
- 拥有官方跨框架 UI 组件库 - [omim](https://tencent.github.io/omi/packages/omim/docs/build/cn.html)
- 使用 [omio](https://github.com/Tencent/omi/tree/master/packages/omio) 可以兼容到 IE8
- [很容易通过 extend api 实现双向绑定](https://codepen.io/omijs/pen/aeLYjx)
- 支持 `TypeScript`
- 响应式数据绑定
- 增强了 CSS, [支持 rpx 单位](https://github.com/Tencent/omi/releases/tag/v4.0.26)，基于 **750** 屏幕宽度
- [原生支持 tap 事件](https://github.com/Tencent/omi/releases/tag/v4.0.24)
- [基于 Shadow Dom 设计](https://developers.google.cn/web/fundamentals/web-components/shadowdom?hl=zh-cn)
- 利用 [Chrome 开发工具扩展 ](https://github.com/f/omi-devtools)轻松调试，[从 Chrome 应用商店安装](https://chrome.google.com/webstore/detail/omijs-devtools/pjgglfliglbhpcpalbpeloghnbceocmd/related)
- 符合浏览器的发展趋势以及 API 设计理念
- [**Web Components**](https://developers.google.com/web/fundamentals/web-components/) + [**JSX**](https://reactjs.org/docs/introducing-jsx.html) + [**HTM**](https://github.com/developit/htm) 融合为一个框架 Omi
- Web Components 也可以数据驱动视图, `UI = fn(data)`
- JSX 是开发体验最棒(智能提示)、[语法噪音最少](https://github.com/facebook/jsx#why-not-template-literals)、图灵完备的 UI 表达式，模板引擎不完备，模板字符串完备但是语法噪音太大
- 看看 [Facebook React 和 Web Components 对比优势](https://www.cnblogs.com/rubylouvre/p/4072979.html)，Omi 融合了各自的优点，而且给开发者自由的选择喜爱的方式
- `Shadow DOM` 与 `Virtual DOM` 融合，Omi 既使用了`虚拟 DOM`，也是使用真实 `Shadow DOM`，让视图更新更准确更迅速
- 局部 CSS 最佳解决方案(`Shadow DOM`)，社区为局部 CSS 折腾了不少框架和库(使用 js 或 json 写样式，如:`Radium`，`jsxstyle`，`react-style`；与 webpack 绑定使用生成独特的 className `文件名—类名—hash值`，如：`CSS Modules`，`Vue`)，还有运行时注入`scoped atrr` 的方式，都是 hack 技术；`Shadow DOM Style` 是最完美的方案
- 独创的 `Path Updating`的 `store` 系统，基于 Proxy 全自动化的精准更新，功耗低，自由度高，性能卓越，方便集成 `requestIdleCallback`，自动化按需更新局部视图

对比同样开发 TodoApp， Omi 和 React 渲染完的 DOM 结构，Omi 使用 Shadow DOM 隔离样式和语义化结构:

| **Omi**                         | **React**                           | **Omio**                           |
| ------------------------------- | ----------------------------------- |----------------------------------- |
| ![Omi](https://tencent.github.io/omi/assets/omi-render.jpg) | ![React](https://tencent.github.io/omi/assets/react-render.jpg) | ![Omio](https://tencent.github.io/omi/assets/omio.png) |


### TypeScript 智能提示

```jsx
import { h, WeElement, tag, classNames } from 'omi';
import * as styles from './_index.less';

interface ButtonProps {
  href?: string,
  disabled?: boolean,
  type?: 'default' | 'primary' | 'danger',
  htmltype?: 'submit' | 'button' | 'reset',
  onClick?: (e: any) => void
}

const TAG = 'o-button'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [TAG]: Omi.Props & ButtonProps
    }
  }
}

@tag(TAG)
export default class oButton extends WeElement<ButtonProps> {
...
...
...
```

<img src="./assets/ts.png" alt="omi" width="427"/>

## 必须收藏的资源

* [使用 MVP 架构和 Web Components(Omi) 开发贪吃蛇](https://github.com/Tencent/omi/blob/master/tutorial/omi-web-components-snake-game-mvp.cn.md)
* [Web Components 规范](https://github.com/w3c/webcomponents)
* [Comi 原理揭秘](https://github.com/Tencent/omi/blob/master/tutorial/comi-principle.md)
* [Omip 编译 H5 原理揭秘](https://github.com/Tencent/omi/blob/master/tutorial/omip-h5.md)
* [如何通过小程序实现跨平台开发](https://developers.weixin.qq.com/community/develop/article/doc/00002cda45c930d87a380a74351813)
* [你必须收藏 ES6 Spread Operator 技巧](https://github.com/Tencent/omi/blob/master/tutorial/spread-operator.cn.md)
* [Omi snap 骨架屏与快照](https://github.com/Tencent/omi/blob/master/tutorial/omi-snap.cn.md)
* [Omio 兼容 IE8 踩坑之路](https://github.com/Tencent/omi/blob/master/tutorial/omio.cn.md)
* [Omi 生态发布](https://github.com/Tencent/omi/blob/master/tutorial/ecosystem.cn.md)
* [深入浅出 Shadow Dom](https://github.com/Tencent/omi/blob/master/tutorial/shadow-dom-in-depth.cn.md)
* [HTM - JSX 的替代品？还是另一种选择？](https://github.com/Tencent/omi/blob/master/tutorial/omi-html.cn.md)
* [MVVM 王者归来](https://github.com/Tencent/omi/blob/master/tutorial/omi-mvvm.cn.md)
* [60FPS Animation In Omi](https://github.com/Tencent/omi/blob/master/tutorial/omi-transform.cn.md)
* [Render Web Components To Native](https://github.com/Tencent/omi/blob/master/tutorial/render-web-components-to-native.cn.md)
* [Web Components MDN](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
* [Web Components Google](https://developers.google.com/web/fundamentals/web-components/)
* [Web Components Org](https://www.webcomponents.org/introduction)
* [Proxy MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
* [CSS Variables](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_variables)
* [CSS Shadow Parts](https://drafts.csswg.org/css-shadow-parts-1/)
* [Part Theme Explainer](https://meowni.ca/posts/part-theme-explainer/)
* [Platform HTML5](https://platform.html5.org/)
* [使用 requestIdleCallback](https://div.io/topic/1370)
* [A requestIdleCallback polyfill](https://gist.github.com/paullewis/55efe5d6f05434a96c36)
* [Web Components 的力量](https://github.com/Tencent/omi/blob/master/tutorial/the-power-of-web-components.cn.md)
* [ShadowRoot](https://developer.mozilla.org/zh-CN/docs/Web/API/ShadowRoot)
* [Developer Tools support for Web Components in Firefox 63](https://blog.nightly.mozilla.org/2018/09/06/developer-tools-support-for-web-components-in-firefox-63/)
---

# 目录

- [Omi 生态](#omi-生态)
- [必须收藏的资源](#必须收藏的资源)
- [一个 HTML 完全上手](#一个-html-完全上手)
- [快速入门](#快速入门)
  - [安装](#安装)
  - [项目模板](#项目模板)
  - [Hello Element](#hello-element)
  - [生命周期](#生命周期)
- [调试工具](#调试工具)
- [浏览器兼容](#浏览器兼容)
- [相关链接](#相关链接)
- [贡献者们](#贡献者们)
- [维护者](#维护者)
- [感谢](#感谢)
- [License](#license)

## 一个 HTML 完全上手

下面这个页面不需要任何构建工具就可以执行

- [→ Online Demo!](https://codepen.io/omijs/pen/PMZWNb)

```html
<!DOCTYPE html>
<html>

<head>
  <title>Omi demo without transpiler</title>
</head>

<body>
  <script src="https://tencent.github.io/omi/packages/omi/dist/omi.js"></script>
  <script>
    const { define, render, html } = Omi

    class Store {
      data = {
        count: 1
      }
      sub = () => {
        this.data.count--
      }
      add = () => {
        this.data.count++
      }
    }

    define('my-counter', _ => html`
      <div>
        <button onClick=${_.store.sub}>-</button>
        <span>${_.store.data.count}</span>
        <button onClick=${_.store.add}>+</button>
      </div>
    `, {
      use: ['count'],
      //or using useSelf, useSelf will update self only, exclude children components
      //useSelf: ['count'], 
      css: `span { color: red; }`,
      installed() {
        console.log('installed')
      }
    })

    render(html`<my-counter />`, 'body', new Store)
  </script>
</body>

</html>
```

通过上面脚本的执行，你已经定义好了一个自定义标签，可以不使用 render 方法，直接使用 `<my-counter></my-counter>` 标签：

```jsx
<body>
  <my-counter></my-counter>
</body>
```



## 快速入门

### 安装

```bash
$ npm i omi-cli -g    # install cli
$ omi init my-app     # 初始化项目，也可以在空目录里执行 'omi init'
$ cd my-app           # 如果在空目录里执行 'omi init' 忽略这条命令
$ npm start           # 开发
$ npm run build       # 编译发布
```

> `npx omi-cli init my-app` 也支持(要求 npm v5.2.0+)

目录说明:

```
├─ config
├─ public
├─ scripts
├─ src
│  ├─ assets
│  ├─ elements    //存放所有 custom elements
│  ├─ store       //存放所有页面的 store
│  ├─ admin.js    //入口文件，会 build 成  admin.html
│  └─ index.js    //入口文件，会 build 成  index.html
```

#### Scripts

```json
"scripts": {
    "start": "node scripts/start.js",
    "build": "PUBLIC_URL=. node scripts/build.js",
    "build-windows": "set PUBLIC_URL=.&& node scripts/build.js",
    "fix": "eslint src --fix"
}
```

你也可以设置 PUBLIC_URL, 比如：

```json
...
"build": "PUBLIC_URL=https://fe.wxpay.oa.com/dv node scripts/build.js",
"build-windows": "set PUBLIC_URL=https://fe.wxpay.oa.com/dv&& node scripts/build.js",
...
```

#### 切换 omi, omio 和 reomi

增加或删除 package.json 里的 alias config 可以切换 omi 和 omio 渲染:

```js
"alias": {
  "omi": "omio"
}
```

<!-- 关于编译网站的 url 前缀的设置，可以参考两个地址：

* [build problem](https://stackoverflow.com/questions/42686149/create-react-app-build-with-public-url)
* [build env doc](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#referencing-environment-variables-in-the-html)

比如在 windows 下:

```json
"scripts": {
  "start": "node scripts/start.js",
  "_build": "node scripts/build.js",
  "build":"set PUBLIC_URL=https://fe.wxpay.oa.com/dv&& npm run _build"
}
```

在 mac os 中:

```json
"scripts": {
    "start": "node scripts/start.js",
    "_build": "node scripts/build.js",
    "build":"PUBLIC_URL=https://fe.wxpay.oa.com/dv npm run _build",
    "fix": "eslint src --fix"
  },
```

如果你只想使用相对地址:

```
"build":"set PUBLIC_URL=.&& npm run _build"  //windows
"build":"PUBLIC_URL=. npm run _build",       //mac os
​``` -->

### 项目模板

| **Template Type**|  **Command**|  **Describe**|
| ------------ |  -----------|  ----------------- |
|基础模板(v3.3.0+)|`omi init my-app`| 基础模板，支持 omi 和 omio(IE8+)|
|小程序模板(v3.3.5+)|`omi init-p my-app`| Omi 开发小程序 |
|基础模板(v3.3.9+)|`omi init-o my-app`| 支持 IE8 的基础模板，只是 build 的时候支持 IE8，开发调试请用 IE9|
|Kbone Template|`omi init-kbone my-app`  | 使用 omi 开发小程序或者 Web|
|支持预渲染快照骨架的模板|`omi init-snap my-app`| 基础模板，支持 omi 和 omio(IE8+)，内置预渲染|
|TypeScript Template(omi-cli v3.3.0+)|`omi init-ts my-app`|使用 TypeScript 的模板|
|Mobile Template|`omi init-weui my-app`| 使用了 weui 和 omi-router 的移动 web app 模板|



### Hello Element

先创建一个自定义元素:

```js
import { define, WeElement } from 'omi'

define('hello-element', class extends WeElement {
  onClick = evt => {
    // trigger CustomEvent
    this.fire('abc', { name: 'dntzhang', age: 12 })
    evt.stopPropagation()
  }

  //如果需要在 html 里直接使用 <hello-element></hello-element>，必须声明 propTypes
  static propTypes = {
    msg: String
  }

  static css = `
      div {
        color: red;
        cursor: pointer;
      }`

  render(props) {
    return (
      <div onClick={this.onClick}>
        Hello {props.msg}
        <div>Click Me!</div>
      </div>
    )
  }
})
```

使用该元素:

```js
import { define, render, WeElement } from 'omi'
import './hello-element'

define('my-app', class extends WeElement {
  data = { abc: 'abc' }

  // define CustomEvent Handler
  onAbc = evt => {
    // get evt data by evt.detail
    this.data.abc = ' by ' + evt.detail.name
    this.update()
  }

  static css = `
      div{
          color: green;
      }`
  }

  render(props, data) {
    return (
      <div>
        Hello {data.abc}
        <hello-element
          onAbc={this.onAbc}
          msg="WeElement"
        />
      </div>
    )
  }
})

render(<my-app name="Omi v4.0" />, 'body')
```

告诉 Babel 把 JSX 转化成 Omi.h() 的调用:

``` json
{
    "presets": ["env", "omi"]
}
```

需要安装下面两个 npm 包支持上面的配置:

``` bash
"babel-preset-env": "^1.6.0",
"babel-preset-omi": "^0.1.1",
```

如果你使用 babel7，也可以使用如下包和配置：

```bash
npm install --save-dev @babel/preset-env
npm install --save-dev @babel/preset-react
```

```js
{
  "presets": [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        "pragma": "Omi.h",
        "pragmaFrag": "Omi.h.f"
      }
    ]
  ]
}
```

如果不想把 css 写在 js 里，你可以使用 webpack [to-string-loader](https://www.npmjs.com/package/to-string-loader), 比如下面配置:

``` js
{
    test: /[\\|\/]_[\S]*\.css$/,
    use: [
        'to-string-loader',
        'css-loader'
    ]
}
```

如果你的 css 文件以 `_` 开头, css 会使用 to-string-loader, 如：

``` js
import { tag, WeElement render } from 'omi'

define('my-app', class extends WeElement {

  css = require('./_index.css')
  ...
  ...
  ...
```

你也可以忘掉这一对繁琐的配置直接使用 omi-cli，不需要你配置任何东西。

<!-- ### TodoApp

下面列举一个相对完整的 TodoApp 的例子:

```js
import { define, render, WeElement } from 'omi'

define('todo-list', class extends WeElement {
  static propTypes = {
    items: Array
  }

  render(props) {
    return (
      <ul>
        {props.items.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    )
  }
})

define('todo-app', class extends WeElement {
  items = []
  text = ''

  render() {
    return (
      <div>
        <h3>TODO</h3>
        <todo-list items={this.items} />
        <form onSubmit={this.handleSubmit}>
          <input
            id="new-todo"
            onChange={this.handleChange}
            value={this.text}
          />
          <button>Add #{this.items.length + 1}</button>
        </form>
      </div>
    )
  }

  handleChange = e => {
    this.text = e.target.value
  }

  handleSubmit = e => {
    e.preventDefault()
    if (!this.text.trim().length) {
      return
    }
    this.items.push({
      text: this.text,
      id: Date.now()
    })
    this.text = ''
    this.update()
  }
})

render(<todo-app />, 'body')
``` -->

<!-- 
使用 Store 体系可以告别 update 方法，基于 Proxy 的全自动属性追踪和更新机制。强大的 Store 体系是高性能的原因，除了靠 props 决定组件状态的组件，其余组件所有 data 都挂载在 store 上,

```js
export default {
  data: {
    items: [],
    text: '',
    firstName: 'dnt',
    lastName: 'zhang',
    fullName: function () {
      return this.firstName + this.lastName
    },
    globalPropTest: 'abc', //更改我会刷新所有页面,不需要再组件和页面声明data依赖
    ccc: { ddd: 1 } //更改我会刷新所有页面,不需要再组件和页面声明data依赖
  },
  globalData: ['globalPropTest', 'ccc.ddd'],
  add: function () {
    if (!this.data.text.trim().length) {
        return;
    }
    this.data.items.push({
      text: this.data.text,
      id: Date.now()
    })
    this.data.text = ''
  }
  //默认 false，为 true 会无脑更新所有实例
  //updateAll: true
}
```

自定义 Element 需要声明依赖的 data，这样 Omi store 根据自定义组件上声明的 data 计算依赖 path 并会按需局部更新。如:

```js
define('todo-app', class extends WeElement {
    static get data() {
        //如果你用了 store，这个只是用来声明依赖，按需 Path Updating
        return { items: [], text: '' }
    }
    ...
    ...
    ...
    handleChange = (e) => {
        this.store.data.text = e.target.value
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.store.add()
    }
})
```

* 数据的逻辑都封装在了 store 定义的方法里 (如 store.add)
* 视图只负责传递数据给 store （如上面调用 store.add 或设置 store.data.text）

需要在 render 的时候从根节点注入 store 才能在所有自定义 Element 里使用 this.store:

```js
render(<todo-app></todo-app>, 'body', store)
```

[→ Store 完整的代码](https://github.com/Tencent/omi/blob/master/packages/omi/examples/store/main.js)

总结一下:

* store.data 用来列出所有属性和默认值(除去 props 决定的视图的组件)
* 组件和页面的 data 用来列出依赖的 store.data 的属性 (omi 会记录 path)，按需更新
* 如果页面简单组件很少，可以 updateAll 设置成 true，并且组件和页面不需要声明 data，也就不会按需更新
* globalData 里声明的 path，只要修改了对应 path 的值，就会刷新所有页面和组件，globalData 可以用来列出所有页面或大部分公共的属性 Path -->
<!-- 
## Mitt

如果不想使用 store 的 data 体系，也可以使用发布订阅模式。比如在 Omi 中使用 [mitt](https://github.com/developit/mitt) 跨组件通讯:

* [cross-component-communication](https://github.com/Tencent/omi/blob/master/packages/omi-30-seconds/README.md#cross-component-communication) -->

<!-- 
如果你想要兼容 IE11,请使用 `omi-mobx` 代替 omi 自带的 observe，往下看..

### Omi Mobx

```js
import { tag, WeElement } from "omi"
import { observe } from "omi-mobx"

@observe
@tag("my-app")
class MyApp extends WeElement {
  install() {
    this.data.name = "omi"
  }

  onClick = () => {
    this.data.name = "Omi V4.0"
  }

  render(props, data) {
    return (
      <div onClick={this.onClick}>
        <h1>Welcome to {data.name}</h1>
      </div>
    )
  }
}
​``` -->

### 生命周期

| 钩子方法 |      触发时机                   |
| ---------------- | -------------------------------------------- |
| `install`        | 初始化安装 |
| `installed`      | 插入到文档之后且安装完成 |
| `uninstall`      |   从文档中卸载移除        |
| `beforeUpdate`   |  update 之前                         |
| `updated`    |  update 之后                          |
| `beforeRender`   |  `render()` 之前                         |
| `receiveProps`   | 父组件更新时候触发, 返回 false 可以阻止更新      |

## 调试工具

使用 [Omi 开发工具](https://chrome.google.com/webstore/detail/omijs-devtools/pjgglfliglbhpcpalbpeloghnbceocmd) 可以非常简单地调试和管理你的 UI。不需要任何配置，你只要安装然后就能调试。

既然  Omi 使用了 Web Components 和 Shadow-DOM, 所以不需要像 React 一样安装其他元素面板，只需要使用 Chrome 自带的 **Elements' sidebar** 便可，它和 React 开发者工具一样强大。

![Omi DevTools](https://github.com/f/omi-devtools/raw/master/omi-devtools.gif)

### 查看所有注册的元素

```js
console.log(Omi.elements)
```

<!-- 
## React 组件转成 Omi

举个例子，下面是吧 weui react 的 button 转成 weui omi 的 button 的例子 :

![react to omi](./assets/react-to-omi.png)

* [Diff Split](https://github.com/Tencent/omi/commit/9790fadaaf20cfede80bcf9213756a83fc8c3949?diff=split)
* [Diff Unified](https://github.com/Tencent/omi/commit/9790fadaaf20cfede80bcf9213756a83fc8c3949?diff=unified)
* [Before](https://github.com/Tencent/omi/blob/c8af654f1d5865dc557c0b4b8ad524f702a69be5/packages/omi-weui/src/omi-weui/elements/button/button.js)
* [After](https://github.com/Tencent/omi/blob/9790fadaaf20cfede80bcf9213756a83fc8c3949/packages/omi-weui/src/omi-weui/elements/button/button.js) -->

## 浏览器兼容

> [Omio](https://github.com/Tencent/omi/tree/master/packages/omio) - 兼容老浏览器的 Omi 版本(支持到 IE8+)

Omi works in the latest two versions of all major browsers: Safari 10+, IE 11+, and the evergreen Chrome, Firefox, and Edge.

![→ Browsers Support](./assets/browsers-support.png)

[→ polyfills](https://github.com/webcomponents/webcomponentsjs)

```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.0.0/webcomponents-bundle.js"></script>
```

## 贡献

Build a example:

```bash
npm start example_name
```

Build omi:

```bash
npm run build
```

Unit testing

```
npm run test
```

## 贡献者们

<table><tbody>
      <tr><td><a target="_blank" href="https://github.com/dntzhang"><img width="60px" src="https://avatars2.githubusercontent.com/u/7917954?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/LeeHyungGeun"><img width="60px" src="https://avatars2.githubusercontent.com/u/2471651?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/xcatliu"><img width="60px" src="https://avatars1.githubusercontent.com/u/5453359?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/1921622004"><img width="60px" src="https://avatars1.githubusercontent.com/u/19359217?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/yanceyou"><img width="60px" src="https://avatars2.githubusercontent.com/u/16320418?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/f"><img width="60px" src="https://avatars0.githubusercontent.com/u/196477?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/pasturn"><img width="60px" src="https://avatars0.githubusercontent.com/u/6126885?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/Wscats"><img width="60px" src="https://avatars3.githubusercontent.com/u/17243165?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/akira-cn"><img width="60px" src="https://avatars0.githubusercontent.com/u/316498?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ZainChen"><img width="60px" src="https://avatars3.githubusercontent.com/u/15615524?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/dangxuandev"><img width="60px" src="https://avatars1.githubusercontent.com/u/5436704?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/daizhan"><img width="60px" src="https://avatars0.githubusercontent.com/u/5318547?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/132yse"><img width="60px" src="https://avatars1.githubusercontent.com/u/12951461?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/elfman"><img width="60px" src="https://avatars3.githubusercontent.com/u/948001?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/NoBey"><img width="60px" src="https://avatars3.githubusercontent.com/u/10740524?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/hilkbahar"><img width="60px" src="https://avatars2.githubusercontent.com/u/12161006?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/eyea"><img width="60px" src="https://avatars0.githubusercontent.com/u/17020223?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/guisturdy"><img width="60px" src="https://avatars1.githubusercontent.com/u/7098619?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/KidneyFlower"><img width="60px" src="https://avatars1.githubusercontent.com/u/16027183?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/zhangsanshi"><img width="60px" src="https://avatars1.githubusercontent.com/u/3771933?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/xland"><img width="60px" src="https://avatars0.githubusercontent.com/u/2980915?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/winstonxie"><img width="60px" src="https://avatars3.githubusercontent.com/u/16422642?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ghostzhang"><img width="60px" src="https://avatars3.githubusercontent.com/u/194242?s=60&amp;v=4"></a></td>
      <td><a target="_blank" href="https://github.com/jayZOU"><img width="60px" src="https://avatars3.githubusercontent.com/u/8576977?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/zhengbao"><img width="60px" src="https://avatars3.githubusercontent.com/u/1736166?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/vorshen"><img width="60px" src="https://avatars3.githubusercontent.com/u/10334783?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/akira-cn"><img width="60px" src="https://avatars3.githubusercontent.com/u/316498?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/loo41"><img width="60px" src="https://avatars3.githubusercontent.com/u/28095677?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/rainmanhhh"><img width="60px" src="https://avatars3.githubusercontent.com/u/13862623?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/nbompetsis"><img width="60px" src="https://avatars3.githubusercontent.com/u/11991105?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/CodeFalling"><img width="60px" src="https://avatars1.githubusercontent.com/u/5436704?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/daizhan"><img width="60px" src="https://avatars0.githubusercontent.com/u/5318547?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ritschwumm"><img width="60px" src="https://avatars2.githubusercontent.com/u/547138?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/kahwee"><img width="60px" src="https://avatars3.githubusercontent.com/u/262105?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/alanyinjs"><img width="60px" src="https://avatars3.githubusercontent.com/u/25688258?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/electerious"><img width="60px" src="https://avatars2.githubusercontent.com/u/499088?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/nanhupatar"><img width="60px" src="https://avatars1.githubusercontent.com/u/27266016?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ilker0"><img width="60px" src="https://avatars1.githubusercontent.com/u/23511412?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/MrGrabazu"><img width="60px" src="https://avatars2.githubusercontent.com/u/6928672?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/Tagir-A"><img width="60px" src="https://avatars2.githubusercontent.com/u/23556586?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/mahmut-gundogdu"><img width="60px" src="https://avatars2.githubusercontent.com/u/2217899?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/howel52"><img width="60px" src="https://avatars3.githubusercontent.com/u/9854818?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/yolio2003"><img width="60px" src="https://avatars1.githubusercontent.com/u/352931?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/loo41"><img width="60px" src="https://avatars3.githubusercontent.com/u/28095677?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/nbompetsis"><img width="60px" src="https://avatars1.githubusercontent.com/u/11991105?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/WozHuang"><img width="60px" src="https://avatars2.githubusercontent.com/u/22727100?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/web-padawan"><img width="60px" src="https://avatars2.githubusercontent.com/u/10589913?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/SuperHuangXu"><img width="60px" src="https://avatars1.githubusercontent.com/u/14816052?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/LastHeaven"><img width="60px" src="https://avatars1.githubusercontent.com/u/10590077?s=60&amp;v=4"></a></td>
      <td><a target="_blank" href="https://github.com/validalias"><img width="60px" src="https://avatars3.githubusercontent.com/u/44221844?s=60&amp;v=4"></a></td></tr><tr>
      <td><a target="_blank" href="https://github.com/FAKER-A"><img width="60px" src="https://avatars2.githubusercontent.com/u/25676164?s=60&amp;v=4"></a></td>
       <td><a target="_blank" href="https://github.com/liulinboyi"><img width="60px" src="https://avatars2.githubusercontent.com/u/41336612?s=60&amp;v=4"></a></td>
        <td><a target="_blank" href="https://github.com/hulei"><img width="60px" src="https://avatars2.githubusercontent.com/u/6905072?s=60&amp;v=4"></a></td> <td><a target="_blank" href="https://github.com/mtonhuang"><img width="60px" src="https://avatars2.githubusercontent.com/u/30364922?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/Juliiii"><img width="60px" src="https://avatars2.githubusercontent.com/u/23744602?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/mingkang1993"><img width="60px" src="https://avatars2.githubusercontent.com/u/9126292?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/liufushihai"><img width="60px" src="https://avatars2.githubusercontent.com/u/28208916?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/supermp"><img width="60px" src="https://avatars2.githubusercontent.com/u/892475?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/LeachZhou"><img width="60px" src="https://avatars2.githubusercontent.com/u/18715564?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/yiliang114"><img width="60px" src="https://avatars2.githubusercontent.com/u/11473889?s=60&amp;v=4"></a></td></tr></tbody></table>

这里是 [todo list](./todo.md), 欢迎一起贡献。

## 核心维护者

- [@Wscats](https://github.com/Wscats)
- [@f](https://github.com/f)
- [@LeeHyungGeun](https://github.com/LeeHyungGeun)
- [@dntzhang](https://github.com/dntzhang)
- [@xcatliu](https://github.com/xcatliu)

任何 Omi 相关问题欢迎联系我们。也可以[加入 Omi QQ 群](https://github.com/Tencent/omi/issues/169)进行讨论交流。

## 感谢

* [preact](https://github.com/developit/preact)
* [obaa](https://github.com/Tencent/omi/tree/master/packages/obaa) 
* [create-react-app](https://github.com/facebook/create-react-app)
* [JSX](https://github.com/facebook/jsx)
* [JSONPatcherProxy](https://github.com/Palindrom/JSONPatcherProxy)

## License

MIT © Tencent
