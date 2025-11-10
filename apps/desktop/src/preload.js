import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('gluely', {
  onHotkey: (callback) => {
    const listener = (_, payload) => callback(payload);
    ipcRenderer.on('hotkey', listener);
    return () => ipcRenderer.removeListener('hotkey', listener);
  },
});
