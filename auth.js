'use strict';

const url           = require('url'),
      qs            = require('querystring'),
      BrowserWindow = require('browser-window'),
      shell         = require('shell'),
      _             = require('lodash'),
      debug         = require('debug')('electron-vk:auth');

const redirectUri = 'https://oauth.vk.com/blank.html';

let authWindow = null;

function auth (client_id) {
    return new Promise(function (resolve) {
        // todo load error handing

        let token = null;

        authWindow = new BrowserWindow({
            width:          600,
            height:         400,
            type:           'splash',
            webPreferences: {
                nodeIntegration: false
            }
        });

        authWindow.on('closed', function () {
            debug('Authentication window has been closed');
            authWindow = null;
            resolve(token);
        });

        authWindow.webContents.on('new-window', function (e, url) {
            e.preventDefault();
            shell.openExternal(url);
        });

        authWindow.webContents.on('did-get-redirect-request', function (e, oldUrl, newUrl) {
            if (newUrl.indexOf(redirectUri) !== 0)
                return;

            const hash  = url.parse(newUrl).hash.substr(1);
            token = _.get(qs.parse(hash), 'access_token');

            debug('Received token', token);

            authWindow.close();
        });

        authWindow.loadURL(url.format({
            protocol: 'https',
            host:     'oauth.vk.com',
            pathname: 'authorize',
            query:    {
                client_id:     client_id,
                scope:         [ 'audio' ].join(','),
                redirect_uri:  redirectUri,
                display:       'popup',
                v:             '5.41',
                response_type: 'token'
            }
        }));
    });
}

module.exports = auth;
