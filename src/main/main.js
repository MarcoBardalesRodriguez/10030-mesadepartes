const { BrowserWindow } = require('electron')
const path = require('path')

function createWindow (pathIndex) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
            // nodeIntegration: true,
            // contextIsolation:false,
            // enableRemoteModule: true
        }
    })
    win.loadFile(pathIndex)
    // win.webContents.openDevTools();
}

module.exports = {
    createWindow,
}