// Content script for extracting page information
function extractPageContent() {
    const content = {
        url: window.location.href,
        title: document.title,
        text: document.body.innerText,
        forms: Array.from(document.forms).map(form => ({
            action: form.action,
            method: form.method,
            inputs: Array.from(form.elements).map(el => ({
                type: el.type,
                name: el.name,
                id: el.id
            }))
        })),
        links: Array.from(document.links).map(link => link.href),
        scripts: Array.from(document.scripts).map(script => script.src).filter(src => src)
    };
    return content;
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_CONTENT') {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'GET_PAGE_CONTENT') {
                sendResponse({ success: true, content: document.body.innerText });
            }
        });
        try {
            const content = extractPageContent();
            sendResponse({ success: true, content });
        } catch (error) {
            console.error('Error extracting page content:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    return true; // Required for async response
});
