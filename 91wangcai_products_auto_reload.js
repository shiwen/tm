// ==UserScript==
// @name         91WangCai Products Auto Reload
// @namespace    http://shiwen.me/91wangcai
// @version      0.7
// @description  Reload 91WangCai product list automatically every few seconds
// @author       Shiwen
// @include      http://www.91wangcai.com/list
// @include      https://www.91wangcai.com/list
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_notification
// ==/UserScript==

(function($) {
    "use strict";

    var retainBids = false;
    $(unsafeWindow).on("beforeunload", function() {
        if (!retainBids) {
            GM_deleteValue("bids");
            GM_deleteValue("play");
        }
    });

    var reload = setTimeout(function() {
        retainBids = true;
        window.location.reload();
    }, 10000);

    var store_bids = function(bids) {
        GM_setValue("bids", JSON.stringify(bids));
    };

    var parse_bids = function() {
        var bids = {};
        var product_divs = document.getElementsByClassName("product");
        for (var i = 0; i < product_divs.length; i++) {
            var status = product_divs[i].getElementsByClassName("articleBtn")[0].textContent.trim();
            if (status !== "\u5df2\u552e\u7f44") {
                var url = product_divs[i].getElementsByTagName("a")[0].href;
                var term = parseInt(product_divs[i].getElementsByTagName("b")[1].getAttribute("data-numtarget"));
                var title = product_divs[i].getElementsByTagName("h3")[0].textContent;
                bids[title] = {url: url, term: term};
            }
        }
        return bids;
    };

    var notify = function(name, url) {
        var notification = {
            image: "http://img.25pp.com/uploadfile/app/icon/20161107/1478508056235391.jpg",
            title: "91\u65fa\u8d22\u7406\u8d22\u9879\u76ee",
            text: name,
            onclick: function() {
                window.open(url, "_blank");
            }
        };
        GM_notification(notification);
    };

    var play = function() {
        GM_setValue("play", "true");
        var player = document.createElement('audio');
        player.src = 'http://jizhujiang.com/message.wav';
        player.preload = 'auto';
        player.loop = true;
        player.play();
    };

    var main = function() {
        console.log(new Date().toLocaleString());
        if (GM_getValue("play") === "true") {
            play();
        }

        var bids_json = GM_getValue("bids");
        var bids_on_page = parse_bids();
        $.each(bids_on_page, function(key, value) {
            console.log("bid on page:", key, value.term, value.url);
        });

        if (bids_json === undefined) {
            store_bids(bids_on_page);
        } else {
            var bids = JSON.parse(bids_json);
            var new_bids = false;
            $.each(bids_on_page, function(key, value) {
                if (!(key in bids)) {
                    new_bids = true;
                    if (value.term >= 180) {
                        console.log("new qualified bid:", key, value.term, value.url);
                        play();
                        notify(key, value.url);
                        window.open(value.url, "_blank");
                        clearTimeout(reload);
                    }
                    bids[key] = value;
                }
            });
            if (new_bids) {
                store_bids(bids);
            }
        }
    };

    main();
})(unsafeWindow.jQuery);
