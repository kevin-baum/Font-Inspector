let inspectionActive = false;

document.addEventListener('DOMContentLoaded', function() {
    const inspectBtn = document.getElementById("inspectBtn");

    inspectBtn.addEventListener("click", toggleInspection);

    chrome.runtime.onMessage.addListener((message) => {
        displayDataInPopup(message);
    });
});

function toggleInspection() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];

        // Überprüfen, ob die Seite keine "chrome://" URL ist
        if (activeTab.url.startsWith('chrome://')) {
            alert('Cannot inspect elements on chrome:// pages.');
            return; // Beende die Funktion, wenn die Seite eine "chrome://" URL ist
        }

        if (inspectionActive) {
            // Disable hover effect and fully deactivate plugin
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                func: disableElementHover
            });
            document.getElementById("inspectBtn").textContent = "On";
        } else {
            // Enable hover effect and activate plugin
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                func: enableElementHover
            });
            document.getElementById("inspectBtn").textContent = "Off";
        }
        inspectionActive = !inspectionActive;
    });
}

function displayDataInPopup(message) {
    const fontFamilyField = document.getElementById('fontFamily');
    const fontSizeField = document.getElementById('fontSize');
    const fontWeightField = document.getElementById('fontWeight');

    fontFamilyField.textContent = message.fontFamily;
    fontSizeField.textContent = message.fontSize;
    fontWeightField.textContent = message.fontWeight;
}

function enableElementHover() {
    let lastElement = null;

    function isTextElement(element) {
        const textElements = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'];
        return textElements.includes(element.tagName);
    }

    function highlightElement(event) {
        const element = event.target;
        if (!isTextElement(element)) {
            return;
        }

        if (lastElement) {
            lastElement.style.outline = '';
        }
        lastElement = element;
        lastElement.style.outline = '2px solid green';

        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        const fontSize = computedStyle.fontSize;
        const fontWeight = computedStyle.fontWeight;
        const fontSizeInEmRem = computedStyle.fontSize.includes('rem') || computedStyle.fontSize.includes('em') 
            ? computedStyle.fontSize 
            : convertToRemEm(fontSize);

        chrome.runtime.sendMessage({
            fontFamily: fontFamily,
            fontSize: fontSizeInEmRem,
            fontWeight: fontWeight
        });
    }

    function convertToRemEm(pxSize) {
        const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const pxValue = parseFloat(pxSize);
        return `${(pxValue / baseFontSize).toFixed(2)}rem`;
    }

    document.addEventListener('mouseover', highlightElement);
    document.body.style.cursor = 'crosshair';
}

function disableElementHover() {
    document.removeEventListener('mouseover', highlightElement);
    document.body.style.cursor = 'default';

    // Entferne den grünen Rahmen, wenn die Inspektion beendet wird
    const elements = document.querySelectorAll('*');
    elements.forEach((el) => {
        el.style.outline = '';
    });
}
