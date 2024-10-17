import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import ico from '../../resources/icon.ico?asset'

let mainWindow
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 监听窗口的关闭事件
  mainWindow.on('close', (e) => {
    // 阻止窗口关闭
    e.preventDefault()
    mainWindow.hide()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  mainWindow.webContents.openDevTools()

  // 托盘
  let tray = new Tray(nativeImage.createFromPath(ico))
  let contextMenu = Menu.buildFromTemplate([
    {
      label: '意见反馈',
      click: () => console.log('点击了意见反馈')
    },
    {
      label: '帮助中心',
      click: () => console.log('点击了帮助中心')
    },
    {
      label: '更新检测',
      click: () => console.log('点击了更新检测')
    },
    {
      label: '退出',
      click: () => app.exit()
    }
  ])

  tray.setToolTip('华制数字人') // 鼠标悬停托盘系统图标显示
  tray.setContextMenu(contextMenu)

  tray.on('click', () => mainWindow.show()) // 单机托盘图标打开应用程序
}
// logger
const logFun = (type, message) => {
  mainWindow.webContents.send('logger', type, message)
}
// const logLog = (message) => {
//   logFun('log', message)
// }
const logInfo = (message) => {
  logFun('info', message)
}
const logError = (message) => {
  logFun('error', message)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // // IPC test
  // ipcMain.on('ping', () => console.log('pong'))

  createMainWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// 更新（基于electron-updater）

// dev-start, 这里是为了在本地做应用升级测试使用，正式环境请务必删除
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  // Object.defineProperty(electronApp, "isPackaged", {
  // get: () => true,
  // });
  autoUpdater.forceDevUpdateConfig = true // 强制使用开发环境的配置文件,期望代替更改isPackaged，以免影响其他业务
  autoUpdater.updateConfigPath = join(__dirname, '../../dev-app-update.yml')
}
// dev-end

const checkForUpdates = () => {
  // 检测是否有更新包并通知
  autoUpdater.checkForUpdatesAndNotify().catch(logError)
}

// 触发检查更新(此方法用于被渲染线程调用，例如页面点击检查更新按钮来调用此方法)
ipcMain.on('check-for-update', () => {
  logInfo('触发检查更新')
  checkForUpdates()
})

// 自动检查更新
// setInterval(checkForUpdates, 60 * 1000 * 60)

// 设置自动下载为false(默认为true，检测到有更新就自动下载)
autoUpdater.autoDownload = false
// 检测下载错误
autoUpdater.on('error', (error) => {
  logError('更新异常', error)
})

// 检测是否需要更新
autoUpdater.on('checking-for-update', () => {
  logInfo('正在检查更新……')
})
// 检测到可以更新时
autoUpdater.on('update-available', (releaseInfo) => {
  logInfo('检测到新版本，确认是否下载')
  const releaseNotes = releaseInfo.releaseNotes
  let releaseContent = ''
  if (releaseNotes) {
    if (typeof releaseNotes === 'string') {
      releaseContent = releaseNotes
    } else if (releaseNotes instanceof Array) {
      releaseNotes.forEach((releaseNote) => {
        releaseContent += `${releaseNote}\n`
      })
    }
  } else {
    releaseContent = '暂无更新说明'
  }
  // 弹框确认是否下载更新（releaseContent是更新日志）
  dialog
    .showMessageBox({
      type: 'info',
      title: '应用有新的更新',
      detail: releaseContent,
      message: '发现新版本，是否现在更新？',
      buttons: ['否', '是']
    })
    .then(({ response }) => {
      if (response === 1) {
        // 下载更新
        autoUpdater.downloadUpdate()
      }
    })
})
// 检测到不需要更新时
autoUpdater.on('update-not-available', () => {
  logInfo('现在使用的就是最新版本，不用更新')
})
// 更新下载进度
autoUpdater.on('download-progress', (progress) => {
  logInfo('下载进度', progress)
})
// 当需要更新的内容下载完成后
autoUpdater.on('update-downloaded', () => {
  logInfo('下载完成，准备更新')
  dialog
    .showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
    })
    .then(() => {
      // 退出并安装应用
      setImmediate(() => autoUpdater.quitAndInstall())
    })
})
