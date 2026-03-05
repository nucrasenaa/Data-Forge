const { app, BrowserWindow, screen, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;
const { setupIpcHandlers } = require('./ipc-handlers');

// Register the app scheme as standard and secure
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

// Initialize IPC handlers for database operations
setupIpcHandlers();

function setupProtocol() {
    const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'font/otf'
    };

    protocol.handle('app', async (request) => {
        const urlObj = new URL(request.url);
        let pathname = urlObj.pathname;

        if (pathname === '/' || pathname === '') {
            pathname = '/index.html';
        }

        const normalizedPath = pathname.startsWith('/') ? pathname.substring(1) : pathname;
        let filePath = path.join(app.getAppPath(), 'out', normalizedPath);

        // Handle directories and fallbacks
        const checkPath = (p) => fs.existsSync(p) && !fs.statSync(p).isDirectory();
        const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

        if (isDir(filePath)) {
            const indexHtml = path.join(filePath, 'index.html');
            if (fs.existsSync(indexHtml)) {
                filePath = indexHtml;
            }
        } else if (!fs.existsSync(filePath)) {
            if (fs.existsSync(filePath + '.html')) {
                filePath += '.html';
            } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
                filePath = path.join(filePath, 'index.html');
            }
        }

        try {
            const data = await fs.promises.readFile(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = mimeTypes[ext] || 'application/octet-stream';
            return new Response(data, {
                headers: { 'Content-Type': mimeType }
            });
        } catch (err) {
            console.error(`[Protocol] Error reading ${filePath}:`, err);
            return new Response('File not found', { status: 404 });
        }
    });
}

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        icon: path.join(__dirname, isDev ? 'icon.png' : 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        title: "Data Forge - Database Explorer",
        backgroundColor: '#0f172a', // Use a color close to the app theme to reduce flash
        show: false,
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error(`[Load Error] URL: ${validatedURL}, Error: ${errorDescription} (${errorCode})`);
    });

    if (process.platform === 'darwin') {
        app.dock.setIcon(path.join(__dirname, 'icon.png'));
    }

    const startUrl = isDev
        ? 'http://localhost:3000'
        : 'app://local/index.html';

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    if (!isDev) {
        setupProtocol();
    }
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
