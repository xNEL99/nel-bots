const fetch = require('node-fetch');
const fs = require('fs');
const handler = require('./handler');
const checkSock = require('./checker');

function scrapAndCheckSocks(){
    fs.writeFileSync('./socks.txt', ''); // Clear file
    fetch('http://www.vipsocks24.net/search?max-results=1')
    .then(res => res.text())
    .catch(err => handler.error(err))
    .then(res => {
        const url = res.match(/itemprop='name'>\s*<a\s*href='(.*?\.html)'>/i)[1];
        fetch(url)
        .then(res => res.text())
        .catch(err => handler.error(err))
        .then(res => {
            const socks = res.match(/wrap="hard">((?:[^\n]*(\n+))+)<\/textarea>/i)[1].trim();
            if(socks){
                handler.success();
                for(const sock of socks.split('\n')) checkSock(sock);
            }
        })
        .catch(err => handler.error(err));
    })
    .catch(err => handler.error(err));
}

module.exports = scrapAndCheckSocks;