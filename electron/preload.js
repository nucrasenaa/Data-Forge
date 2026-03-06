const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    version: process.versions.electron,
    db: {
        test: (config) => ipcRenderer.invoke('db:test', config),
        query: (args) => ipcRenderer.invoke('db:query', args),
        metadata: (config) => ipcRenderer.invoke('db:metadata', config),
        update: (args) => ipcRenderer.invoke('db:update', args),
        procSnippet: (args) => ipcRenderer.invoke('db:procedure-snippet', args),
        getDDL: (args) => ipcRenderer.invoke('db:get-ddl', args),
        erd: (config) => ipcRenderer.invoke('db:erd', config),
        columns: (args) => ipcRenderer.invoke('db:columns', args),
        performance: (config) => ipcRenderer.invoke('db:performance', config)
    },
    ai: {
        test: (config) => ipcRenderer.invoke('ai:test', config),
        generate: (args) => ipcRenderer.invoke('ai:generate', args)
    },
    window: {
        open: (args) => ipcRenderer.invoke('window:open', args)
    },
    crypto: {
        encrypt: (text) => ipcRenderer.invoke('crypto:encrypt', text),
        decrypt: (text) => ipcRenderer.invoke('crypto:decrypt', text)
    }
});
