// ==UserScript==
// @version      1.0.0
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
    
    function waitForKeyElements(selectorOrFunction, callback, waitOnce = true, interval = 300, maxIntervals = -1) {
        let targetNodes = (typeof selectorOrFunction === "function")
            ? selectorOrFunction()
            : document.querySelectorAll(selectorOrFunction);

        let targetsFound = targetNodes && targetNodes.length > 0;
        if (targetsFound) {
            targetNodes.forEach(function(targetNode) {
                const attrAlreadyFound = "data-userscript-alreadyFound";
                const alreadyFound = targetNode.getAttribute(attrAlreadyFound) || false;
                if (!alreadyFound) {
                    const cancelFound = callback(targetNode);
                    if (cancelFound) {
                        targetsFound = false;
                    } else {
                        targetNode.setAttribute(attrAlreadyFound, true);
                    }
                }
            });
        }

        if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
            maxIntervals -= 1;
            setTimeout(function() {
                waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
            }, interval);
        }
    }
    
    let funcDone = false;
    const playerElemSelector = '#player';
    const colors = ['#072525', '#287F54', '#C22544'];

    if (!funcDone) window.addEventListener('yt-navigate-start', addSpeeds);

    if (document.body && !funcDone) {
        waitForKeyElements(playerElemSelector, addSpeeds);
    }

    function addSpeeds() {
        if (funcDone) return;

        const bgColor = colors[0];
        const moreSpeedsDiv = document.createElement('div');
        moreSpeedsDiv.id = 'more-speeds';
        moreSpeedsDiv.style.marginTop = '8px';

        for (let i = 1; i < 4.25; i += 0.25) {
            const btn = document.createElement('button');
            btn.style.backgroundColor = bgColor;
            btn.style.marginRight = '4px';
            btn.style.border = '1px solid #D3D3D3';
            btn.style.borderRadius = '2px';
            btn.style.color = '#ffffff';
            btn.style.cursor = 'pointer';
            btn.style.fontFamily = 'monospace';
            btn.textContent = '×' + (i.toString().substr(0, 1) === '0' ? i.toString().substr(1) : i.toString());
            btn.addEventListener('click', () => {
                document.getElementsByTagName('video')[0].playbackRate = i;
                localStorage.setItem('yt-speed-' + location.href, i);
            });
            moreSpeedsDiv.appendChild(btn);
        }

        const playerElem = document.querySelector(playerElemSelector);
        if (playerElem) {
            playerElem.after(moreSpeedsDiv);
        }

        restoreSpeed();

        setInterval(restoreSpeed, 1000);

        funcDone = true;
    }

    function restoreSpeed() {
        const video = document.getElementsByTagName('video')[0];
        if (video) {
            const savedSpeed = localStorage.getItem('yt-speed-' + location.href);
            if (savedSpeed && video.playbackRate !== parseFloat(savedSpeed)) {
                video.playbackRate = parseFloat(savedSpeed);
            }
        }
    }
})();
