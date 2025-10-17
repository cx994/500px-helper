// ==UserScript==
// @name         500px助手
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  500px tribe auto-select with lazy loading and auto scroll-to-top
// @author       Cyc
// @match        https://*.500px.me/*
// @match        https://*.500px.com.cn/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    async function scrollToLoadAll(button) {
        const container = document.querySelector('.add_to_galleries_popover') ||
                         document.querySelector('[class*="popover"]');

        if (!container) return;

        const scrollableElement = container.querySelector('.simplebar-content-wrapper') ||
                                 container.querySelector('[class*="scroll"]') ||
                                 container;

        let lastCount = 0;
        let stableCount = 0;

        while (stableCount < 3) {
            const currentCount = document.querySelectorAll('.add_to_galleries_popover__item').length;

            if (button) {
                button.textContent = `⏬ 加载中 ${currentCount} 个`;
            }

            scrollableElement.scrollTop = scrollableElement.scrollHeight;

            await new Promise(resolve => setTimeout(resolve, 300));

            const newCount = document.querySelectorAll('.add_to_galleries_popover__item').length;

            if (newCount === lastCount) {
                stableCount++;
            } else {
                stableCount = 0;
            }

            lastCount = newCount;
        }
    }

    function scrollToTop() {
        const container = document.querySelector('.add_to_galleries_popover') ||
                         document.querySelector('[class*="popover"]');

        if (!container) return;

        const scrollableElement = container.querySelector('.simplebar-content-wrapper') ||
                                 container.querySelector('[class*="scroll"]') ||
                                 container;

        scrollableElement.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    async function selectAllTribes(button) {
        await scrollToLoadAll(button);

        const items = document.querySelectorAll('.add_to_galleries_popover__item');
        const toSelect = [];

        items.forEach(item => {
            const checkmark = item.querySelector('.add_to_galleries_popover_item__checkmark');
            const link = item.querySelector('.add_to_galleries_popover_item__wrap');

            if (checkmark && link && !checkmark.classList.contains('add_to_galleries_popover_item__checkmark--checked')) {
                toSelect.push(link);
            }
        });

        if (toSelect.length === 0) {
            scrollToTop();
            return 0;
        }

        const total = toSelect.length;
        for (let i = 0; i < total; i++) {
            toSelect[i].click();
            if (button) {
                button.textContent = `✓ 选择中 ${i + 1}/${total}`;
            }
            if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        scrollToTop();
        return total;
    }

    async function deselectAllTribes(button) {
        await scrollToLoadAll(button);

        const items = document.querySelectorAll('.add_to_galleries_popover__item');
        const toDeselect = [];

        items.forEach(item => {
            const checkmark = item.querySelector('.add_to_galleries_popover_item__checkmark');
            const link = item.querySelector('.add_to_galleries_popover_item__wrap');

            if (checkmark && link && checkmark.classList.contains('add_to_galleries_popover_item__checkmark--checked')) {
                toDeselect.push(link);
            }
        });

        if (toDeselect.length === 0) {
            scrollToTop();
            return 0;
        }

        const total = toDeselect.length;
        for (let i = 0; i < total; i++) {
            toDeselect[i].click();
            if (button) {
                button.textContent = `✕ 取消中 ${i + 1}/${total}`;
            }
            if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        scrollToTop();
        return total;
    }

    function addControlButtons(container) {
        if (container.querySelector('.tribe-select-all-controls')) {
            return;
        }

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'tribe-select-all-controls';
        controlsDiv.style.cssText = `
            padding: 10px;
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #e0e0e0;
            background: #f9f9f9;
            z-index: 10000;
        `;

        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = '✓ 全选部落';
        selectAllBtn.style.cssText = `
            flex: 1;
            padding: 8px 15px;
            background: #0099ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.3s, opacity 0.3s;
        `;
        selectAllBtn.onmouseover = () => {
            if (!selectAllBtn.disabled) selectAllBtn.style.background = '#0077cc';
        };
        selectAllBtn.onmouseout = () => {
            if (!selectAllBtn.disabled) selectAllBtn.style.background = '#0099ff';
        };
        selectAllBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (selectAllBtn.disabled) return;
            selectAllBtn.disabled = true;
            deselectAllBtn.disabled = true;
            selectAllBtn.style.opacity = '0.6';
            deselectAllBtn.style.opacity = '0.6';
            selectAllBtn.style.cursor = 'not-allowed';
            deselectAllBtn.style.cursor = 'not-allowed';

            const count = await selectAllTribes(selectAllBtn);

            if (count === 0) {
                selectAllBtn.textContent = '✓ 已全选';
            } else {
                selectAllBtn.textContent = `✓ 完成 ${count} 个`;
            }

            setTimeout(() => {
                selectAllBtn.textContent = '✓ 全选部落';
                selectAllBtn.disabled = false;
                deselectAllBtn.disabled = false;
                selectAllBtn.style.opacity = '1';
                deselectAllBtn.style.opacity = '1';
                selectAllBtn.style.cursor = 'pointer';
                deselectAllBtn.style.cursor = 'pointer';
            }, 1500);
        };

        const deselectAllBtn = document.createElement('button');
        deselectAllBtn.textContent = '✕ 取消全选';
        deselectAllBtn.style.cssText = `
            flex: 1;
            padding: 8px 15px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.3s, opacity 0.3s;
        `;
        deselectAllBtn.onmouseover = () => {
            if (!deselectAllBtn.disabled) deselectAllBtn.style.background = '#ff5252';
        };
        deselectAllBtn.onmouseout = () => {
            if (!deselectAllBtn.disabled) deselectAllBtn.style.background = '#ff6b6b';
        };
        deselectAllBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (deselectAllBtn.disabled) return;
            selectAllBtn.disabled = true;
            deselectAllBtn.disabled = true;
            selectAllBtn.style.opacity = '0.6';
            deselectAllBtn.style.opacity = '0.6';
            selectAllBtn.style.cursor = 'not-allowed';
            deselectAllBtn.style.cursor = 'not-allowed';

            const count = await deselectAllTribes(deselectAllBtn);

            if (count === 0) {
                deselectAllBtn.textContent = '✓ 已清空';
            } else {
                deselectAllBtn.textContent = `✓ 完成 ${count} 个`;
            }

            setTimeout(() => {
                deselectAllBtn.textContent = '✕ 取消全选';
                selectAllBtn.disabled = false;
                deselectAllBtn.disabled = false;
                selectAllBtn.style.opacity = '1';
                deselectAllBtn.style.opacity = '1';
                selectAllBtn.style.cursor = 'pointer';
                deselectAllBtn.style.cursor = 'pointer';
            }, 1500);
        };

        controlsDiv.appendChild(selectAllBtn);
        controlsDiv.appendChild(deselectAllBtn);
        container.insertBefore(controlsDiv, container.firstChild);
    }

    function tryAddButtons() {
        const popover = document.querySelector('.add_to_galleries_popover');
        if (popover) {
            addControlButtons(popover);
            return true;
        }

        const items = document.querySelectorAll('.add_to_galleries_popover__item');
        if (items.length > 0) {
            const parent = items[0].parentElement;
            if (parent) {
                addControlButtons(parent);
                return true;
            }
        }

        const allElements = document.querySelectorAll('[class*="popover"]');
        for (const elem of allElements) {
            if (elem.querySelector('.add_to_galleries_popover__item')) {
                addControlButtons(elem);
                return true;
            }
        }

        return false;
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList && node.classList.contains('add_to_galleries_popover__item')) {
                        setTimeout(tryAddButtons, 200);
                        return;
                    }

                    if (node.querySelector && node.querySelector('.add_to_galleries_popover__item')) {
                        setTimeout(tryAddButtons, 200);
                        return;
                    }

                    if (node.classList && (
                        node.classList.contains('add_to_galleries_popover') ||
                        Array.from(node.classList).some(cls => cls.includes('popover'))
                    )) {
                        setTimeout(tryAddButtons, 200);
                        return;
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setInterval(() => {
        const items = document.querySelectorAll('.add_to_galleries_popover__item');
        if (items.length > 0 && !document.querySelector('.tribe-select-all-controls')) {
            tryAddButtons();
        }
    }, 1000);
})();
