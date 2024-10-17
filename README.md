# electron-vite-vue

An Electron application with Vue

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

### 主进程和预加载脚本中静态资源引用说明

## electron-vite

出口目录：
默认值为out

公共目录：
默认值为resources，引用其中的资源不会被打包到out中
引用其他目录的资源会被打包到out/chunks中

## electron-builder

除了配置中忽略的目录、资源目录、输出目录，其他只要目录不为空都会复制资源到app.asar中

### 本地升级验证

1. 打包

修改package.json中的version

```
yarn build:win
```

2. 复制升级包（xxx-setup.exe,latest.yml）到update-server/releases目录下

3. 启动服务

```
cd update-server
yarn dev
```

4. 启动低版本应用，点击检查升级
