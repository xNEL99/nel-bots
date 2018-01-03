// ==UserScript==
// @name         Nel Bots
// @description  Best bots for agar clones
// @version      1.0.0
// @namespace    nel.bots
// @author       NEL99 <nel99@protonmail.com> (https://github.com/xNEL99)
// @match        *.agar.red/*
// @match        *.agar.bio/*
// @match        *.agar.pro/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js
// @grant        none
// ==/UserScript==

window.data = {
    origin: location.origin,
    serverIP: '',
    mouseX: 0,
    mouseY: 0,
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    offsetX: 0,
    offsetY: 0,
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
else if(data.origin === 'http://agar.pro'){
    const assignProp = (newObj, oldObj, prop) => {
        Object.defineProperty(newObj, prop, {
            get(){
                return oldObj[prop];
            },
            set(val){
                oldObj[prop] = val;
            },
            enumerable: true,
            configurable: true
        });
    };
	window._WebSocket = window.WebSocket;
	window.WebSocket = function(url){
		const ws = new _WebSocket(url);
        const props = ['binaryType', 'bufferedAmount', 'extensions', 'protocol', 'readyState', 'url'];
        const events = ['onopen', 'onerror', 'onclose', 'onmessage'];
        for(const prop of props) assignProp(this, ws, prop);
        this.send = function(buffer){
            const dataView = new DataView(buffer);
            if(dataView.getUint8(0) === 16 && dataView.byteLength === 21){
                data.mouseX = dataView.getFloat64(1, true) - data.offsetX;
                data.mouseY = dataView.getFloat64(9, true) - data.offsetY;
                socket.emit('mouse', data.mouseX, data.mouseY);
            }
            if(data.log) console.log(new Uint8Array(buffer));
            return ws.send.call(ws, buffer);
        };
        this.close = function(){
            return ws.close.call(ws);
        };
        for(const event of events) this[event] = function(e){};
        ws.onopen = function(e){
			data.serverIP = this.url;
            if(this.onopen) return this.onopen.call(ws, e);
        }.bind(this);
        ws.onmessage = function(message){
            const msg = new DataView(message.data);
            if(msg.getUint8(0) === 64 && msg.byteLength === 33){
                data.minX = msg.getFloat64(1, true);
                data.minY = msg.getFloat64(9, true);
                data.maxX = msg.getFloat64(17, true);
                data.maxY = msg.getFloat64(25, true);
                data.offsetX = (data.minX + data.maxX) / 2;
                data.offsetY = (data.minY + data.maxY) / 2;
            }
            if(this.onmessage) return this.onmessage.call(ws, message);
        }.bind(this);
        ws.onerror = function(err){
            if(this.onerror) return this.onerror.call(ws, err);
        }.bind(this);
        ws.onclose = function(e){
            if(this.onclose) return this.onclose.call(ws, e);
        }.bind(this);
	};
	window.WebSocket.prototype = window._WebSocket;
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