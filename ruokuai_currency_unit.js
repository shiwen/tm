// ==UserScript==
// @name         RuoKuai Currency Unit
// @namespace    http://shiwen.me/ruokuai
// @version      0.1
// @description  Switch KuaiDou to RMB
// @author       Shiwen
// @match        http://*.ruokuai.com/client*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    var kds = document.getElementsByClassName("h40");
    Array.prototype.slice.call(kds).forEach(function(kd) {
        kd.childNodes[0].textContent = kd.childNodes[0].textContent.trim();
        kd.childNodes[1].textContent = "\uffe5" + (kd.childNodes[1].textContent / 2500).toFixed(2);
    });
})();
