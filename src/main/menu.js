const { app } = require('electron')

const template = [
    {
        label: 'Menu',
        submenu: [
            { role: 'reload' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'minimize' }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Contactar creador',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://marcobardalesrodriguez.site')
                }
            }
        ]
    }
]

module.exports = {
    template
}