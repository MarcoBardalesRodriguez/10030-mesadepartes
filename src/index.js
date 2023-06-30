const { app, ipcMain } = require('electron')
const { createWindow } = require('./main/main')

const path = require('path')
const pathIndex = path.join(__dirname, 'renderer', 'index.html')

const { initDatabase } = require('./main/Model/init_database')
const { userSelect } = require('./main/Model/user')
const { newLog, getLogs, getLog, updateLog, deleteLog, searchLog } = require('./main/Model/log')

require('electron-reload')(__dirname)

app.whenReady().then( () => { 
    ipcMain.handle('initDatabase', initDatabase)
    ipcMain.handle('user:select', userSelect)
    ipcMain.handle('log:new', newLog)
    ipcMain.handle('log:getWithLimit', getLogs)
    // ipcMain.handle('log:getByDate', getLogsByDate)
    ipcMain.handle('log:get', getLog)
    ipcMain.handle('log:update', updateLog)
    ipcMain.handle('log:delete', deleteLog)
    ipcMain.handle('log:search', searchLog)
    createWindow(pathIndex) 
})