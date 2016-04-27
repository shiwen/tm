// ==UserScript==
// @name         AirChina Web Page Bug Fix
// @namespace    http://shiwen.me/airchina
// @version      0.1
// @description  When searching tickets on AirChina web site, the search result pages contain a bug which cause re-search button not working. Error message in console shows that the page needs a global variable 'currentDateStr' to be set.
// @author       Shiwen
// @match        http://ebooking.airchina.com.cn/*/searchFlight_amrshop.action
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    "use strict";
    unsafeWindow.currentDateStr = "2099-12-31";
})();
