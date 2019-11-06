## 安装  

直接下载并用 `<script>` 标签引入，Omi 会被注册为一个全局变量。

* [Omi 开发版本](https://unpkg.com/omi@latest/dist/omi.js)
* [Omi 压缩版本](https://unpkg.com/omi@latest/dist/omi.min.js)

也可以通过 npm 安装

```bash
npm i omi
```

如果需要兼容 IE8+，可以选择 omio，它拥有和 omi 几乎一样的 API，且 Omi 也会被注册为一个全局变量。

* [Omio 开发版本](https://unpkg.com/omio@latest/dist/omi.js)
* [Omio 压缩版本](https://unpkg.com/omi@latest/dist/omi.min.js)

或者

```bash
npm i omio
```

## 命令行工具

Omi 提供了官方的 CLI，你不需要去学习怎么配置 webpack、babel或者 TypeScript，CLI 帮你配置好了一切，且提供了各种模板满足不同的项目类型。

```bash
$ npm i omi-cli -g     # install cli
$ omi init my-app      # init project
$ cd my-app            
$ npm start            # develop
$ npm run build        # release
```

> `npx omi-cli init my-app` 也是支持的(npm v5.2.0+).

目录描述:

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


### npm 脚本

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
"build": "PUBLIC_URL=https://your.url.com/sub node scripts/build.js",
"build-windows": "set PUBLIC_URL=https://your.url.com/sub&& node scripts/build.js",
...
```

### 切换 omi 和 omio

增加或删除 package.json 里的 alias config 可以切换 omi 和 omio 渲染:

```js
 ...
 "alias": {
    "omi": "omio"
  }
  ...
```
    

## 项目模板

| **Template Type**|  **Command**|  **Describe**|
| ------------ |  -----------|  ----------------- |
|基础模板(v3.3.0+)|`omi init my-app`| 基础模板，支持 omi 和 omio(IE8+)|
|Kbone Template|`omi init-kbone my-app`  | 使用 omi 开发小程序或者 Web|
|小程序模板(v3.3.5+)|`omi init-p my-app`| Omi 开发小程序 |
|mps|`omi init-mps my-app`| 原生小程序增强框架(JSX + Less 输出 WXML + WXSS) |
|mps ts 版本|`omi init-mps-ts my-app`| 原生小程序增强框架(JSX + Less 输出 WXML + WXSS) |
|omi-cloud|`omi init-cloud my-app`| 小程序•云开发|
|基础模板(v3.3.9+)|`omi init-o my-app`| 支持 IE8 的基础模板，只是 build 的时候支持 IE8，开发调试请用 IE9|
|支持预渲染快照骨架的模板|`omi init-snap my-app`| 基础模板，支持 omi 和 omio(IE8+)，内置预渲染|
|TypeScript 模板(omi-cli v3.3.0+)|`omi init-ts my-app`|使用 TypeScript 的模板|
|Mobile 模板|`omi init-weui my-app`| 使用 weui 和 omi-router 的模板|
|omi-mp 模板(omi-cli v3.0.13+)|`omi init-mp my-app`  |使用微信小程序开发 H5|
