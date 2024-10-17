<script setup>
import Versions from './components/Versions.vue'

const checkUpdate = () => window.electron.ipcRenderer.send('check-for-update')
const appVersion = window.api.appVersion
window.api.onLogger((type = 'log', value) => {
  console[type]('【主进程】', value)
})
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    应用版本号:{{ appVersion }}
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="checkUpdate">检查更新</a>
    </div>
  </div>
  <Versions />
</template>
