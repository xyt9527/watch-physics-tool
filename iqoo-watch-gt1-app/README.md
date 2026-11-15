# iQOO WATCH GT1 手表应用调试工程（BlueOS / 快应用）

## 这是什么

- **目标设备**：iQOO WATCH GT1（型号 iWA2456A，1.85 英寸 AMOLED，分辨率 390×450，方形圆角，蓝河操作系统）。
- **示例功能**：腕上计算器（纯前端逻辑，不依赖网络、不申请系统权限）。
- **安装渠道**：OrbitV 通过蓝牙侧载 `.rpk` 应用包。OrbitV 官方对 vivo WATCH GT / iQOO WATCH GT 标注为「完整支持」。
- **本次范围**：只交付可调试的源码工程和 debug 打包路径；**不做 release 签名、不上架官方应用商店**。

## 目录结构

```
iqoo-watch-gt1-app/
├── src/
│   ├── manifest.json          # 应用包名、名称、图标、路由、设备类型等配置
│   ├── app.ux                 # 应用入口文件
│   ├── assets/images/icon.png  # 114×114 应用图标
│   └── pages/
│       └── Calc/
│           └── index.ux       # 计算器页面（模板 + 样式 + 逻辑）
├── scripts/generate-icon.mjs  # 重新生成图标的 Node 脚本
├── build.config.js             # 构建别名等配置
├── jsconfig.json
├── package.json
└── .gitignore
```

## GT1 适配要点

- 屏幕为 **390×450 方形圆角**，`manifest.json` 中 `deviceTypeList` 设为 `watch-square`，`config.designWidth` 设为 `390`，尺寸按 GT1 物理像素 1:1 编写。
- 工程路径**不能包含中文字符和空格**（官方构建工具的硬性限制）。
- 首屏不要在 `onInit` 及更早阶段调用蓝河系统 Feature API；需要系统能力时放到 `onReady` 生命周期之后。
- 页面只使用基础 flex 布局和通用样式属性，避免使用手表渲染器不支持的 CSS。

## 打包与安装步骤

### 1. 准备开发环境

下载并安装官方 **BlueOS Studio**（内置 Node.js，无需单独配 Node）：<https://www.blueos.com.cn/develop>

### 2. 打开工程

在 BlueOS Studio 中「新建工程 / 打开工程」，选择本文件夹。注意存放路径必须是纯英文、无空格。

### 3. 安装依赖

在预览区点击「安装依赖」，或在工程终端执行：

```bash
npm i
# 也可用 pnpm i / yarn
```

### 4. 模拟器预览

依赖安装完成后点击「重新启动编译」，右侧模拟器即可实时预览计算器页面。修改 `src/pages/Calc/index.ux` 后自动刷新。

### 5. 打 debug 包

- 顶部工具栏点击「打包」；
- 包类型选择 **debug**（release 才需要生成签名，本次不做）；
- 打包成功后，`.rpk` 文件输出在工程的 `dist/` 目录。

### 6. 用 OrbitV 装到手表

1. 手表与手机/电脑开启蓝牙，关闭手表与其他设备的已配对连接；
2. 打开 OrbitV，连接你的 iQOO WATCH GT1；
3. 在应用/本地安装入口选择上一步生成的 `.rpk`，蓝牙推送安装；
4. 安装完成后在手表应用列表打开「腕上计算器」。

## 改成你自己的应用

- **改名称 / 包名**：编辑 `src/manifest.json` 的 `name`（桌面显示名，6 个汉字以内）和 `package`（`com.公司.模块` 格式，保证唯一）。
- **新增页面**：在 `src/pages/` 下新建目录，放 `index.ux`，然后在 `manifest.json` 的 `router.pages` 注册，并把 `router.entry` 指向它。
- **换图标**：替换 `src/assets/images/icon.png`（114×114），或修改 `scripts/generate-icon.mjs` 后重新执行：

```bash
node scripts/generate-icon.mjs
```

## 已知限制

- 官方 BlueOS Toolkit 随 BlueOS Studio 提供，公共 npm 上未单独发布；当前沙箱环境没有内置该构建工具，因此**这里没有直接产出 `.rpk`**。`.rpk` 必须在装有 BlueOS Studio 的电脑上按上面步骤打包。
- debug 包仅用于自测。若后续要上架官方商店，才需要走 release 签名和开放平台审核，本次不涉及。
- 若 OrbitV 推送时提示包体不兼容，优先核对：设备型号是否在 OrbitV 支持列表、rpk 是否为 debug 包、手表系统是否已升级到较新版本。

## 参考链接

- OrbitV 官网（.rpk 表盘 / 应用蓝牙安装说明）：<https://orbitv.cn/>
- BlueOS 手表开发文档（快速开始）：<https://developers-watch.vivo.com.cn/reference/quickstart/quick-start/>
- iQOO WATCH GT 官方参数：<https://www.vivo.com.cn/vivo/param/iqoowatchgt>
