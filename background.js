// Background service worker for Manifest V3

// Service worker setup
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
});

// Keep service worker active
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});

// Main functionality
chrome.webNavigation.onCompleted.addListener(async (details) => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        const url = tab.url;
        if (!url) return;

        // Check if it's a payment page
        const paymentDomains = ['checkout.stripe.com', 'paypal.com', 'checkout.amazon.com'];
        if (!paymentDomains.some(domain => url.includes(domain))) return;

        const response = await fetch("http://localhost:5000/check-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        
        if (data.status === "danger") {
            await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: 'Fraud Warning',
                message: `Warning! This site is flagged as fraudulent: ${data.message}`
            });

            // Store the alert in local storage
            const alert = {
                type: 'Fraud Warning',
                description: data.message,
                timestamp: new Date().toISOString()
            };

            const { recentAlerts = [] } = await chrome.storage.local.get(['recentAlerts']);
            recentAlerts.unshift(alert);
            
            // Keep only the 5 most recent alerts
            await chrome.storage.local.set({
                recentAlerts: recentAlerts.slice(0, 5)
            });
        }
    } catch (error) {
        console.error('Error in background script:', error);
    }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_CONTENT') {
        // Forward the message to the content script
        chrome.tabs.sendMessage(sender.tab.id, request, response => {
            sendResponse(response);
        });
        return true; // Required for async response
    }
});
