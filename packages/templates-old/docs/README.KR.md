[English](./README.EN.md) | [简体中文](./README.md) | 한국어

<p align="right">Omi <strong>v6.0.2</strong></p>
<p align="right">Omio <strong>v2.0.6</strong></p>
<p align="center"><img src="./assets/omi-logo2019.svg" alt="omi" width="300"/></p>
<h2 align="center">Omi - Web Components를 사용한 차세대 웹 프레임워크. 구 버전 브라우저 지원(IE8+) by Omio. 4kb 경량의 자바스크립트 프레임워크. MVVM 하기 쉬움 </h2>

## Why Omi?

- 작은 파일 사이즈. _(**4kb** gzip 압축후)_
- 훌륭한 브라우저 호환성(IE8+) [omio](https://github.com/Tencent/omi/tree/master/packages/omio)
- [MVVM](https://github.com/Tencent/omi/blob/master/tutorial/omi-mvvm.md) 지원.
- TypeScript 지원.
- 반응형 데이터 바인딩
- Enhanced CSS, [rpx unit support](https://github.com/Tencent/omi/releases/tag/v4.0.26) **750** width 사이즈를 기본으로한
- [쉐도우 DOM 기반 설계](https://developers.google.com/web/fundamentals/web-components/shadowdom)
- [Omi DevTools Extension](https://github.com/f/omi-devtools) 를 통한 쉬운 디버깅 [[Install from Chrome WebStore](https://chrome.google.com/webstore/detail/omijs-devtools/pjgglfliglbhpcpalbpeloghnbceocmd)]
- 브라우저 트렌드 및 API 디자인 준수.
- [**Web Components**](https://developers.google.com/web/fundamentals/web-components/) 와 [**JSX**](https://reactjs.org/docs/introducing-jsx.html) 가 하나의 프레임워크에.
- observe feature 로 개발됨 (`this.update()` 호출 필요 없음).
- Web Components 가 데이터 기반(data-driven)의 뷰가 될수 있음, **`UI = fn(data)`**.
- JSX 는 최소의 UI 표현식으로 최상의 개발경험을 제공 (코드 인텔리전트 와 팁)  [grammatical noise](https://github.com/facebook/jsx#why-not-template-literals) 그리고 완벽하게 튜링됨(템플릿 엔진은 튜링 되지 않으며 ES 템플릿 스트링은 튜링 되지만 Syntax가 매우 복잡합니다).
- 독창적인 **Path Updating** 시스템. Proxy 기반 자동 **정확한** 업데이트, **저손실**, 높은 자유도, 뛰어난 성능, `requestIdleCallback` 로 통합하기 쉬움.
- **store system** 을 사용해서 `this.update` 와 작별하세요! store  가 자동으로 데이터와 관련된 UI를 업데이트 합니다.
- 봐주세요 [Facebook React vs Web Components](https://softwareengineering.stackexchange.com/questions/225400/pros-and-cons-of-facebooks-react-vs-web-components-polymer)，Omi 는 이것들의 강점을 결합하여 개발자가 자유롭게 자신이 원하는 방식을 선택할 수 있게 해줍니다.
- **Shadow DOM** 은 **Virtual DOM** 과 병합되며, Omi 는 Virtual DOM 과 실제 Shadow DOM을 사용하여 뷰를 보다 정확하고 빠르게 업데이트 합니다.
- 99.9%의 프로젝트가 디버깅 하기 위해 시간낭비를 할 필요가 없습니다. 그리고 `redux`에 접근할 필요 없이, Omi 의 `store`가 모든 프로젝트 충족시킬수 있습니다.
- **Scoped CSS**의 베스트 솔루션은 **Shadow DOM** 입니다. 커뮤니티들은 Scoped CSS 를 위해 않은 프레임워크와 라이브러리를 버렸습니다. JS 혹은 JSON을 사용하여 양식을 작성하고(예: `Radium`, `jsxstyle`, `react-style`), Webpack을 사용하여 독립적인 `className`, `filename-classname-hash` 를 만들어내는 것은(`CSS Modules`, `Vue`와 같이) 모두 hack 기술입니다. `Shadow DOM Style`이 완벽한 해결책입니다.

TodoApp 을 통해 Omi 와 React를 비교해보십시오. Omi and React의 렌더링 DOM 구조:

| **Omi**                         | **React**                           |
| ------------------------------- | ----------------------------------- |
| ![Omi](./assets/omi-render.jpg) | ![React](./assets/react-render.jpg) |

Omi는 Shadow DOM 기반 스타일 분기 및 시멘틱 구조를 사용합니다.

## Ecosystem of Omi

| **Project**                         | **Description**                           |
| ------------------------------- | ----------------------------------- |
| [omi-docs](https://github.com/Tencent/omi/blob/master/docs/main-concepts.md)| Omi 공식 문서 |
| [omio![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omio)| Omi 의 구 브라우전 지원 버전 (IE8+, 모바일 브라우저).|
| [md2site![](https://dntzhang.github.io/cax/asset/hot.png) ](https://tencent.github.io/omi/assets/md2site/)| Omio로 개발되고 마크다운으로 제너레이트 된 정적 사이트. |
| [omi-mvvm![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/blob/master/tutorial/omi-mvvm.md)| MVVM 도입. [mappingjs](https://github.com/Tencent/omi/tree/master/packages/mappingjs) 강력 지원 |
| [omi-chart![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omi-chart)| chart-x tag를 사용한 심플 HTML5 차트. |
| [omi-html](https://github.com/Tencent/omi/tree/master/packages/omi-html)| [htm](https://github.com/developit/htm) 사용 |
| [omi-30-seconds![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omi-30-seconds)| Omi 스니펫 - 30초 가이드 |
| [omi-canvas](https://github.com/Tencent/omi/tree/master/packages/omi-canvas)| Web Component, jsx 그리고 canvas의 완벽한 조합 |
| [omi-mp![](https://dntzhang.github.io/cax/asset/hot.png) ](https://github.com/Tencent/omi/tree/master/packages/omi-mp) working| Wechat 미니프로그램 개발을 위한 Singe Page |
| [omi-router](https://github.com/Tencent/omi/tree/master/packages/omi-router) | Omi 공식 라우터 [→ DEMO](https://tencent.github.io/omi/packages/omi-router/examples/spa/build/) |
| [omi-devtools](https://github.com/f/omi-devtools)| 브라우저 개발자 확장도구 |
| [omi-cli](https://github.com/Tencent/omi/tree/master/packages/omi-cli)| Project scaffolding |
| [omi-ex](https://github.com/Tencent/omi/tree/master/packages/omi-ex)| Omi.js extension(TypeScript) |
| [omi-transform](https://github.com/Tencent/omi/tree/master/packages/omi-transform)|Omi / [css3transform](https://tencent.github.io/omi/packages/omi-transform/css3transform/) integration. 초간단 CSS3 Transform |
| [omi-tap2](https://github.com/Tencent/omi/releases/tag/v4.0.24)| Native 탭 이벤트 지원(omi v4.0.24+）|
| [omi-tap](https://github.com/Tencent/omi/tree/master/packages/omi-tap) | 탭 이벤트 지원 |
| [omi-finger](https://github.com/Tencent/omi/tree/master/packages/omi-finger)| 터치 와 제스처 이벤트 지원 |
| [omi-touch](https://github.com/Tencent/omi/tree/master/packages/omi-touch)| 부드러운 스크롤링, Rotation, 웹 페이지를 위한 어떤 모션도 Refresh |
| [omi-use](https://github.com/Tencent/omi/blob/master/docs/main-concepts.cn.md#use)| React Hooks 방식 API |
| [omi-native](https://github.com/Tencent/omi/tree/master/packages/omi-native)| Web Components Native 렌더링 |
| [omi-i18n](https://github.com/i18next/omi-i18n)| i18next 에코시스템을 사용한 omi.js 다국어 지원 방식 |
| [omi-page](https://github.com/Tencent/omi/tree/master/packages/omi-page) | [page](https://github.com/visionmedia/page.js) 를 통한 소형의 클라이언트 사이드 라우터 |

## Useful Resources

| **Title Name**  | **Other language** | **Related**|
| ----------------------------------------- | ------------------ |-----------------|
| [Omio는 IE8과 호환됩니다](https://github.com/Tencent/omi/blob/master/tutorial/omio.kr.md)
| [Developer Tools support for Web Components in Firefox 63](https://blog.nightly.mozilla.org/2018/09/06/developer-tools-support-for-web-components-in-firefox-63/)|||
| [Develop W3C Web Components with WebAssembly](https://medium.com/coinmonks/develop-w3c-web-components-with-webassembly-d65938284255)||
| [60FPS Animation In Omi](https://github.com/Tencent/omi/blob/master/tutorial/omi-transform.md)| [简体中文](https://github.com/Tencent/omi/blob/master/tutorial/omi-transform.cn.md) [한국어](https://github.com/Tencent/omi/blob/master/tutorial/omi-transform.kr.md)|
| [Render Web Components To Native](https://github.com/Tencent/omi/blob/master/tutorial/render-web-components-to-native.md)|[简体中文](https://github.com/Tencent/omi/blob/master/tutorial/render-web-components-to-native.cn.md) [한국어](https://github.com/Tencent/omi/blob/master/tutorial/render-web-components-to-native.kr.md)|
| [Shadow Dom In Depth](https://github.com/praveenpuglia/shadow-dom-in-depth)|  [简体中文](https://github.com/Tencent/omi/blob/master/tutorial/shadow-dom-in-depth.cn.md)|
| [Part Theme Explainer](https://meowni.ca/posts/part-theme-explainer/)|求翻译|
| [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)| [简体中文](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)|
| [Web Components Google](https://developers.google.com/web/fundamentals/web-components/)|
| [Web Components Org](https://www.webcomponents.org/introduction)|
| [Proxy MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)|[简体中文](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) [한국어](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Proxy)|
| [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables)|[简体中文](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_variables) [한국어](https://developer.mozilla.org/ko-KR/docs/Web/CSS/Using_CSS_variables)|
| [CSS Shadow Parts](https://drafts.csswg.org/css-shadow-parts-1/)|
| [Platform HTML5](https://platform.html5.org/)|
| [Using requestIdleCallback](https://developers.google.com/web/updates/2015/08/using-requestidlecallback)|[简体中文](https://div.io/topic/1370)| [A polyfill](https://gist.github.com/paullewis/55efe5d6f05434a96c36)|
| [The Power Of Web Components](https://hacks.mozilla.org/2018/11/the-power-of-web-components/)|求翻译|
| [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)|[简体中文](https://developer.mozilla.org/zh-CN/docs/Web/API/ShadowRoot)||

# Overview of the Readme

- [Ecosystem of Omi](#ecosystem-of-omi)
- [Useful Resources](#useful-resources)
- [omi-mp](#omi-mp)
- [Omi 1분 추가 가이드](#Omi-1분-추가-가이드)
- [Omi 30초 추가 가이드](#Omi-30초-추가-가이드)
- [Getting Started](#getting-started)
  - [Install](#install)
  - [Project Template](#project-template)
  - [Hello Element](#hello-element)
  - [TodoApp](#todoapp)
  - [Store](#store)
  - [Observe](#observe)
  - [Lifecycle](#lifecycle)
- [Debugging](#debugging)
- [React to Omi](#react-to-omi)
- [Browsers Support](#browsers-support)
- [Contribution](#contribution)
- [Thanks](#thanks)
- [License](#license)

## Omi 1분 추가 가이드

이 페이지는 어떤 번들링 툴 사용없이 Omi를 실행가능합니다.

- [Online Demo!](https://tencent.github.io/omi/assets/)
- [Omi.js CDN](https://unpkg.com/omi)

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>Add Omi in One Minute</title>
</head>

<body>
  <script src="https://unpkg.com/omi"></script>
  <script>
    const { WeElement, h, render, define } = Omi

    class LikeButton extends WeElement {
      install() {
        this.data = { liked: false }
      }

      render() {
        if (this.data.liked) {
          return 'You liked this.'
        }

        return h(
          'button',
          {
            onClick: () => {
              this.data.liked = true
              this.update()
            }
          },
          'Like'
        )
      }
    }

    define('like-button', LikeButton)

    render(h('like-button'), 'body')
  </script>
</body>

</html>
```

`like-button` 태그를 HTML에서 직접 사용 가능합니다：

```jsx
<body>
  <like-button />
</body>
```

### Omi 30초 추가 가이드

당신은 Omi 프로젝트를 현대의 자바스크립트를 사용해서 빠르게 빌드할 수 있습니다:

```js
import { render, WeElement, tag, observe } from "omi"

@observe
@tag("my-counter")
class MyCounter extends WeElement {

  data = {
    count: 0
  }

  sub = () => {
    this.data.count--
  }

  add = () => {
    this.data.count++
  }

  render() {
    return (
      <div>
        <button onClick={this.sub}>-</button>
        <span>{this.data.count}</span>
        <button onClick={this.add}>+</button>
      </div>
    )
  }
}

render(<my-counter />, "body")
```

[→ counter demo](https://tencent.github.io/omi/packages/omi/examples/counter/)

아마 당신은 위에 정의된 `MyCounter` 라는 클래스 명을 사용하지 않았다는 것을 알게 될겁니다. 그래서 당신은 Eslint hints를 피하기 위해 아래의 방법을 사용해야 합니다. :

```js
import { render, WeElement, define } from 'omi'

define('my-counter', class extends WeElement {
    static observe = true
    
    data = {
      count: 1
    }

    sub = () => {
      this.data.count--
    }

    add = () => {
      this.data.count++
    }

    render() {
      return (
        <div>
          <button onClick={this.sub}>-</button>
          <span>{this.data.count}</span>
          <button onClick={this.add}>+</button>
        </div>
      )
    }
  })

render(<my-counter />, 'body')
```
<!-- 
간단하게 Pure Function 폼을 정의할 수 있습니다.

```js
import { define, render } from 'omi'
 define('my-counter', function() {
  const [count, setCount] = this.use({
    data: 0,
    effect: function() {
      document.title = `The num is ${this.data}.`
    }
  })

  this.useCss(`button{ color: red; }`)

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
})
 render(<my-counter />, 'body')
```

만약 위의 `effect` 방식이 필요 없다면 `useData` 를 직접 사용해도 됩니다.

```js
const [count, setCount] = this.useData(0)
``` -->

## Getting Started

### Install

```bash
$ npm i omi-cli -g               # install cli
$ omi init my-app     # init project, you can also exec 'omi init' in an empty folder
$ cd my-app           # please ignore this command if you executed 'omi init' in an empty folder
$ npm start                      # develop
$ npm run build                  # release
```

> `npx omi-cli init my-app` is also supported(npm v5.2.0+).

Directory description:

```
├─ config
├─ public
├─ scripts
├─ src
│  ├─ assets
│  ├─ elements    //Store all custom elements
│  ├─ store       //Store all this store of pages
│  ├─ admin.js    //Entry js of compiler，will build to admin.html
│  └─ index.js    //Entry js of compiler，will build to index.html
```

About compiled website URL：

* [build env doc](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#referencing-environment-variables-in-the-html)
* [build problem](https://stackoverflow.com/questions/42686149/create-react-app-build-with-public-url)

Such as in windows:

```json
"scripts": {
  "start": "node scripts/start.js",
  "_build": "node scripts/build.js",
  "build":"set PUBLIC_URL=https://fe.wxpay.oa.com/dv&& npm run _build"
}
```

mac os 에서:

···json
"scripts": {
    "start": "node scripts/start.js",
    "_build": "node scripts/build.js",
    "build":"PUBLIC_URL=https://fe.wxpay.oa.com/dv npm run _build",
    "fix": "eslint src --fix"
  },
···

만약 상대적 주소를 사용하고 싶으면:
```
"build":"set PUBLIC_URL=.&& npm run _build"  // Windows
"build":"PUBLIC_URL=. npm run _build",       // Mac OS
```


### Project Template

| **Template Type**|  **Command**|  **Describe**|
| ------------ |  -----------|  ----------------- |
|Base Template|`omi init my-app`| 기본 Omi 프로젝트 템플릿. |
|Omio Template|`omi init-o my-app`| 구 버전 브라우저를 위한 Omi 템플릿 (IE8+ 와 모바일 브라우저). |
|Mobile Template|`omi init-weui my-app`| weui 와 omi-router를 사용한 모바일 웹앱 템플릿. |
|TypeScript Template(omi-cli v3.0.5+)|`omi init-ts my-app`| Type Script 기본 템플릿 |
|[SPA Template](https://tencent.github.io/omi/packages/omi-router/examples/spa/build/)(omi-cli v3.0.10+)|`omi init-spa my-app`| omi-router를 사용한 Single Page Application 템플릿 |
|omi-mp Template(omi-cli v3.0.13+)|`omi init-mp my-app`  | 위챗 미니 프로그램 템플릿 웹 개발 |
|MVVM Template(omi-cli v3.0.22+)|`omi init-mvvm my-app`  | MVVM 템플릿 |

CLI 자동 프로젝트 생성 scaffolding 는 한 페이지의 create-react-app을 여러 페이지로 변환합니다. 설정(configuration) 이슈는 [create-react-app user guide](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md) 을 봐주세요.

### Hello Element

`WeElement` 를 상속하여 커스텀 엘리먼트(element)를 정의하고 **`@tag`** 데코레이터를 사용하여 기본 class 와 이름을정의하세요:

```js
import { tag, WeElement, render } from "omi";

@tag("hello-element")
class HelloElement extends WeElement {
  onClick = evt => {
    // trigger CustomEvent
    this.fire("abc", { name: "dntzhang", age: 12 });
    evt.stopPropagation();
  };

  css() {
    return `
        div {
          color: red;
          cursor: pointer;
        }`;
  }

  render(props) {
    return (
      <div onClick={this.onClick}>
        Hello {props.msg} {props.propFromParent}
        <div>Click Me!</div>
      </div>
    );
  }
}
```

Using `hello-element`:

```js
import { tag, WeElement, render } from "omi";
import "./hello-element";

@tag("my-app")
class MyApp extends WeElement {
  static get data() {
    return { abc: "", passToChild: "" };
  }

  // bind CustomEvent
  onAbc = evt => {
    // get evt data by evt.detail
    this.data.abc = ` by ${evt.detail.name}`;
    this.update();
  };

  css() {
    return `
      div {
        color: green;
      }`;
  }

  render(props, data) {
    return (
      <div>
        Hello {props.name} {data.abc}
        <hello-element
          onAbc={this.onAbc}
          propFromParent={data.passToChild}
          msg="WeElement"
        />
      </div>
    );
  }
}

render(<my-app name="Omi v4.0" />, "body");
```

Babel이 JSX 를 `Omi.h()` 호출로 변환하도록 설정:

```json
{
  "presets": ["env", "omi"]
}
```

위의 설정(configuration)을 지원하려면 아래의 두 NPM 패키지를 설치해야 합니다:

```bash
"babel-preset-env": "^1.6.0",
"babel-preset-omi": "^0.1.1",
```

만약 CSS 를 사용하기 싫으면 Webpack의 [to-string-loader](https://www.npmjs.com/package/to-string-loader) 를 봐주세요,
예를 들어:

```js
{
  test: /[\\|\/]_[\S]*\.css$/,
  use: [
    'to-string-loader',
    'css-loader'
  ]
}
```

만약 당신의 CSS 파일이 "`_`"로 시작한다면, CSS 는 `to-string-loader`를 사용할 것입니다. 이와 같이:

```js
import { tag, WeElement render } from 'omi'

// typeof cssStr is string
import cssStr from './_index.css'

@tag('my-app')
class MyApp extends WeElement {

  css() {
    return cssStr
  }
  ...
  ...
  ...
```

당신은 성가신 설정(configuration)과 omi-cli을 직접 사용하는 것을 잊어버려도 됩니다.
어떤 설정도 필요가 없습니다.

### TodoApp

아래는 상대적으로 완벽한 TodoApp 예입니다:

```js
import { define, render, WeElement } from 'omi'

define('todo-list', function(props) {
  return (
    <ul>
      {props.items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  )
})

define('todo-app', class extends WeElement {
  static observe = true

  data = { items: [], text: '' }

  render() {
    return (
      <div>
        <h3>TODO</h3>
        <todo-list items={this.data.items} />
        <form onSubmit={this.handleSubmit}>
          <input
            id="new-todo"
            onChange={this.handleChange}
            value={this.data.text}
          />
          <button>Add #{this.data.items.length + 1}</button>
        </form>
      </div>
    )
  }

  handleChange = e => {
    this.data.text = e.target.value
  }

  handleSubmit = e => {
    e.preventDefault()
    if (!this.data.text.trim().length) {
      return
    }
    this.data.items.push({
      text: this.data.text,
      id: Date.now()
    })
    this.data.text = ''
  }
})

render(<todo-app />, 'body')
```

### Store

store system 을 사용하여 `this.update` 메서드에 작별을 고하세요! 이것은 데이터가 변경되면 UI 와 관련된 부분을 자동으로 업데이트 합니다. 파워풀한 **Store architecture** 는 고성능입니다. 왜냐하면 모든 데이터는 하나의 store 에 마운트(mount) 되기 때문입니다. 컴포넌트의 state 를 판별하기 위한 props가 의존된 컴포넌트를 제외.

```js
export default {
  data: {
    items: [],
    text: "",
    firstName: "dnt",
    lastName: "zhang",
    fullName: function() {
      return this.firstName + this.lastName;
    },
    globalPropTest: "abc", // Change it will refresh all elements without changing the components and page declaring data dependency.
    ccc: { ddd: 1 } // Change it will refresh all elements without changing the components and page declaring data dependency.
  },
  globalData: ["globalPropTest", "ccc.ddd"],
  add: function() {
    if (!this.data.text.trim().length) {
      return;
    }
    this.data.items.push({
      text: this.data.text,
      id: Date.now()
    });
    this.data.text = "";
  }
  // Default value is false, set to true will update all instances when data changing.
  // updateAll: true
};
```

커스텀 엘리먼트는 의존적인 데이터를 필요로합니다. 그래서 Omi stores는 커스텀 컴포넌트의 데이터가 정의된 디펜던시 경로(path) 를 계산합니다 그리고 필요할때 이것을 부분적으로 업데이트 합니다:

```js
class TodoApp extends WeElement {
  // If you use store, the data is only used to declare dependencies.
  static get data() {
    return { items: [], text: "" };
  }
  // ...
  handleChange = e => {
    this.store.data.text = e.target.value;
  };

  handleSubmit = e => {
    e.preventDefault();
    this.store.add();
  };
}
```

- 데이터 로직은 **store 정의 메서드에 encapsulated 됩니다** (`store.add` 와 같은.)
- View 는 오직 데이터를 store에 전달만 합니다. `store.add` 사용 혹은 `store.data.text`를 top 에 설정하여.

당신은 루트(root) 노드가 렌더시 이 `store` 를 사용하여 주입(inject)해야 합니다:

```js
render(<todo-app />, "body", store);
```

[→ Store Source Code](https://github.com/Tencent/omi/blob/master/packages/omi/examples/store/main.js)

#### Summary：

- `store.data`는 모든 애트리뷰트 와 기본 값들을 리스트 하기 위해 사용됩니다. (props를 통해 정의된 뷰 컴포넌트 제외)
- 구성 요소 및 페이지의 데이터는 종속 store.data 의 속성을 나열하는 데 사용 되며 (omi는 경로를 기록 합니다.) 그리고 필요에 따라 업데이트 됩니다.
- 만약 페이지에 간단한 컴포넌트가 거의 없는 경우, `updateAll`을 `true`로 선언할 수 있습니다. 그리고 컴포넌트와 페이지들은 데이터를 선언할 필요 없으며 그것들은 필요에 따라 업데이트 되지 않습니다.
- globalData에 선언된 경로(path)는 해당경로의 값이 수정되는 한 모든 페이지와 구성 요소를 새로고침 하며 globalData를 사용하여 모든 페이지 또는 공용(public) 속성(property)를 나열할 수 있습니다.

## Mitt

store 의 data 시스템을 사용하기를 원하지 않으면 publish/subscribe 모드를 사용하면 됩니다. 예를 들어 [mitt](https://github.com/developit/mitt) 를 사용해서 Omi component 간의 커뮤니케이션을 하면됩니다:

* [cross-component-communication](https://github.com/Tencent/omi/blob/master/packages/omi-30-seconds/README.md#cross-component-communication)


## Observe

### Omi Observe

observe 를 사용해서 `store` 사용이 필요 없는 반응형 뷰 엘리먼트(element) 를 생성할 수 있습니다:

```js
import { tag, WeElement, observe } from "omi"

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
```

<!--
만약 IE11과 호환하기를 원하시면, omi의 observe 대신 `omi-mobx` 를 사용해주세요.

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
``` -->

### Lifecycle

| Lifecycle method | When it gets called                          |
| ---------------- | -------------------------------------------- |
| `install`        | before the component gets mounted to the DOM |
| `installed`      | after the component gets mounted to the DOM  |
| `uninstall`      | prior to removal from the DOM                |
| `beforeUpdate`   | before update                           |
| `afterUpdate`    | after update  (deprecated)                           |
| `updated`    | after update                             |
| `beforeRender`   | before `render()`                           |
| `receiveProps`   | parent element re-render will trigger it      |

## Debugging

사용 [Omi DevTools](https://chrome.google.com/webstore/detail/omijs-devtools/pjgglfliglbhpcpalbpeloghnbceocmd) 당신은 어떤 설정(configuration)없이 간단히 디버그와 UI를 매니지 할 수 있습니다. 그냥 설치하고 디버그하세요.

Omi는 Web Components 와 Shadow-DOM을 사용하기 때문에 React 처럼 개발자 도구와 Chrome 에서 제공되는 **Elements 사이드바** 를 사용하여 다른 요소 패널을 설치할 필요가 없습니다.

![Omi DevTools](https://github.com/f/omi-devtools/raw/master/omi-devtools.gif)

## React to Omi

예를들면, 아래는 weui React 의 button 을 weui Omi의 button 으로 마이그레이션 하는 예제 입니다:

![react to omi](./assets/react-to-omi.png)

* [Diff Split](https://github.com/Tencent/omi/commit/9790fadaaf20cfede80bcf9213756a83fc8c3949?diff=split)
* [Diff Unified](https://github.com/Tencent/omi/commit/9790fadaaf20cfede80bcf9213756a83fc8c3949?diff=unified)
* [Before](https://github.com/Tencent/omi/blob/c8af654f1d5865dc557c0b4b8ad524f702a69be5/packages/omi-weui/src/omi-weui/elements/button/button.js)
* [After](https://github.com/Tencent/omi/blob/9790fadaaf20cfede80bcf9213756a83fc8c3949/packages/omi-weui/src/omi-weui/elements/button/button.js)

## Browsers Support

> [Omio](https://github.com/Tencent/omi/tree/master/packages/omio) - Omi 의 구 버전 브라우저 지원 버전(IE8+ 와 모바일 브라우저)

Omi 4.0+ 부터 주요 브라우저(Safari 10+, IE 11+, Chrome, Firefox, Edge)의 마지막 두 버전을 지원합니다.

![→ Browsers Support](./assets/browsers-support.png)

[→ Polyfills](https://github.com/webcomponents/webcomponentsjs)

```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.0.0/webcomponents-bundle.js"></script>
```


## Contributors

<table><tbody>
      <tr><td><a target="_blank" href="https://github.com/dntzhang"><img width="60px" src="https://avatars2.githubusercontent.com/u/7917954?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/LeeHyungGeun"><img width="60px" src="https://avatars2.githubusercontent.com/u/2471651?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/xcatliu"><img width="60px" src="https://avatars1.githubusercontent.com/u/5453359?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/yanceyou"><img width="60px" src="https://avatars2.githubusercontent.com/u/16320418?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/1921622004"><img width="60px" src="https://avatars1.githubusercontent.com/u/19359217?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/f"><img width="60px" src="https://avatars0.githubusercontent.com/u/196477?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/pasturn"><img width="60px" src="https://avatars0.githubusercontent.com/u/6126885?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ghostzhang"><img width="60px" src="https://avatars3.githubusercontent.com/u/194242?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/jayZOU"><img width="60px" src="https://avatars3.githubusercontent.com/u/8576977?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/zhengbao"><img width="60px" src="https://avatars3.githubusercontent.com/u/1736166?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/vorshen"><img width="60px" src="https://avatars3.githubusercontent.com/u/10334783?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/akira-cn"><img width="60px" src="https://avatars3.githubusercontent.com/u/316498?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/loo41"><img width="60px" src="https://avatars3.githubusercontent.com/u/28095677?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/rainmanhhh"><img width="60px" src="https://avatars3.githubusercontent.com/u/13862623?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/nbompetsis"><img width="60px" src="https://avatars3.githubusercontent.com/u/11991105?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/CodeFalling"><img width="60px" src="https://avatars1.githubusercontent.com/u/5436704?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/daizhan"><img width="60px" src="https://avatars0.githubusercontent.com/u/5318547?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/validalias"><img width="60px" src="https://avatars1.githubusercontent.com/u/44221844?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/elfman"><img width="60px" src="https://avatars3.githubusercontent.com/u/948001?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/132yse"><img width="60px" src="https://avatars3.githubusercontent.com/u/12951461?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/NoBey"><img width="60px" src="https://avatars3.githubusercontent.com/u/10740524?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/hilkbahar"><img width="60px" src="https://avatars2.githubusercontent.com/u/12161006?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/KidneyFlower"><img width="60px" src="https://avatars1.githubusercontent.com/u/16027183?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/zhangsanshi"><img width="60px" src="https://avatars1.githubusercontent.com/u/3771933?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/xland"><img width="60px" src="https://avatars0.githubusercontent.com/u/2980915?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/winstonxie"><img width="60px" src="https://avatars3.githubusercontent.com/u/16422642?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ritschwumm"><img width="60px" src="https://avatars2.githubusercontent.com/u/547138?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/kahwee"><img width="60px" src="https://avatars3.githubusercontent.com/u/262105?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/alanyinjs"><img width="60px" src="https://avatars3.githubusercontent.com/u/25688258?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/electerious"><img width="60px" src="https://avatars2.githubusercontent.com/u/499088?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/nanhupatar"><img width="60px" src="https://avatars1.githubusercontent.com/u/27266016?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/ilker0"><img width="60px" src="https://avatars1.githubusercontent.com/u/23511412?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/MrGrabazu"><img width="60px" src="https://avatars2.githubusercontent.com/u/6928672?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/Tagir-A"><img width="60px" src="https://avatars2.githubusercontent.com/u/23556586?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/mahmut-gundogdu"><img width="60px" src="https://avatars2.githubusercontent.com/u/2217899?s=60&amp;v=4"></a></td></tr><tr><td><a target="_blank" href="https://github.com/howel52"><img width="60px" src="https://avatars3.githubusercontent.com/u/9854818?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/tcdona"><img width="60px" src="https://avatars1.githubusercontent.com/u/352931?s=60&amp;v=4"></a></td><td><a target="_blank" href="https://github.com/eyea"><img width="60px" src="https://avatars0.githubusercontent.com/u/17020223?s=60&amp;v=4"></a></td></tr></tbody></table>
      
## Contribution

1. Fork it (https://github.com/Tencent/omi/fork)
2. Create your branch (`git checkout -b my-urgent-hotfix`)
3. Commit your changes (`git commit -am 'Fixed something'`)
4. Push to the branch (`git push origin my-urgent-hotfix`)
5. Create a new Pull Request

Omi 관련된관련하여 문제가 있을 경우 언제든지 저희에게 연락주세요. 혹은 [Omi QQ Group](https://github.com/Tencent/omi/issues/169) 추가 부탁 드립니다.

- [@f](https://github.com/f)
- [@LeeHyungGeun](https://github.com/LeeHyungGeun)
- [@dntzhang](https://github.com/dntzhang)
- [@xcatliu](https://github.com/xcatliu)

## Thanks

* [preact](https://github.com/developit/preact)
* [JSONPatcherProxy](https://github.com/Palindrom/JSONPatcherProxy)
* [create-react-app](https://github.com/facebook/create-react-app)
* [JSX](https://github.com/facebook/jsx)


## License

MIT © Tencent
