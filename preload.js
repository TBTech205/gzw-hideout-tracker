const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hideout', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  onUpdate: (cb) => ipcRenderer.on('update-status', (_e, payload) => cb(payload)),
  installUpdate: () => ipcRenderer.send('install-update')
});
