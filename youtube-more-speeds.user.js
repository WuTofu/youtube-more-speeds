// ==UserScript==
// @version      1.0.1
// @name         YouTubeMoreSpeeds
// @description  Adds buttons under a YouTube video with more playback speeds.
// @namespace    https://github.com/WuTofu
// @icon https://www.youtube.com/s/desktop/3748dff5/img/favicon_48.png
// @author       SharpRoma
// @homepage https://github.com/WuTofu/youtube-more-speeds
// @match        *://*.youtube.com/*
// @license MIT
// @downloadURL https://cdn.jsdelivr.net/gh/WuTofu/youtube-more-speeds@edit/main/youtube-more-speeds.user.js
// @updateURL https://cdn.jsdelivr.net/gh/WuTofu/youtube-more-speeds@edit/main/youtube-more-speeds.user.js
// ==/UserScript==


    (function() {
    'use strict';

    const playerElemSelector = '#player';
    const buttonColor = '#072525';

    function getVideo() {
        return document.getElementsByTagName('video')[0];
    }

    function speedStorageKey() {
        return 'yt-speed-' + location.href;
    }

    function createSpeedButtons() {
        const moreSpeedsDiv = document.createElement('div');
        moreSpeedsDiv.id = 'more-speeds';
        moreSpeedsDiv.style.marginTop = '8px';

        for (let speed = 1; speed < 4.25; speed += 0.25) {
            const btn = document.createElement('button');
            btn.style.backgroundColor = buttonColor;
            btn.style.marginRight = '4px';
            btn.style.border = '1px solid #D3D3D3';
            btn.style.borderRadius = '2px';
            btn.style.color = '#ffffff';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'monospace';
            btn.textContent = '×' + speed;
            btn.addEventListener('click', () => {
                getVideo().playbackRate = speed;
                localStorage.setItem(speedStorageKey(), speed);
            });
            moreSpeedsDiv.appendChild(btn);
        }

        return moreSpeedsDiv;
    }

    // Idempotent: safe to call repeatedly. Re-inserts the buttons whenever
    // YouTube's own JS has removed/replaced #player or detached our div,
    // instead of relying on a one-shot "already done" flag.
    // Returns true if the buttons were already correctly placed (nothing to do).
    function ensureSpeedButtons() {
        const playerElem = document.querySelector(playerElemSelector);
        if (!playerElem) return false;

        const existing = document.getElementById('more-speeds');
        if (existing) {
            if (existing.previousElementSibling === playerElem) return true;
            existing.remove();
        }

        playerElem.after(createSpeedButtons());
        return false;
    }

    function restoreSpeed() {
        const video = getVideo();
        if (!video) return;

        const savedSpeed = localStorage.getItem(speedStorageKey());
        if (savedSpeed && video.playbackRate !== parseFloat(savedSpeed)) {
            video.playbackRate = parseFloat(savedSpeed);
        }
    }

    const STABLE_TICKS_REQUIRED = 4; // page considered stable after this many consecutive ticks with nothing to fix
    let pollTimer = null;
    let stableCount = 0;

    function tick() {
        const alreadyPlaced = ensureSpeedButtons();
        restoreSpeed();

        if (alreadyPlaced) {
            stableCount++;
            if (stableCount >= STABLE_TICKS_REQUIRED && pollTimer) {
                clearInterval(pollTimer);
                pollTimer = null;
            }
        } else {
            stableCount = 0;
        }
    }

    function startPolling() {
        stableCount = 0;
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(tick, 500);
    }

    // Navigating to a new video re-renders the player, so polling needs to restart
    // until the page settles again.
    window.addEventListener('yt-navigate-finish', () => {
        tick();
        startPolling();
    });
    tick();
    startPolling();
})();
