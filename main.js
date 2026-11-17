const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let win;

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function createWindow() {
  win = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 420,
    minHeight: 480,
    backgroundColor: '#0c0d0d',
    autoHideMenuBar: true,
    title: 'Hideout Tracker',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
}

function setupUpdates() {
  // Only the installed app updates itself. `npm start` skips this.
  if (!app.isPackaged) return;

  autoUpdater.on('update-available', (info) => send('update-status', { state: 'downloading', version: info.version }));
  autoUpdater.on('update-downloaded', (info) => send('update-status', { state: 'ready', version: info.version }));
  autoUpdater.on('error', (err) => console.error('Update check failed:', err && err.message));

  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  win.webContents.once('did-finish-load', check);
  setInterval(check, 15 * 60 * 1000);
}

app.setAppUserModelId('local.hideout.tracker');

app.whenReady().then(() => {
  createWindow();
  setupUpdates();

  // Ctrl+Alt+H shows or hides the window from anywhere, including in-game.
  globalShortcut.register('CommandOrControl+Alt+H', () => {
    if (!win) return;
    if (win.isVisible() && win.isFocused()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  ipcMain.handle('get-version', () => app.getVersion());
  ipcMain.on('install-update', () => autoUpdater.quitAndInstall());
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
