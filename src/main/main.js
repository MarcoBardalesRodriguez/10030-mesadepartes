const { BrowserWindow, Menu } = require('electron')
const path = require('path')
const { template } = require('./menu')

function createWindow (pathIndex) {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
            // nodeIntegration: true,
            // contextIsolation:false,
            // enableRemoteModule: true
        }
    })
    win.loadFile(pathIndex)
    // win.webContents.openDevTools();
    
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

module.exports = {
    createWindow,
}