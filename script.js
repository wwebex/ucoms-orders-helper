// ==UserScript==
// @name         Highlight Quantity and Keywords in Order Details
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  ucoms-quantity-keywords-highlighter
// @author       оксимирон из лондона)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // settings
    const COLOR_WARNING = '#fbbc04';
    const COLOR_DANGER = '#DB4437';
    const COLOR_HIGHLIGHT = '#1a73e8';
    const FONT_BOLD = true;
    const KEYWORDS = ["HDD", "WI-FI"];

    function updateStyles() {
        // quantity highlighting
        document.querySelectorAll('span').forEach(span => {
            const match = span.textContent.match(/(\d+) (шт\.)/);
            if (match) {
                let count = parseInt(match[1], 10);
                let color = count > 5 ? COLOR_DANGER : COLOR_WARNING;
                let fontWeight = FONT_BOLD ? 'bold' : 'normal';
                span.innerHTML = `${match[1]} <span style="font-weight:${fontWeight}; color:${color};">${match[2]}</span>`;
            }
        });

        // keywords highlighting
        document.querySelectorAll('div[class^="order-details-body-cell-content-breakWord_"]').forEach(div => {
            let html = div.innerHTML;

            KEYWORDS.forEach(keyword => {
                const regex = new RegExp(`(${keyword})`, 'gi');
                let fontWeight = FONT_BOLD ? 'bold' : 'normal';
                html = html.replace(regex, `<span style="color:${COLOR_HIGHLIGHT}; font-weight:${fontWeight};">$1</span>`);
            });

            div.innerHTML = html;
        });
    }

    updateStyles();

    const observer = new MutationObserver(updateStyles);
    observer.observe(document.body, { childList: true, subtree: true });
})();