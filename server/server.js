// Node.js backend to call security APIs

const express = require('express');
const cors = require('cors');
const checkGoogleSafeBrowsing = require('./google');
const checkVirusTotal = require('./virustotal');
require('dotenv').config();

const app = express(); // ✅ Initialize app before using it
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple risk scoring function
function calculateRiskScore(content) {
    let riskScore = 0;
    const threats = [];

    if (content.forms && content.forms.length > 0) {
        content.forms.forEach(form => {
            const sensitiveFields = form.inputs.filter(input => 
                ['password', 'credit', 'card', 'cvv', 'ssn'].some(term => 
                    input.name?.toLowerCase().includes(term) || 
                    input.id?.toLowerCase().includes(term)
                )
            );

            if (sensitiveFields.length > 0) {
                riskScore += 0.3;
                threats.push({ type: 'Sensitive Data Collection', description: 'This page collects sensitive information. Ensure you trust this website.' });
            }

            if (!form.action.startsWith('https://')) {
                riskScore += 0.4;
                threats.push({ type: 'Insecure Form Submission', description: 'This form submits data over an insecure connection.' });
            }
        });
    }

    if (content.scripts) {
        const suspiciousScripts = content.scripts.filter(script => 
            !script.startsWith('https://') || script.includes('suspicious-domain.com')
        );

        if (suspiciousScripts.length > 0) {
            riskScore += 0.2;
            threats.push({ type: 'Suspicious Scripts', description: 'The page contains scripts from potentially unsafe sources.' });
        }
    }

    if (content.url) {
        const suspiciousPatterns = ['phishing', 'secure-verification', 'account-verify', 'login-secure'];

        if (suspiciousPatterns.some(pattern => content.url.toLowerCase().includes(pattern))) {
            riskScore += 0.3;
            threats.push({ type: 'Suspicious URL', description: 'The URL contains suspicious patterns commonly associated with fraud.' });
        }
    }

    riskScore = Math.min(riskScore, 1);
    return { riskScore, threats };
}

// API endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { url, content } = req.body;

        if (!url || !content) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const analysis = calculateRiskScore(content);

        const [googleCheck, virusTotalCheck] = await Promise.all([
            checkGoogleSafeBrowsing(url),
            checkVirusTotal(url)
        ]);

        if (googleCheck.status === "danger") {
            analysis.riskScore += 0.5;
            analysis.threats.push({ type: 'Google Safe Browsing Alert', description: googleCheck.message });
        }

        if (virusTotalCheck.status === "danger") {
            analysis.riskScore += 0.5;
            analysis.threats.push({ type: 'VirusTotal Alert', description: virusTotalCheck.message });
        }

        analysis.riskScore = Math.min(analysis.riskScore, 1);

        res.json({ url, ...analysis });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
