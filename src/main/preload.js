const { contextBridge, ipcRenderer } = require('electron')
// const path = require('path')
// console.log(__dirname)
// const { initDatabase } = require('./init_database')

contextBridge.exposeInMainWorld('electronAPI', {
    initDatabase: async () => { ipcRenderer.invoke('initDatabase')},
    userSelect: async (query) => {
        return await ipcRenderer.invoke('user:select', query)
    },
    logNew: async (log) => { ipcRenderer.invoke('log:new', log)},
    logGetWithLimit: async (start, step) => { return await ipcRenderer.invoke('log:getWithLimit', start, step)},
    // logGetByDate: async (date) => { return await ipcRenderer.invoke('log:getByDate', date)},
    logGet: async (id) => { return await ipcRenderer.invoke('log:get', id)},
    logUpdate: async (log) => { ipcRenderer.invoke('log:update', log)},
    logDelete: async (id) => { ipcRenderer.invoke('log:delete', id)},
    logSearch: async (text) => { return await ipcRenderer.invoke('log:search', text)}
})


