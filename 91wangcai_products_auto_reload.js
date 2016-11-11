// ==UserScript==
// @name         91WangCai Products Auto Reload
// @namespace    http://shiwen.me/91wangcai
// @version      0.1
// @description  Reload 91WangCai product list automatically every few seconds
// @author       Shiwen
// @include      http://www.91wangcai.com/list
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
        }
    });

    setTimeout(function() {
        retainBids = true;
        window.location.reload();
    }, 1000);

    var store_bids = function(bids) {
        GM_setValue("bids", JSON.stringify(bids));
    };

    var parse_bids = function() {
        var bids = {};
        var product_divs = document.getElementsByClassName("product");
        for (var i = 0; i < product_divs.length; i++) {
            var anchor = product_divs[i].getElementsByTagName("a")[1];
            if (anchor.innerHTML !== "\u5df2\u552e\u7f44") {
                var term = parseInt(product_divs[i].getElementsByTagName("b")[1].innerHTML);
                var description = product_divs[i].getElementsByTagName("a")[0].innerHTML;
                var p = description.split("\u3011");
                var title = p[0].slice(1).replace("-\u7b2c", " \u7b2c") + "\n" + term + "\u5929\n" + p[1].split(/[ ,\uff0c]/)[0].replace("\u67d0", " ");
                bids[title] = {url: anchor.href, term: term};
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

    var main = function() {
        var bids_json = GM_getValue("bids");
        var bids_on_page = parse_bids();

        if (bids_json === undefined) {
            store_bids(bids_on_page);
        } else {
            var bids = JSON.parse(bids_json);
            var new_bids = false;
            $.each(bids_on_page, function(key, value) {
                if (!(key in bids)) {
                    new_bids = true;
                    notify(key, value.url);
                    if (value.term > 90) {
                        window.open(value.url, "_blank");
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
