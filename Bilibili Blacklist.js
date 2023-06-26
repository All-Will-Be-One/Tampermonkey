// ==UserScript==
// @name         Bilibili Blacklist
// @namespace    http://tampermonkey.net/
// @version      0.7.5
// @description  不可逆的默认屏蔽首页广告,并在左下角添加了屏蔽词功能,并能自定义每个屏蔽词的范围(真的会有人需要这种自定义吗)
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
    // Define page types
    let pageTypes = ['searchPage', 'mainPage', 'leaderboard', 'timeLine', 'recommand', 'reply'];
    let pageTypesCN = {searchPage : '搜索页面', mainPage : '主页面', leaderboard: '排行榜', timeLine: '动态', recommand: '推荐', reply: '回复'};

    // Initialize blacklist with some default values
    let blacklist = GM_getValue('blacklist');
    if (blacklist === undefined) {
        blacklist = [{
            keyword: "原神",
            searchPage: true,
            mainPage: true,
            leaderboard: true,
            timeLine: true,
            recommand: true,
            reply: true
        }];
        GM_setValue('blacklist', JSON.stringify(blacklist));
    } else {
        // Parse the stored JSON string back to a JavaScript object
        blacklist = JSON.parse(blacklist);
    }

    let block_blacklist = function(){

        // Block AD
        $("svg.bili-video-card__info--ad").parents("div.bili-video-card").hide();
        $("svg.bili-video-card__info--ad").parents("div.feed-card").hide();

        blacklist.forEach(function(entry){
            let containsString = ":contains('" + entry.keyword + "')";

            // Block search page
            if (entry.searchPage) {
                $("div.bili-video-card__info--right" + containsString).parents('div.bili-video-card:not(.is-rcmd)').hide();
                $("div.media-card-content" + containsString).parents('div.media-card').hide();
            }

            // Block main page
            if (entry.mainPage) {
                $("div.bili-video-card__info--right" + containsString).parents("div.bili-video-card.is-rcmd").hide();
                $("div.bili-video-card__info--right" + containsString).parents("div.feed-card").hide();
                $("div.bili-video-card__info--right" + containsString).parents("div.floor-single-card").hide();
            }

            // Block leaderboard
            if (entry.leaderboard) {
                $("div.video-card__info" + containsString).parents("div.video-card").hide();
            }

            // Block timeline pages
            if (entry.timeLine) {
                $("div.bili-dyn-content" + containsString).parents("div.bili-dyn-list__item").hide();
            }

            // Block recommands
            if (entry.recommand) {
                $("div.info" + containsString).parents("div.video-page-card-small").hide();
            }

            // Block reply
            if (entry.reply) {
                $("div.root-reply" + containsString).parents("div.content-warp").hide();
                $("span.reply-content-container.sub-reply-content" + containsString).parents("div.sub-reply-item").hide();
            }
        });
    }

    // Create the floating "B" button
    let buttonB = $('<button>', {
        text: '屏蔽',
        css: {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            backgroundColor: 'gray',
            color: 'white',
            borderRadius: '8px',
            padding: '10px',
            border: '2px solid white'
        },
        click: function() {
            let keyword = prompt('输入屏蔽关键词:');
            if (keyword) {
                // Add the keyword with all pages selected by default
                blacklist.push({
                    keyword: keyword,
                    searchPage: true,
                    mainPage: true,
                    leaderboard: true,
                    timeLine: true,
                    recommand: true,
                    reply: true
                });

                // Save the updated blacklist to GM storage
                GM_setValue('blacklist', JSON.stringify(blacklist));

                block_blacklist();
            }
        }
    });

    // Create the floating "E" button
    let buttonE = $('<button>', {
        text: '屏蔽词管理',
        css: {
            position: 'fixed',
            bottom: '20px',
            left: '80px',
            zIndex: 9999,
            backgroundColor: 'gray',
            color: 'white',
            borderRadius: '8px',
            padding: '10px',
            border: '2px solid white'
        },
        click: function() {
            if ($('#modal').length > 0) {
                $('#modal').remove();
                return;
            }

            // Build a custom modal dialog
            let modal = $('<div>', {
                id: 'modal',
                css: {
                    position: 'fixed',
                    width: '700px',
                    height: '400px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff',
                    padding: '20px',
                    zIndex: 9999,
                    overflowY: 'auto',
                    border: '2px solid #000'
                }
            });

            // Add title
            let title = $('<h2>', {
                text: '屏蔽词管理',
                css: {
                    textAlign: 'center',
                    margin: '20px 0'
                }
            });

            modal.append(title);

            // Add exit button
            let exitButton = $('<button>', {
                text: '❌',
                css: {
                    position: 'absolute',
                    top: '10px',
                    right: '10px'
                },
                click: function() {
                    modal.remove();
                }
            });

            modal.append(exitButton);

            // Add each keyword to the modal with a '➖' button and checkboxes for each page type
            blacklist.forEach(function(entry, index) {
                let keyword = $('<span>', {
                    text: entry.keyword,
                    css: {
                        display: 'inline-block',
                        width: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle'
                    }
                });

                let item = $('<div>', {
                    css: {
                        marginBottom: '10px'
                    }
                });

                item.append(keyword);

                let removeButton = $('<button>', {
                    text: '➖',
                    css: {
                        marginLeft: '10px'
                    },
                    click: function() {
                        // Get the keyword of the current item
                        let currentKeyword = entry.keyword;

                        // Filter out the item with the current keyword
                        blacklist = blacklist.filter(function(item) {
                            return item.keyword !== currentKeyword;
                        });

                        // Save the updated blacklist to GM storage
                        GM_setValue('blacklist', JSON.stringify(blacklist));

                        // Remove this keyword from the modal
                        item.remove();

                        block_blacklist();
                    }
                });

                item.append(removeButton);

                // Add a checkbox for each page type
                pageTypes.forEach(function(pageType) {
                    let checkbox = $('<input>', {
                        type: 'checkbox',
                        checked: entry[pageType],
                        change: function() {
                            // Update the blacklist when a checkbox is toggled
                            entry[pageType] = this.checked;
                            GM_setValue('blacklist', JSON.stringify(blacklist));
                            block_blacklist();
                        }
                    });

                    let label = $('<label>', {
                        text: pageTypesCN[pageType],
                        css: {
                            marginLeft: '10px'
                        }
                    });

                    label.prepend(checkbox);
                    item.append(label);
                });

                modal.append(item);
            });

            // Add save button
            let saveButton = $('<button>', {
                text: '✔️',
                css: {
                    display: 'block',
                    margin: '0 auto',
                    marginTop: '10px'
                },
                click: function() {
                    modal.remove();
                    location.reload(); // refresh the page
                }
            });

            modal.append(saveButton);

            $('body').append(modal);
        }
    });

    $('body').append(buttonB);
    $('body').append(buttonE);

    // Run the initial blacklist block
    block_blacklist();

    $('<style>').prop('type', 'text/css').html('.recommended-container_floor-aside .container>*:nth-of-type(n + 8) {margin-top: 0px !important;}').appendTo('head');


    document.addEventListener('DOMNodeInserted', function() {
        block_blacklist();
    }, false);
})();
