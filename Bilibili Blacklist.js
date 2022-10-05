// ==UserScript==
// @name         Bilibili Blacklist
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  CR, 柠檬什么时候熟啊?
// @author       Aporia
// @match        *://*.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?domain=google.cn
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @run-at document-end

// ==/UserScript==

(function() {
    //在这里输入你想屏蔽的关键词
    blacklist = [
        "原神",
        "摸鱼事务所"
    ];

    let block_blacklist = function(){
        blacklist.forEach(function(value,index,array){
            let containsString = ":contains('" + value + "')";

            // 屏蔽搜索页面
            $("div.bili-video-card__info--right" + containsString).parents('div.bili-video-card').hide();

            // 屏蔽主页面
            $("div.bili-video-card__info--right" + containsString).parents("div.recommended-card").hide();

            // 屏蔽排行榜
            $("div.video-card__info" + containsString).parents("div.video-card").hide();

            //动态页面
            $("div.bili-dyn-content" + containsString).parents("div.bili-dyn-list__item").hide();
        });
    }

    //diableUp();
    let count = 0;
    document.addEventListener('DOMNodeInserted', function() {
        block_blacklist();
    }, false);
})();
