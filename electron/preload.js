const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('salesKit', {
  getJavaPort: () => ipcRenderer.invoke('get-java-port'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
})
