// ==UserScript==
// @name         Lianjia Licai Products Auto Reload
// @namespace    http://shiwen.me/lianjialicai
// @version      0.4
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
    }, 5 * 1000);

    var store_bids = function(bids) {
        GM_setValue("bids", JSON.stringify(bids));
    };

    var parse_bids = function() {
        var bids = {};
        var r = document.evaluate("//table/tbody/tr", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < r.snapshotLength; i++) {
            var tr = r.snapshotItem(i);
            if (tr.getElementsByTagName("td")[5].getElementsByTagName("a")[0].text !== "\u5df2\u552e\u7f44") {
                var anchor = tr.getElementsByTagName("td")[0].getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
                var term = parseInt(tr.getElementsByTagName("td")[2].getElementsByTagName("span")[0].innerHTML);
                bids[anchor.text] = {url: anchor.href, term: term};
            }
        }
        return bids;
    };

    var notify = function(name, url) {
        var notification = {
            image: "https://raw.githubusercontent.com/shiwen/tm/master/images/lianjia_logo.jpg",
            title: "\u94fe\u5bb6\u7406\u8d22\u9879\u76ee",
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
                    if (value.term <= 60) {
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

    var wait_for_bid_list = setInterval(function() {
        var r = document.evaluate("//table/tbody/tr", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (r.snapshotLength !== 0) {
            clearInterval(wait_for_bid_list);
            main();
        }
    }, 100);
})(unsafeWindow.jQuery);
