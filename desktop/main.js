// 澎湖元宵 Windows 版：直接開啟線上的元宵網頁，網頁更新後打開就是最新版，不用重新安裝
const { app, BrowserWindow, shell, Menu, screen, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const URL_HOME = 'https://bearbabybaby-ai.github.io/Lantern-Festival/';
const SITE = 'https://bearbabybaby-ai.github.io';
let win = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
  app.whenReady().then(start);
}

const dataFile = name => path.join(app.getPath('userData'), name);
function readJson(name, def) { try { return JSON.parse(fs.readFileSync(dataFile(name), 'utf8')); } catch (_) { return def; } }
function writeJson(name, v) { try { fs.writeFileSync(dataFile(name), JSON.stringify(v)); } catch (_) {} }

/* 記住視窗大小與位置 */
function loadState() {
  const st = readJson('window.json', null);
  if (st) return st;
  const wa = screen.getPrimaryDisplay().workAreaSize;
  return { width: Math.min(1500, wa.width), height: Math.min(900, wa.height) };
}
function saveState() {
  if (!win || win.isDestroyed()) return;
  writeJson('window.json', { ...win.getNormalBounds(), max: win.isMaximized() });
}

function start() {
  Menu.setApplicationMenu(null);
  const st = loadState();
  win = new BrowserWindow({
    x: st.x, y: st.y, width: st.width, height: st.height, minWidth: 900, minHeight: 600,
    title: '澎湖元宵', backgroundColor: '#fff7ec',
    icon: nativeImage.createFromPath(path.join(__dirname, 'icon.png')),
    webPreferences: { contextIsolation: true }
  });
  if (st.max) win.maximize();
  ['resize', 'move', 'close'].forEach(ev => win.on(ev, saveState));
  /* 導航、外部連結用瀏覽器開啟 */
  win.webContents.setWindowOpenHandler(({ url }) => { if (!url.startsWith(SITE)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(SITE)) { e.preventDefault(); shell.openExternal(url); } });
  win.loadURL(URL_HOME);
}

app.on('window-all-closed', () => app.quit());
