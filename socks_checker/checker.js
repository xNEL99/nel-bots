const WebSocket = require('ws');
const socks = require('socks');
const fs = require('fs');
const handler = require('./handler');

function checkSock(sock){
    const ws = new WebSocket('ws://echo.websocket.org', {
        agent: new socks.Agent({
            proxy: {
                ipaddress: sock.split(':')[0],
                port: Number(sock.split(':')[1]),
                type: 5
            }
        })
    });
    ws.onopen = function(){
        if(ws.readyState === WebSocket.OPEN){
            fs.appendFile('./socks.txt', `${sock}\n`, err => {
                if(err) return handler.errorWriting(err);
                handler.successWriting();
                handler.successConnecting(sock);
            });
            this.close();
        }
    };
    ws.onerror = function(){
        handler.errorConnecting(sock);
    };
}

module.exports = checkSock;