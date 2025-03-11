// VirusTotal API logic
require('dotenv').config();
const axios = require('axios');

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

async function checkVirusTotal(url) {
    try {
        const response = await axios.get(
            `https://www.virustotal.com/api/v3/urls/${Buffer.from(url).toString('base64')}`,
            {
                headers: { 'x-apikey': VIRUSTOTAL_API_KEY }
            }
        );

        const malicious = response.data.data.attributes.last_analysis_stats.malicious;
        return malicious > 0
            ? { status: "danger", message: "VirusTotal flagged this site as unsafe!" }
            : { status: "safe" };
    } catch {
        return { status: "error", message: "VirusTotal API error" };
    }
}

module.exports = checkVirusTotal;
