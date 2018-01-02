// ==UserScript==
// @name         Nel Bots
// @description  Best bots for agar clones
// @version      1.0.0
// @namespace    nel.bots
// @author       NEL99 <nel99@protonmail.com> (https://github.com/xNEL99)
// @match        *.agar.red/*
// @match        *.agar.bio/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js
// @grant        none
// ==/UserScript==

window.data = {
    origin: location.origin,
    serverIP: '',
    mouseX: 0,
    mouseY: 0,
    log: false
};

const socket = io('ws://localhost:8080');

// 'Bypass' agar.red anti adblock
if(data.origin === 'http://agar.red'){
    document.getElementById('adblock-message').parentNode.removeChild(document.getElementById('adblock-message'));
    document.getElementById('play-btn').style.display = 'block';
}

document.addEventListener('keydown', e => {
    if(e.key === 'x') socket.emit('start', data.origin, data.serverIP);
    if(e.key === 'y') socket.emit('stop');
    if(e.key === 't') socket.emit('split');
    if(e.key === 'a') socket.emit('eject');
});

if(data.origin === 'http://agar.bio'){
    WebSocket.prototype.prototype._send = WebSocket.prototype.prototype.send; // Gj agar.bio
    WebSocket.prototype.prototype.send = function(buffer){
        const dataView = new DataView(buffer);
        if(dataView.getUint8(0) === 16 && dataView.byteLength === 21){
            data.mouseX = dataView.getFloat64(1, true);
            data.mouseY = dataView.getFloat64(9, true);
            socket.emit('mouse', data.mouseX, data.mouseY);
        }
        if(data.log) console.log(new Uint8Array(buffer));
        data.serverIP = this.url;
        this._send(buffer);
    };
}
else {
    WebSocket.prototype._send = WebSocket.prototype.send;
    WebSocket.prototype.send = function(buffer){
        const dataView = new DataView(buffer);
        if(dataView.getUint8(0) === 16){
            if(dataView.byteLength === 21){
                data.mouseX = dataView.getFloat64(1, true);
                data.mouseY = dataView.getFloat64(9, true);
            }
            else if(dataView.byteLength === 13){
                data.mouseX = dataView.getInt32(1, true);
                data.mouseY = dataView.getInt32(5, true);
            }
            socket.emit('mouse', data.mouseX, data.mouseY);
        }
        if(data.log) console.log(new Uint8Array(buffer));
        data.serverIP = this.url;
        this._send(buffer);
    };
}