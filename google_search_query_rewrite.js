// ==UserScript==
// @name         Google Search Query Rewrite
// @namespace    http://shiwen.me/google
// @version      0.1
// @description  Remove the query prefix added automatically by QQ browser when searching via address bar
// @author       Shiwen
// @match        https://www.google.com.sg/search?*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    "use strict";
    var url = window.location.href;
    if (url.indexOf("www.google.com/search%3Fq%3D") >= 0) {
        window.location.href = url.replace("www.google.com/search%3Fq%3D", "");
    }
})();
