import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';

dotenv.config();

const isDev = process.env.NODE_ENV === 'development';
let mainWindow;
let tray;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 560,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  const startUrl = isDev
    ? 'http://localhost:5173'
    : url.format({
        pathname: path.join(__dirname, 'renderer/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const registerShortcuts = () => {
  globalShortcut.register('Alt+Space', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  globalShortcut.register('Alt+Shift+A', () => {
    mainWindow?.webContents.send('hotkey', { action: 'compose-reply' });
  });

  globalShortcut.register('Alt+Shift+N', () => {
    mainWindow?.webContents.send('hotkey', { action: 'add-note' });
  });
};

const createTray = () => {
  tray = new Tray(nativeImage.createEmpty());
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Gluely',
      click: () => mainWindow?.show(),
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Gluely Copilot');
  tray.setContextMenu(contextMenu);
};

app.on('ready', () => {
  createWindow();
  registerShortcuts();
  createTray();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
