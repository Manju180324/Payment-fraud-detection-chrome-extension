require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function checkGoogleSafeBrowsing(url) {
    try {
        const response = await axios.post(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`,
            {
                client: { clientId: "fraudDetector", clientVersion: "1.0" },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url }]
                }
            }
        );

        return response.data.matches ? { status: "danger", message: "Unsafe site!" } : { status: "safe" };
    } catch {
        return { status: "error", message: "Google API error" };
    }
}

module.exports = checkGoogleSafeBrowsing;
