const os = require('node:os');

const serviceStartTime = Date.now();

function getHealth() {
    const startTime = Date.now();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    let version = "1.0.0";
    try {
        const config = require('../config.js');
        version = config.VERSION || "1.0.0";
    } catch {
        // Fallback if config/dotenv is not installed in local environment
    }

    return {
        status: "UP",
        serviceName: "vms_domain_application",
        version: version,
        uptimeSeconds: Math.floor((Date.now() - serviceStartTime) / 1000),
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        checks: {
            memory: {
                usedMb: Math.round(usedMemory / (1024 * 1024)),
                totalMb: Math.round(totalMemory / (1024 * 1024)),
                percentage: Number(((usedMemory / totalMemory) * 100).toFixed(1))
            }
        }
    };
}

module.exports = {
    getHealth
};
