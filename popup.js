// Handles UI interactions
document.addEventListener('DOMContentLoaded', () => {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const alertsList = document.getElementById('alertsList');
    const scanPageBtn = document.getElementById('scanPage');
    const reportFraudBtn = document.getElementById('reportFraud');
    const settingsBtn = document.getElementById('settingsBtn');

    // Initialize the extension
    initializeExtension();

    // Event Listeners
    scanPageBtn.addEventListener('click', handlePageScan);
    reportFraudBtn.addEventListener('click', handleFraudReport);
    settingsBtn.addEventListener('click', openSettings);

    async function initializeExtension() {
        try {
            // Get current tab information
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            // Check if we're on a payment page
            if (isPaymentPage(tab.url)) {
                await performSecurityCheck(tab);
            }

            // Load recent alerts
            await loadRecentAlerts();
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to initialize the extension');
        }
    }

    async function performSecurityCheck(tab) {
        try {
            if (!tab || !tab.id) {
                throw new Error('Invalid tab');
            }

            // Get page content from content script
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' });
            
            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to get page content');
            }

            // Send to backend for analysis
            const backendResponse = await fetch('http://localhost:3000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url: tab.url,
                    content: response.content
                })
            });

            if (!backendResponse.ok) {
                throw new Error('Server response was not ok');
            }

            const data = await backendResponse.json();
            updateRiskIndicators(data.riskScore, data.threats);
        } catch (error) {
            console.error('Security check error:', error);
            showError(error.message || 'Failed to perform security check');
        }
    }

    function updateRiskIndicators(score, threats) {
        // Update risk meter
        riskLevel.style.width = `${score * 100}%`;
        riskScore.textContent = Math.round(score * 100);

        // Update color based on risk level
        if (score < 0.3) {
            riskLevel.style.backgroundColor = 'var(--success-color)';
        } else if (score < 0.7) {
            riskLevel.style.backgroundColor = 'var(--warning-color)';
        } else {
            riskLevel.style.backgroundColor = 'var(--danger-color)';
        }

        // Display threats if any
        if (threats && threats.length > 0) {
            displayThreats(threats);
        }
    }

    function displayThreats(threats) {
        alertsList.innerHTML = threats.map(threat => `
            <div class="alert-item">
                <strong>${threat.type}</strong>
                <p>${threat.description}</p>
            </div>
        `).join('');
    }

    async function handlePageScan() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('No active tab found');
            }
            await performSecurityCheck(tab);
        } catch (error) {
            console.error('Page scan error:', error);
            showError(error.message || 'Failed to scan page');
        }
    }

    function handleFraudReport() {
        chrome.tabs.create({ url: 'report.html' });
    }

    function openSettings() {
        chrome.tabs.create({ url: 'settings.html' });
    }

    function isPaymentPage(url) {
        if (!url) return false;
        const paymentDomains = [
            'checkout.stripe.com',
            'paypal.com',
            'checkout.amazon.com'
        ];
        return paymentDomains.some(domain => url.includes(domain));
    }

    function showError(message) {
        alertsList.innerHTML = `
            <div class="alert-item" style="border-left-color: var(--danger-color)">
                <strong>Error</strong>
                <p>${message}</p>
            </div>
        `;
    }

    async function loadRecentAlerts() {
        try {
            const { recentAlerts = [] } = await chrome.storage.local.get(['recentAlerts']);
            if (recentAlerts.length > 0) {
                displayThreats(recentAlerts);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
            showError('Failed to load recent alerts');
        }
    }
});