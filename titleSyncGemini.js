// ==UserScript==
// @name         自动修改Gemini网页标题
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  根据对话修改当前网页的标题
// @author       popyoung
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const parentSelector = '#conversations-list-0';
  const targetSelector = 'div.conversation.selected';
  const maxWaitTime = 5000;
  const pollInterval = 100;
  let observer;
  let waitStartTime = Date.now();

  tryInit();

  function tryInit() {
    const parentElement = document.querySelector(parentSelector);
    if (parentElement && parentElement.querySelector(targetSelector)) {
      initObserver(parentElement);
    } else if (Date.now() - waitStartTime < maxWaitTime) {
      setTimeout(tryInit, pollInterval);
    } else {
      console.warn(`[标题同步脚本] 超时未找到父元素: ${parentSelector}`);
    }
  }

  function initObserver(parentElement) {
    const targetElement = parentElement.querySelector(targetSelector);
    if (targetElement) {
      updateTitle(targetElement);
    }

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(mutation => {
        const newTarget = parentElement.querySelector(targetSelector);
        if (newTarget) {
          updateTitle(newTarget);
        }
      });
    });

    observer.observe(parentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  let titleUpdateTimer;
  function updateTitle(element) {
    clearTimeout(titleUpdateTimer);
    titleUpdateTimer = setTimeout(() => {
      const newText = 'Gemini - ' + element.textContent.trim();
      if (document.title !== newText) {
        document.title = newText;
        console.log('[标题同步脚本] 标题已更新:', newText);
      }
    }, 200);
  }
})();