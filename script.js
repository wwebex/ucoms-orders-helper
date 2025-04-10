// ==UserScript==
// @name         Highlight Quantity and Keywords in Order Details
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Highlighting quantity and keywords on Ozon and Yandex.Market with debug logs and thresholds for quantity color coding
// @author       оксимирон)))
// @match        *://*.ozon.ru/*
// @match        *://*.yandex.market/*
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    const FONT_BOLD = true;
    const KEYWORDS = ["HDD", "WI-FI", "WIFI", "DDR5", "Товар уцененный"];

    const COLOR_ORANGE = "#ff9800";
    const COLOR_RED = "#f44336";

    const debug = (...args) => console.log("[Highlight Debug]", ...args);

    const highlightText = (node, keywords, { color, fontWeight }) => {
        if (!node || !node.textContent) return;
        const originalText = node.textContent;
        let replaced = false;

        const highlightedHTML = originalText.replace(
            new RegExp(`\\b(${keywords.join("|")})\\b`, "gi"),
            (match) => {
                replaced = true;
                debug(`Ключевое слово найдено: "${match}"`);
                return `<span style="color:${color}; font-weight:${fontWeight};">${match}</span>`;
            }
        );

        if (replaced) {
            const span = document.createElement("span");
            span.innerHTML = highlightedHTML;
            node.replaceWith(span);
            debug("Ключевые слова подсвечены в:", originalText);
        } else {
            debug("Нет ключевых слов в:", originalText);
        }
    };

    const highlightQuantity = (node) => {
        if (!node || !node.textContent) return;

        const text = node.textContent;
        const match = text.match(/\b(\d+)\s?(шт|штук|pieces|pcs)?\b/i);

        if (match) {
            const number = parseInt(match[1]);
            if (number === 1) {
                debug("Одна штука — пропущено:", text);
                return; // не подсвечиваем 1 шт
            }

            const color = number >= 5 ? COLOR_RED : COLOR_ORANGE;
            const fontWeight = FONT_BOLD ? "bold" : "normal";

            debug(`Количество найдено: ${number}, цвет: ${color}`);

            node.innerHTML = text.replace(
                match[0],
                `<span style="color:${color}; font-weight:${fontWeight};">${match[0]}</span>`
            );
        } else {
            debug("Количество не найдено в:", text);
        }
    };

    const waitForElements = (selectors, callback, maxAttempts = 20) => {
        let attempts = 0;
        const interval = setInterval(() => {
            const elements = selectors.map(sel => Array.from(document.querySelectorAll(sel))).flat();
            debug(`Попытка ${attempts + 1}/${maxAttempts}, найдено элементов: ${elements.length}`);
            if (elements.length > 0 || attempts >= maxAttempts) {
                clearInterval(interval);
                if (elements.length === 0) {
                    debug("Элементы не найдены по селекторам:", selectors);
                }
                callback(elements);
            }
            attempts++;
        }, 500);
    };

    const startHighlighting = () => {
        const isOzon = location.hostname.includes("");
        const isYandex = location.hostname.includes("yandex.market");
        debug("Запуск подсветки. isOzon:", isOzon, "isYandex:", isYandex);

        // Quantity
        const quantitySelectors = [
            isOzon ? "div[class^='two-line-cell_primary_'] span:nth-of-type(2)" : null,
            isYandex ? "span[class^='__use--kind_bodyBold___']" : null,
        ].filter(Boolean);

        waitForElements(quantitySelectors, (nodes) => {
            debug("Обработка количества, элементов:", nodes.length);
            nodes.forEach(highlightQuantity);
        });

        // Description
        const descriptionSelectors = [
            isOzon ? "div[class^='order-details-body-cell-content_breakWord_']" : null,
            isYandex ? "div[class^='style-aligner___']" : null,
        ].filter(Boolean);

        waitForElements(descriptionSelectors, (nodes) => {
            debug("Обработка описаний, элементов:", nodes.length);
            nodes.forEach((node) =>
                highlightText(node, KEYWORDS, {
                    color: "#1a73e8",
                    fontWeight: FONT_BOLD ? "bold" : "normal",
                })
            );
        });
    };

    const observeURLChanges = () => {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                debug("Обнаружено изменение URL, повторный запуск скрипта");
                startHighlighting();
            }
        }).observe(document, { subtree: true, childList: true });
    };

    startHighlighting();
    observeURLChanges();
})();