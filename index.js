jQuery(() => {
    var getContainer = function () { return $(document.getElementById("extensions_settings")); };

    getContainer().append(
        '<div class="inline-drawer">' +
        '<div class="inline-drawer-toggle inline-drawer-header">' +
            '<b>🐰 Bunny Toolbox</b>' +
            '<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>' +
        '</div>' +
        '<div class="inline-drawer-content">' +
            '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 0;">' +
                '<input type="checkbox" id="bny-toggle" /><span>Show Bunny</span>' +
            '</label>' +
            '<div style="padding:5px 0;">' +
                '<label style="font-size:12px;color:#888;">搜索引擎</label>' +
                '<select id="bny-engine" style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:13px;">' +
                    '<option value="google">Google</option>' +
                    '<option value="baidu">百度</option>' +
                    '<option value="bing">必应</option>' +
                    '<option value="quark">夸克</option>' +
                '</select>' +
            '</div>' +
            '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;"/>' +
            '<button id="bny-probe" style="padding:6px 20px;border-radius:8px;border:1px solid #ddd;background:#f0f0f0;color:#666;font-size:12px;cursor:pointer;width:100%;">🔍 探测预设管理器DOM</button>' +
            '<div id="bny-probe-result" style="padding:5px 0;font-size:10px;color:#666;white-space:pre-wrap;word-break:break-all;max-height:400px;overflow-y:auto;"></div>' +
            '<div id="bny-status" style="padding:5px 0;font-size:12px;color:#888;">Bunny is hidden</div>' +
        '</div></div>'
    );

    var engines = {
        google: {
            name: "Google",
            search: function (q) { return "https://www.google.com/search?igu=1&q=" + encodeURIComponent(q); },
            fallback: function (q) { return "https://www.google.com/search?q=" + encodeURIComponent(q); }
        },
        baidu: {
            name: "百度",
            search: function (q) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(q); },
            fallback: function (q) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(q); }
        },
        bing: {
            name: "必应",
            search: function (q) { return "https://www.bing.com/search?q=" + encodeURIComponent(q); },
            fallback: function (q) { return "https://www.bing.com/search?q=" + encodeURIComponent(q); }
        },
        quark: {
            name: "夸克",
            search: function (q) { return "https://quark.sm.cn/s?q=" + encodeURIComponent(q); },
            fallback: function (q) { return "https://quark.sm.cn/s?q=" + encodeURIComponent(q); }
        }
    };
    function getEngine() {
        var k = localStorage.getItem("bnyEngine") || "google";
        return engines[k] || engines.google;
    }
    $("#bny-engine").val(localStorage.getItem("bnyEngine") || "google");
    $("#bny-engine").on("change", function () { localStorage.setItem("bnyEngine", $(this).val()); });

    $("#bny-probe").on("click", function () {
        var r = $("#bny-probe-result");
        var info = "";
        try {
            info += "=== 1. 预设管理器DOM ===\n";
            var pmPanel = document.getElementById("completion_prompt_manager");
            if (pmPanel) {
                info += "找到 #completion_prompt_manager\n";
                var children = pmPanel.children;
                info += "子元素数: " + children.length + "\n";
                for (var i = 0; i < Math.min(children.length, 10); i++) {
                    var c = children[i];
                    info += "  " + c.tagName + " id=" + (c.id || "无") + " class=" + (c.className || "无").substring(0, 60) + "\n";
                }
            } else {
                info += "#completion_prompt_manager 不存在\n";
            }

            info += "\n=== 2. 搜索prompt条目DOM ===\n";
            var selectors = [
                '.prompt_manager_prompt',
                '.completion_prompt_manager_prompt',
                '[data-pm-identifier]',
                '.prompt-manager-toggle-action',
                '.prompt_manager_prompt_toggle',
                '.prompt_entry',
                '#prompt_manager_list li',
                '#completion_prompt_manager_list li',
                '#completion_prompt_manager_list .prompt_entry',
                '.prompt_manager_prompt_name'
            ];
            for (var s = 0; s < selectors.length; s++) {
                var els = document.querySelectorAll(selectors[s]);
                info += selectors[s] + " → " + els.length + "个";
                if (els.length > 0) {
                    var first = els[0];
                    info += " | 首个: <" + first.tagName + " class='" + (first.className || "").substring(0, 50) + "'";
                    if (first.dataset) {
                        var dk = Object.keys(first.dataset);
                        if (dk.length > 0) info += " data=" + dk.join(",");
                    }
                    info += ">";
                }
                info += "\n";
            }

            info += "\n=== 3. 搜索含'prompt'的id元素 ===\n";
            var allEls = document.querySelectorAll("[id*='prompt']");
            info += "共" + allEls.length + "个\n";
            for (var i = 0; i < Math.min(allEls.length, 15); i++) {
                var e = allEls[i];
                info += "  #" + e.id + " <" + e.tagName + "> children=" + e.children.length + "\n";
            }

            info += "\n=== 4. eventTypes ===\n";
            try {
                var ctx = SillyTavern.getContext();
                var et = ctx.eventTypes;
                if (et) {
                    var etKeys = Object.keys(et);
                    info += "共" + etKeys.length + "个事件类型\n";
                    var settingsEvents = etKeys.filter(function (k) {
                        return k.toLowerCase().indexOf("setting") !== -1 ||
                               k.toLowerCase().indexOf("prompt") !== -1 ||
                               k.toLowerCase().indexOf("preset") !== -1 ||
                               k.toLowerCase().indexOf("save") !== -1;
                    });
                    info += "相关事件:\n";
                    for (var i = 0; i < settingsEvents.length; i++) {
                        info += "  " + settingsEvents[i] + " = " + et[settingsEvents[i]] + "\n";
                    }
                }
            } catch (e) { info += "eventTypes读取失败: " + e.message + "\n"; }

            info += "\n=== 5. prompt_order详情 ===\n";
            try {
                var ctx = SillyTavern.getContext();
                var ccs = ctx.chatCompletionSettings;
                if (ccs && ccs.prompt_order) {
                    info += "条数: " + ccs.prompt_order.length + "\n";
                    for (var i = 0; i < ccs.prompt_order.length; i++) {
                        var po = ccs.prompt_order[i];
                        info += "  [" + i + "] character_id=" + po.character_id + " order项数=" + (po.order ? po.order.length : 0) + "\n";
                    }
                }
                info += "当前characterId: " + ctx.characterId + "\n";
            } catch (e) { info += "读取失败: " + e.message + "\n"; }

        } catch (e) {
            info += "总体错误: " + e.message + "\n";
        }
        r.text(info || "什么都没探测到");
    });

    var host = document.createElement("div");
    host.id = "bny-host";
    host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;";
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: "open" });

    var styleEl = document.createElement("style");
    styleEl.textContent =
        "*{box-sizing:border-box;margin:0;padding:0;}" +
        "::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#e0c0c8;border-radius:4px;}" +
        ".fab{position:fixed;width:52px;height:52px;font-size:24px;line-height:52px;text-align:center;border-radius:50%;background:linear-gradient(135deg,#ff6b9d,#c44569);color:#fff;border:2px solid rgba(255,255,255,.3);cursor:pointer;box-shadow:0 4px 15px rgba(255,107,157,.5);display:none;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto;transition:transform .15s;z-index:10;}" +
        ".fab:active{transform:scale(.9);}" +
        ".pnl{position:fixed;width:90vw;max-width:400px;height:70vh;max-height:600px;background:#fffafc;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;pointer-events:auto;border:1px solid #fde2e8;z-index:5;}" +
        ".sh{display:flex;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #fde2e8;gap:5px;flex-shrink:0;}" +
        ".sh input{flex:1;height:34px;border:1px solid #f0d0d8;border-radius:20px;padding:0 12px;font-size:13px;outline:none;background:#fffafc;color:#333;min-width:0;}.sh input:focus{border-color:#ff6b9d;}" +
        ".btn{height:34px;padding:0 10px;border:none;border-radius:20px;font-size:12px;cursor:pointer;white-space:nowrap;flex-shrink:0;}" +
        ".bgo{background:linear-gradient(135deg,#ff6b9d,#c44569);color:#fff;}" +
        ".bcl{background:#f0e0e4;color:#c44569;font-size:11px;padding:0 8px;}" +
        ".etag{font-size:10px;color:#c44569;background:#fde2e8;padding:2px 8px;border-radius:10px;flex-shrink:0;}" +
        ".sb{flex:1;position:relative;background:#fff;overflow:hidden;}" +
        ".sb iframe{width:100%;height:100%;border:none;}" +
        ".fb{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.95);border:1px solid #fde2e8;padding:6px 16px;border-radius:20px;font-size:11px;color:#c44569;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.1);text-decoration:none;z-index:1;}" +
        ".tip{display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:13px;text-align:center;padding:20px;line-height:1.8;}";
    shadow.appendChild(styleEl);

    var fab = document.createElement("div");
    fab.className = "fab";
    fab.innerHTML = "&#x1F430;";
    shadow.appendChild(fab);

    var panel = document.createElement("div");
    panel.className = "pnl";
    panel.innerHTML =
        '<div class="sh">' +
            '<span class="etag"></span>' +
            '<input type="text" class="si" placeholder="搜索或输入网址..."/>' +
            '<button class="btn bgo sbtn">搜索</button>' +
            '<button class="btn bcl cbtn">清空</button>' +
        '</div>' +
        '<div class="sb">' +
            '<div class="tip">选中文字后点🐰自动搜索<br/>输入网址可直接访问</div>' +
            '<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer" style="display:none;"></iframe>' +
            '<a class="fb" target="_blank" rel="noopener" style="display:none;">加载不出来？点这里 ↗</a>' +
        '</div>';
    shadow.appendChild(panel);

    var sInput = panel.querySelector(".si");
    var sBtnEl = panel.querySelector(".sbtn");
    var cBtnEl = panel.querySelector(".cbtn");
    var iframe = panel.querySelector("iframe");
    var fbLink = panel.querySelector(".fb");
    var tipEl = panel.querySelector(".tip");
    var eTag = panel.querySelector(".etag");
    var panelOpen = false;
    var hasSearch = false;

    function isUrl(s) {
        s = s.trim().toLowerCase();
        return s.indexOf("http://") === 0 || s.indexOf("https://") === 0 || /^[a-z0-9]([a-z0-9\-]*\.)+[a-z]{2,}/.test(s);
    }
    function toUrl(s) {
        s = s.trim();
        if (s.indexOf("http") !== 0) s = "https://" + s;
        return s;
    }
    function doSearch(q) {
        if (!q.trim()) return;
        q = q.trim();
        var eng = getEngine();
        eTag.textContent = eng.name;
        if (isUrl(q)) {
            iframe.src = toUrl(q);
            fbLink.href = toUrl(q);
        } else {
            iframe.src = eng.search(q);
            fbLink.href = eng.fallback(q);
        }
        iframe.style.display = "block";
        tipEl.style.display = "none";
        fbLink.style.display = "block";
        hasSearch = true;
    }
    function clearS() {
        iframe.src = "";
        iframe.style.display = "none";
        tipEl.style.display = "flex";
        fbLink.style.display = "none";
        sInput.value = "";
        hasSearch = false;
    }
    sBtnEl.addEventListener("click", function (e) { e.stopPropagation(); doSearch(sInput.value); });
    cBtnEl.addEventListener("click", function (e) { e.stopPropagation(); clearS(); });
    sInput.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") doSearch(sInput.value); });
    sInput.addEventListener("keyup", function (e) { e.stopPropagation(); });
    sInput.addEventListener("keypress", function (e) { e.stopPropagation(); });
    sInput.addEventListener("input", function (e) { e.stopPropagation(); });

    panel.addEventListener("touchstart", function (e) { e.stopPropagation(); });
    panel.addEventListener("touchmove", function (e) { e.stopPropagation(); });
    panel.addEventListener("touchend", function (e) { e.stopPropagation(); });
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    panel.addEventListener("mousedown", function (e) { e.stopPropagation(); });

    var posX = 100, posY = 300;
    function posPanel() {
        var pw = Math.min(window.innerWidth * 0.9, 400);
        var ph = Math.min(window.innerHeight * 0.7, 600);
        var gap = 10;
        var left = posX + 26 - pw / 2;
        if (left < 5) left = 5;
        if (left + pw > window.innerWidth - 5) left = window.innerWidth - 5 - pw;
        var top;
        if (posY - gap - ph > 5) {
            top = posY - gap - ph;
        } else {
            top = posY + 52 + gap;
            if (top + ph > window.innerHeight - 5) top = window.innerHeight - 5 - ph;
        }
        panel.style.left = left + "px";
        panel.style.top = top + "px";
        panel.style.width = pw + "px";
        panel.style.height = ph + "px";
    }
    function openP(text) {
        eTag.textContent = getEngine().name;
        if (text) {
            sInput.value = text;
            doSearch(text);
        }
        if (!text && !hasSearch) tipEl.style.display = "flex";
        posPanel();
        panel.style.display = "flex";
        panelOpen = true;
    }
    function closeP() {
        panel.style.display = "none";
        panelOpen = false;
    }
    function toggleP() {
        var sel = window.getSelection();
        var text = sel ? sel.toString().trim() : "";
        if (panelOpen) {
            if (text) {
                sInput.value = text;
                doSearch(text);
            } else {
                closeP();
            }
        } else {
            openP(text);
        }
    }

    var dragging = false, hasMoved = false, startX = 0, startY = 0;
    function moveTo(x, y) {
        var mx = window.innerWidth - 52;
        var my = window.innerHeight - 52;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > mx) x = mx;
        if (y > my) y = my;
        posX = x;
        posY = y;
        fab.style.left = x + "px";
        fab.style.top = y + "px";
        if (panelOpen) posPanel();
    }

    fab.addEventListener("touchstart", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        dragging = true;
        hasMoved = false;
        var t = e.touches[0];
        startX = t.clientX - posX;
        startY = t.clientY - posY;
    }, { passive: false });

    fab.addEventListener("touchmove", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!dragging) return;
        hasMoved = true;
        var t = e.touches[0];
        moveTo(t.clientX - startX, t.clientY - startY);
    }, { passive: false });

    fab.addEventListener("touchend", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var wasDragging = dragging;
        var wasMoved = hasMoved;
        dragging = false;
        hasMoved = false;
        if (wasDragging && !wasMoved) {
            setTimeout(function () { toggleP(); }, 50);
        }
        if (wasDragging && wasMoved) {
            localStorage.setItem("bnyPosX", String(posX));
            localStorage.setItem("bnyPosY", String(posY));
        }
    }, { passive: false });

    fab.addEventListener("mousedown", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        dragging = true;
        hasMoved = false;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
    });

    document.addEventListener("mousemove", function (e) {
        if (!dragging) return;
        hasMoved = true;
        moveTo(e.clientX - startX, e.clientY - startY);
    });

    document.addEventListener("mouseup", function () {
        if (!dragging) return;
        var wasMoved = hasMoved;
        dragging = false;
        hasMoved = false;
        if (!wasMoved) toggleP();
        else {
            localStorage.setItem("bnyPosX", String(posX));
            localStorage.setItem("bnyPosY", String(posY));
        }
    });

    function showFab() {
        var sx = localStorage.getItem("bnyPosX");
        var sy = localStorage.getItem("bnyPosY");
        if (sx !== null && sy !== null) {
            posX = parseInt(sx);
            posY = parseInt(sy);
        }
        moveTo(posX, posY);
        fab.style.display = "block";
    }
    function hideFab() {
        fab.style.display = "none";
        closeP();
    }

    var saved = localStorage.getItem("bnyShow");
    if (saved === "1") {
        $("#bny-toggle").prop("checked", true);
        showFab();
        $("#bny-status").text("Bunny is visible!");
    }
    $("#bny-toggle").on("change", function () {
        var on = $(this).prop("checked");
        if (on) {
            showFab();
            $("#bny-status").text("Bunny is visible!");
        } else {
            hideFab();
            $("#bny-status").text("Bunny is hidden");
        }
        localStorage.setItem("bnyShow", on ? "1" : "0");
    });
});
