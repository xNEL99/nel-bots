const WebSocket = require('ws');
const io = require('socket.io')(8080);
const socks = require('socks');
const fs = require('fs');
const Packets = require('./packets');

let bots = [];
const socksList = fs.readFileSync('./socks/socks.txt', 'utf8').trim().split('\n');
const data = {
    origin: '',
    serverIP: '',
    mouseX: 0,
    mouseY: 0
};

io.on('connection', socket => {
    console.log('[SERVER]: Connected!');
    socket.on('start', (origin, ip) => {
        data.origin = origin;
        data.serverIP = ip;
        if(data.origin === 'http://agar.red'){
            let id = 0;
            setInterval(() => {
                if(id < socksList.length){
                    bots.push(new Bot(id));
                    id++;
                }
            }, 300);
        }
        else for(const id in socksList) bots.push(new Bot(id));
        console.log('[SERVER]: Bots started!');
    });
    socket.on('stop', () => {
        for(const i in bots) bots[i].ws.close();
        bots = [];
        console.log('[SERVER]: Bots stopped!');
    });
    socket.on('mouse', (x, y) => {
        data.mouseX = x;
        data.mouseY = y;
    });
    socket.on('split', () => {
        for(const i in bots) bots[i].send(new Buffer([17]));
    });
    socket.on('eject', () => {
        for(const i in bots) bots[i].send(new Buffer([21]));
    });
    socket.on('disconnect', () => {
        console.log('[SERVER]: Disconnected!');
    });
});

class Bot extends Packets {
    constructor(id){
        super();
        this.id = id;
        this.name = `NEL99#${this.id}`;
        this.ws = null;
        this.headers = {
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ca-ES,ca;q=0.9,en;q=0.8,es;q=0.7,ig;q=0.6',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
        };
        if(data.origin === 'http://agar.red') this.headers['Cache-Control'] = 'no-cache';
        this.sock = socksList[this.id].split(':');
        this.agent = new socks.Agent({
            proxy: {
                ipaddress: this.sock[0],
                port: Number(this.sock[1]),
                type: 5
            }
        });
        this.connectionAttempts = 0;
        this.connect();
    }
    connect(){
        this.ws = new WebSocket(data.serverIP, {
            origin: data.origin,
            headers: this.headers,
            agent: this.agent
        });
        this.ws.binaryType = 'nodebuffer';
        this.ws.onopen = this.onopen.bind(this);
        this.ws.onerror = this.onerror.bind(this);
        this.ws.onclose = this.onclose.bind(this);
    }
    send(buffer){
        if(this.ws.readyState === WebSocket.OPEN) this.ws.send(buffer);
    }
    onopen(){
        this.send(this[data.origin]().handshakeProtocol);
        this.send(this[data.origin]().handshakeKey);
        if(this[data.origin]().ping && this[data.origin]().pingTime){
            setInterval(function(){
                this.send(this[data.origin]().ping);
            }.bind(this), this[data.origin]().pingTime);
        }
        setInterval(function(){
            this.send(this[data.origin]().spawn(this.name));
        }.bind(this), 1000);
        setInterval(function(){
            this.send(this[data.origin]().move(data.mouseX, data.mouseY));
        }.bind(this), 100);
        if(process.argv[2] === '--verbose') console.log(`[Bot#${this.id}]: Connection opened`);
    }
    onerror(err){
        this.connectionAttempts++;
        if(this.connectionAttempts === 3) this.ws.close();
        else this.connect();
        if(process.argv[2] === '--verbose') console.log(`[Bot#${this.id}]: Connection error: ${err}`);
    }
    onclose(e){
        if(process.argv[2] === '--verbose') console.log(`[Bot#${this.id}]: Connection closed: ${e.reason ? e.reason : e.code ? e.code : e}`);
    }
}