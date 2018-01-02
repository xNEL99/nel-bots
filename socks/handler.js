const handler = {
    success(){
        console.log('[SERVER]: Socks scrapped successfully!');
    },
    error(err){
        console.log(`[SERVER]: Error scrapping socks!: ${err}`);
    },
    successWriting(){
        console.log('[SERVER]: Socks file written successfully!');
    },
    errorWriting(err){
        console.log(`[SERVER]: Error writing socks file!: ${err}`);
    },
    successConnecting(sock){
        console.log(`[${sock}]: Working! :)`);
    },
    errorConnecting(sock){
        console.log(`[${sock}]: Not Working! :(`);
    }
};

module.exports = handler;