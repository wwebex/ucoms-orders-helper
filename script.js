// ==UserScript==
// @name         Highlight Quantity and Keywords in Order Details
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  highlighting quantity and keywords ozon+yandex.market
// @author       оксимирон)))
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const COLOR_WARNING = '#fbbc04';
    const COLOR_DANGER = '#DB4437';
    const COLOR_HIGHLIGHT = '#1a73e8';
    const FONT_BOLD = true;
    const KEYWORDS = ["HDD", "WI-FI"];

    function isProductId(text) {
        // Проверка на формат строки типа ju-gmrum2-532-5500-rx6600-hdd1
        const productIdRegex = /^[a-z0-9\-]+$/i;
        return productIdRegex.test(text);
    }

    function highlightQuantity() {
        document.querySelectorAll('span').forEach(span => {
            if (span.dataset.__highlightedQty) return;

            const regex = /(\d+)\s?(шт\.)/i;
            const match = span.textContent.match(regex);
            if (match) {
                const count = parseInt(match[1]);
                const fullMatch = match[0];
                const color = count > 5 ? COLOR_DANGER : COLOR_WARNING;

                const styledSpan = document.createElement('span');
                styledSpan.textContent = fullMatch;
                styledSpan.style.fontWeight = FONT_BOLD ? 'bold' : 'normal';
                styledSpan.style.color = color;

                span.innerHTML = span.innerHTML.replace(regex, styledSpan.outerHTML);
                span.dataset.__highlightedQty = "true";
            }
        });
    }

    function highlightOrderDescriptions() {
        document.querySelectorAll('div[class*="order-details-body-cell-content"]').forEach(div => {
            if (div.dataset.__highlightedKw) return;
            let html = div.innerHTML;
            KEYWORDS.forEach(keyword => {
                const regex = new RegExp(`(${keyword})`, 'gi');
                html = html.replace(regex, `<span style="color:${COLOR_HIGHLIGHT}; font-weight:${FONT_BOLD ? 'bold' : 'normal'};">$1</span>`);
            });
            if (html !== div.innerHTML) {
                div.innerHTML = html;
                div.dataset.__highlightedKw = "true";
            }
        });
    }

    function highlightYandexMarket() {
        document.querySelectorAll('span[class*="___Tag___"]').forEach(span => {
            if (span.dataset.__highlightedYm) return;

            let textContent = span.textContent.trim();

            if (isProductId(textContent)) return;

            // Подсветка количества товаров (например, 3 шт.)
            const regexQty = /(\d+)\s?(шт\.)/i;
            const matchQty = span.textContent.match(regexQty);
            if (matchQty) {
                const count = parseInt(matchQty[1]);
                const fullMatch = matchQty[0];
                const color = count > 5 ? COLOR_DANGER : COLOR_WARNING;

                const styledSpan = document.createElement('span');
                styledSpan.textContent = fullMatch;
                styledSpan.style.fontWeight = FONT_BOLD ? 'bold' : 'normal';
                styledSpan.style.color = color;

                span.innerHTML = span.innerHTML.replace(regexQty, styledSpan.outerHTML);
            }

            // Подсветка ключевых слов в описаниях
            let html = span.innerHTML;
            KEYWORDS.forEach(keyword => {
                const regexKw = new RegExp(`(${keyword})`, 'gi');
                html = html.replace(regexKw, `<span style="color:${COLOR_HIGHLIGHT}; font-weight:${FONT_BOLD ? 'bold' : 'normal'};">$1</span>`);
            });

            if (html !== span.innerHTML) {
                span.innerHTML = html;
                span.dataset.__highlightedYm = "true";
            }
        });
    }

    function highlightAll() {
        highlightQuantity();
        highlightOrderDescriptions();
        highlightYandexMarket();
    }

    const observer = new MutationObserver(highlightAll);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', highlightAll);
    document.addEventListener('DOMContentLoaded', highlightAll);
})();