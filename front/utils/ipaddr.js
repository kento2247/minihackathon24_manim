const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    let localIP = '';

    Object.keys(interfaces).forEach((iface) => {
        interfaces[iface].forEach((details) => {
            if (details.family === 'IPv4' && !details.internal) {
                localIP = details.address;
            }
        });
    });

    return localIP;
}

module.exports = { getLocalIP };
