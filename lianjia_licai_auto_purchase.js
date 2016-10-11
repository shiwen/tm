// ==UserScript==
// @name         Lianjia Licai Auto Purchase
// @namespace    http://shiwen.me/lianjialicai
// @version      0.3
// @description  Purchase Lianjia Licai financial products automatically
// @author       Shiwen
// @match        https://licai.lianjia.com/licai_*.html
// @grant        unsafeWindow
// ==/UserScript==

(function($) {
    "use strict";

    var amount = 0;
    var r = document.evaluate("//div/div/div/ul/li[3]/dl/dd/span", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0);
    if (r) {
        var bid_total = parseInt(r.innerHTML.replace(",", ""));
        if (bid_total) {
            amount = Math.min(amount, bid_total);
        }
    }
    var key = "";

    var clear_all_timers = function() {
        var highestTimeoutId = setTimeout(function() {});
        for (var i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
    };

    var timer = {
        count_down: function() {
            var d = --this.count_down_seconds;
            var timer_display;
            if (d <= 0) {
                timer_display = "00:00:00";
                clearInterval(this.count_down_loop);
            } else {
                var p = [];
                for (var i = 0; i < 2; i++) {
                    p[i] = Math.floor(d % 60);
                    d /= 60;
                }
                p[2] = Math.floor(d);
                if (p[2] > 99) {
                    timer_display = "99:59:59";
                } else {
                    timer_display = "";
                    for (i = 2; i >= 0; i--) {
                        timer_display += ((p[i] >= 10) ? p[i] : "0" + p[i]) + ":";
                    }
                    timer_display = timer_display.slice(0, -1);
                }
            }
            this.timer_div.html(timer_display);
        },

        run: function() {
            var timer_div = $("div[data-being]");
            if (timer_div.length === 0) {
                this.count_down_seconds = 0;
            } else {
                this.timer_div = timer_div;
                this.count_down_seconds = Math.floor((new Date(timer_div.attr("data-being")).getTime() - parseInt(unsafeWindow.homelink_config.currenttime)) / 1000);
                var t = this;
                this.count_down_loop = setInterval(function() {
                    t.count_down();
                }, 1000);
            }
        }
    };

    var bid_purchase = {
        sent: 0,
        received: 0,
        response_map: {},

        salt: function(length) {
            var t = "poiuytrewqasdfghjklmnbvcxzQWERTYUIPLKJHGFDSAZXCVBNM";
            for (var s = "", i = 0; i < length; i++)
                s += t.charAt(Math.ceil(t.length * Math.random()));
            return s;
        },

        random: function(lower, upper) {
            return Math.floor(lower + Math.random() * (upper - lower));
        },

        uglify: function(s) {
            var c = this.random(4, 10);
            for (var i = 0; i < c; i++) {
                if (i == c - 1) {
                    s = c.toString() + s;
                }
                s = $.base64.encode(s);
            }
            return s;
        },

        stringify: function(obj) {
            var s = "";
            $.each(obj, function(key, value) {
                s += "&" + key + "=" + value;
            });
            if ("" !== s) {
                s = s.substring(1);
            }
            return s;
        },

        parameters: function(user, obj) {
            var c = {};
            var n = this.salt(4) + user + this.salt(4);
            c._n = this.uglify(n);
            var m = encodeURIComponent(this.stringify(obj));
            c._m = this.uglify(m);
            return c;
        },

        print_stats: function() {
            var s = "Statistics (" + new Date().format("hh:mm:ss") + ")";
            s += "\nTotal requests sent: " + this.sent;
            s += "\nTotal responses received: " + this.received;
            $.each(this.response_map, function(key, value) {
                s += "\n" + key + ": " + value;
            });
            s += "\n";
            console.log(s);
        },

        run: function(user, bid_id, amount, key, count_down_seconds) {
            var obj = {
                payKey: key,
                investment: amount,
                bidId: bid_id,
                cashCoupon: 0
            };

            var t = this;
            setTimeout(function() {
                var ajax_loop = setInterval(function() {
                    t.sent += 1;
                    $.post("https://licai.lianjia.com/manageMoney/tenderFreeze", t.parameters(user, obj), function(response) {
                        t.received += 1; // TODO ensure atomic increase
                        t.response_map[response] = response in t.response_map ? t.response_map[response] + 1 : 1;
                    }, "text");
                }, 20);
                var stats_loop = setInterval(function() {
                    t.print_stats();
                }, 1000);
                setTimeout(function() {
                    clearInterval(ajax_loop);
                }, 10 * 1000);
                setTimeout(function() {
                    clearInterval(stats_loop);
                }, 30 * 1000);
            }, (count_down_seconds - 5) * 1000);
        }
    };

    var main = function() {
        clear_all_timers();
        timer.run();

        var count_down_seconds = timer.count_down_seconds;
        var user = $.base64.decode(unsafeWindow.homelink_config.rnd);
        var bid_id = window.location.href.split("_")[1].replace(/\.html$/, "");
        var login_page;

        if (count_down_seconds !== 0) { // if the bid is not open
            if (user === "") { // if not logged in
                login_page = window.open("https://licai.lianjia.com/login/", "_blank");
                login_page.focus();
                if (count_down_seconds > 15) {
                    setTimeout(function() {
                        window.location.reload(true);
                    }, (count_down_seconds - 15) * 1000);
                }
            } else {
                bid_purchase.run(user, bid_id, amount, key, count_down_seconds);
            }
        } else if ($("input.bingo").length !== 0) { // if the bid time is past but still open for sale
            if (user === "") { // if not logged in
                login_page = window.open("https://licai.lianjia.com/login/", "_blank");
                login_page.focus();
            } else {
                bid_purchase.run(user, bid_id, amount, key, 0);
            }
        }
    };

    main();
})(unsafeWindow.jQuery);
