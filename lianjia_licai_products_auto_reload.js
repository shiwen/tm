// ==UserScript==
// @name         Lianjia Licai Products Auto Reload
// @namespace    http://shiwen.me/lianjialicai
// @version      0.1
// @description  Reload Lianjia Licai product list automatically every few seconds
// @author       Shiwen
// @include      /^https?://licai\.lianjia\.com/licai/?$/
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
    }, 20 * 1000);

    var load_bids = function() {
        return JSON.parse(GM_getValue("bids", "{}"));
    };

    var store_bids = function(bids) {
        GM_setValue("bids", JSON.stringify(bids));
    };

    var parse_bids = function() {
        var bids = {};
        var r = document.evaluate("//table/tbody/tr", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < r.snapshotLength; i++) {
            var tr = r.snapshotItem(i);
            if (tr.getElementsByTagName("td")[5].getElementsByTagName("a")[0].text !== "已售罄") {
                var anchor = tr.getElementsByTagName("td")[0].getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
                bids[anchor.text] = anchor.href;
            }
        }
        return bids;
    };

    var notify = function(name, url) {
        var notification = {
            image: "http://img.25pp.com/uploadfile/app/icon/20160402/1459607891731404.jpg",
            title: "链家理财项目",
            text: name,
            onclick: function() {
                window.open(url, "_blank");
            }
        };
        GM_notification(notification);
    };

    var main = function() {
        var bids = load_bids();
        var bids_on_page = parse_bids();

        if ($.isEmptyObject(bids)) {
            store_bids(bids_on_page);
        } else {
            var new_bids = false;
            $.each(bids_on_page, function(key, value) {
                if (!(key in bids)) {
                    new_bids = true;
                    notify(key, value);
                    bids[key] = value;
                }
            });
            if (new_bids) {
                store_bids(bids);
            }
        }
    };

    var wait_for_bid_list = setInterval(function() {
        var r = document.evaluate("//table/tbody/tr", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (r.snapshotLength !== 0) {
            clearInterval(wait_for_bid_list);
            main();
        }
    }, 100);
})(unsafeWindow.jQuery);
