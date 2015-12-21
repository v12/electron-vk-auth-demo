'use strict';

const app           = require('app'),
      BrowserWindow = require('browser-window'),
      debug         = require('debug')('electron-vk');

const auth = require('./auth');

const appId = process.env.VK_APP_ID;
if (!appId) {
    console.error('VK application `client_id` should be set');
    app.quit();
}

let mainWindow = null;

app.on('window-all-closed', function () {
    debug('All windows were closed. Terminating app...');
    app.quit();
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({ width: 800, height: 600, show: false });
    mainWindow.on('closed', function () {
        debug('Main window has been closed');
        mainWindow = null;
    });

    function startApp (access_token) {
        debug('Starting app', access_token);

        return new Promise(function (resolve, reject) {
            mainWindow.loadURL('file://' + __dirname + '/app/' +
                (access_token !== null ? 'index.html?access_token=' + access_token : 'no-auth.html'));

            mainWindow.webContents.once('did-finish-load', function () {
                debug('App has been successfully loaded');

                mainWindow.show();

                resolve();
            });

            mainWindow.webContents.once('did-fail-load', e => reject(e))
        });
    }

    auth(appId)
        .then(startApp)
        .then(() => debug('Finished application initialization'))
        .catch(function (e) {
            console.error('Unable to start app', e);
        });
});
