jQuery(() => {
    var getContainer = function () {
        return $(document.getElementById("extensions_settings"));
    };

    var defaultKillPrompt = "请润色以下文本。去除AI模型常见的模板化、八股化表达，使文字更加自然流畅。保持原文的情节、角色、情感和长度不变。不要添加新的内容，不要删减情节，只优化措辞和表达方式。直接输出润色后的文本，不要任何解释或前缀。";
    var defaultStylePrompt = "请对以下文本进行文风精修。在保持原有情节、角色和内容完全不变的前提下，优化文字的表现力和文学性。注意节奏感、用词精准度和氛围感的提升。不要添加或删减任何情节内容。直接输出修改后的文本，不要任何解释或前缀。";

    getContainer().append(
        '<div class="inline-drawer">' +
            '<div class="inline-drawer-toggle inline-drawer-header">' +
                '<b>🐰 Bunny Toolbox</b>' +
                '<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>' +
            '</div>' +
            '<div class="inline-drawer-content">' +
                '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 0;">' +
                    '<input type="checkbox" id="bny-toggle" />' +
                    '<span>Show Bunny</span>' +
                '</label>' +
                '<div style="padding:5px 0;">' +
                    '<label style="font-size:12px;color:#888;display:block;margin-bottom:4px;">搜索引擎</label>' +
                    '<select id="bny-engine" style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:13px;">' +
                        '<option value="google">Google</option>' +
                        '<option value="baidu">百度</option>' +
                        '<option value="bing">必应 Bing</option>' +
                '<option value="quark">夸克</option>' +
                '</select>' +
                '</div>' +
                '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;" />' +
                '<div style="font-weight:bold;font-size:13px;padding:4px 0;color:#c44569;">🔧 API设置</div>' +
                '<div style="padding:3px 0;">' +
                    '<label style="font-size:12px;color:#888;">API 地址</label>' +
                    '<input type="text" id="bny-api-url" placeholder="https://api.openai.com/v1/chat/completions" style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;" />' +
                '</div>' +
                '<div style="padding:3px 0;">' +
                    '<label style="font-size:12px;color:#888;">API Key</label>' +
                    '<input type="password" id="bny-api-key" placeholder="sk-..." style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;" />' +
                '</div>' +
                '<div style="padding:3px 0;">' +
                    '<label style="font-size:12px;color:#888;">模型名称</label>' +
                    '<input type="text" id="bny-api-model" placeholder="gpt-4o-mini" style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;" />' +
                '</div>' +
                '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;" />' +
                '<div style="font-weight:bold;font-size:13px;padding:4px 0;color:#c44569;">✨ 杀八股指令</div>' +
                '<textarea id="bny-kill-prompt" rows="4" style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;resize:vertical;font-family:inherit;"></textarea>' +
                '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;" />' +
                '<div style="font-weight:bold;font-size:13px;padding:4px 0;color:#c44569;">🎨 文风指令</div>' +
                '<textarea id="bny-style-prompt" rows="4" style="width:100%;padding:5px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;resize:vertical;font-family:inherit;"></textarea>' +
                '<button id="bny-save-api" style="margin-top:6px;padding:6px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;font-size:12px;cursor:pointer;width:100%;">💾 保存所有设置</button>' +
                '<div id="bny-status" style="padding:5px 0;font-size:12px;color:#888;">Bunny is hidden</div>' +
            '</div>' +
        '</div>'
    );

    function loadSettings() {
        var s = localStorage.getItem("bnySettings2");
        if (s) { try { return JSON.parse(s); } catch (e) {} }
        return { url: "", key: "", model: "gpt-4o-mini", killPrompt: defaultKillPrompt, stylePrompt: defaultStylePrompt };
    }

    function saveSettings() {
        var obj = {
            url: $("#bny-api-url").val().trim(),
            key: $("#bny-api-key").val().trim(),
            model: $("#bny-api-model").val().trim(),
            killPrompt: $("#bny-kill-prompt").val(),
            stylePrompt: $("#bny-style-prompt").val()
        };
        localStorage.setItem("bnySettings2", JSON.stringify(obj));
        $("#bny-status").text("✅ 所有设置已保存！");
        return obj;
    }

    var settings = loadSettings();
    $("#bny-api-url").val(settings.url);
    $("#bny-api-key").val(settings.key);
    $("#bny-api-model").val(settings.model);
    $("#bny-kill-prompt").val(settings.killPrompt);
    $("#bny-style-prompt").val(settings.stylePrompt);
    $("#bny-save-api").on("click", function () { saveSettings(); });

    var engines = {
        google: { name: "Google", search: function (q) { return "https://www.google.com/search?igu=1&q=" + encodeURIComponent(q); }, fallback: function (q) { return "https://www.google.com/search?q=" + encodeURIComponent(q); } },
        baidu: { name: "百度", search: function (q) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(q); }, fallback: function (q) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(q); } },
        bing: { name: "必应", search: function (q) { return "https://www.bing.com/search?q=" + encodeURIComponent(q); }, fallback: function (q) { return "https://www.bing.com/search?q=" + encodeURIComponent(q); } },
        quark: { name: "夸克", search: function (q) { return "https://quark.sm.cn/s?q=" + encodeURIComponent(q); }, fallback: function (q) { return "https://quark.sm.cn/s?q=" + encodeURIComponent(q); } }
    };

    function getEngine() { var k = localStorage.getItem("bnyEngine") || "google"; return engines[k] || engines.google; }
    $("#bny-engine").val(localStorage.getItem("bnyEngine") || "google");
    $("#bny-engine").on("change", function () { localStorage.setItem("bnyEngine", $(this).val()); });

    localStorage.removeItem("bnyPosX");
    localStorage.removeItem("bnyPosY");

    var host = document.createElement("div");
    host.id = "bny-host";
    host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;";
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: "open" });

    var styleEl = document.createElement("style");
    styleEl.textContent = [
        "* { box-sizing:border-box; margin:0; padding:0; }",
        "::-webkit-scrollbar { width:4px; }",
        "::-webkit-scrollbar-thumb { background:#e0c0c8; border-radius:4px; }",
        ".bny-fab { position:fixed; width:52px; height:52px; font-size:24px; line-height:52px; text-align:center; border-radius:50%; background:linear-gradient(135deg,#ff6b9d,#c44569); color:white; border:2px solid rgba(255,255,255,0.3); cursor:pointer; box-shadow:0 4px 15px rgba(255,107,157,0.5); display:none; touch-action:none; user-select:none; -webkit-user-select:none; pointer-events:auto; transition:transform 0.15s; }",
        ".bny-fab:active { transform:scale(0.9); }",
        ".bny-panel { position:fixed; width:90vw; max-width:400px; height:62vh; max-height:520px; background:#fffafc; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.18); display:none; flex-direction:column; overflow:hidden; pointer-events:auto; border:1px solid #fde2e8; }",
        ".bny-tabs { display:flex; background:#fff; border-bottom:1px solid #fde2e8; flex-shrink:0; }",
        ".bny-tab { flex:1; padding:10px 0; text-align:center; font-size:13px; cursor:pointer; color:#aaa; border-bottom:2px solid transparent; transition:all 0.2s; }",
        ".bny-tab.active { color:#c44569; border-bottom-color:#c44569; font-weight:bold; }",
        ".bny-tab-content { flex:1; display:none; flex-direction:column; overflow:hidden; }",
        ".bny-tab-content.active { display:flex; }",

        ".bny-search-header { display:flex; align-items:center; padding:8px 10px; background:#fff; border-bottom:1px solid #fde2e8; gap:5px; flex-shrink:0; }",
        ".bny-search-header input { flex:1; height:34px; border:1px solid #f0d0d8; border-radius:20px; padding:0 12px; font-size:13px; outline:none; background:#fffafc; color:#333; min-width:0; }",
        ".bny-search-header input:focus { border-color:#ff6b9d; }",
        ".bny-btn { height:34px; padding:0 10px; border:none; border-radius:20px; font-size:12px; cursor:pointer; white-space:nowrap; flex-shrink:0; }",
        ".bny-go { background:linear-gradient(135deg,#ff6b9d,#c44569); color:white; }",
        ".bny-clear { background:#f0e0e4; color:#c44569; font-size:11px; padding:0 8px; }",
        ".bny-engine-tag { font-size:10px; color:#c44569; background:#fde2e8; padding:2px 8px; border-radius:10px; flex-shrink:0; }",
        ".bny-search-body { flex:1; position:relative; background:#fff; overflow:hidden; }",
        ".bny-search-body iframe { width:100%; height:100%; border:none; }",
        ".bny-fallback { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(255,255,255,0.95); border:1px solid #fde2e8; padding:6px 16px; border-radius:20px; font-size:11px; color:#c44569; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.1); text-decoration:none; z-index:1; }",
        ".bny-tip { display:flex; align-items:center; justify-content:center; height:100%; color:#ccc; font-size:13px; text-align:center; padding:20px; line-height:1.8; }",

        ".bny-polish-content { flex:1; display:flex; flex-direction:column; padding:12px; gap:8px; overflow-y:auto; }",
        ".bny-section-label { font-size:11px; color:#c44569; font-weight:bold; }",
        ".bny-preview { background:#f9f0f3; border:1px solid #fde2e8; border-radius:10px; padding:10px; font-size:12px; color:#666; max-height:100px; overflow-y:auto; line-height:1.6; flex-shrink:0; white-space:pre-wrap; word-break:break-word; }",
        ".bny-preview.empty { color:#ccc; font-style:italic; }",
        ".bny-btn-row { display:flex; gap:8px; flex-shrink:0; }",
        ".bny-action-btn { flex:1; height:42px; border:none; border-radius:12px; color:white; font-size:14px; font-weight:bold; cursor:pointer; transition:transform 0.1s,opacity 0.2s; }",
        ".bny-action-btn:active { transform:scale(0.97); }",
        ".bny-action-btn:disabled { opacity:0.5; cursor:not-allowed; }",
        ".bny-action-btn.kill { background:linear-gradient(135deg,#ff6b9d,#c44569); }",
        ".bny-action-btn.style { background:linear-gradient(135deg,#6b9dff,#4569c4); }",
        ".bny-status-text { font-size:12px; color:#888; text-align:center; padding:2px; min-height:18px; }",
        ".bny-status-text.error { color:#e74c3c; }",
        ".bny-status-text.success { color:#27ae60; }",
        ".bny-result-section { flex-shrink:0; display:none; }",
        ".bny-result-box { background:#f0faf0; border:1px solid #d0e8d0; border-radius:10px; padding:10px; font-size:12px; color:#333; max-height:120px; overflow-y:auto; line-height:1.6; white-space:pre-wrap; word-break:break-word; }",
        ".bny-undo-btn { width:100%; height:34px; border:1px solid #fde2e8; border-radius:10px; background:#fff; color:#c44569; font-size:12px; cursor:pointer; flex-shrink:0; margin-top:4px; display:none; }",
        ".bny-token-info { font-size:10px; color:#bbb; text-align:right; }",

        ".bny-close-float { position:absolute; top:8px; right:8px; width:28px; height:28px; border:none; border-radius:50%; background:rgba(0,0,0,0.06); color:#999; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:2; }"].join("\n");
    shadow.appendChild(styleEl);

    var fab = document.createElement("div");
    fab.className = "bny-fab";
    fab.innerHTML = "&#x1F430;";
    shadow.appendChild(fab);

    var panel = document.createElement("div");
    panel.className = "bny-panel";
    panel.innerHTML =
        '<div class="bny-tabs">' +
            '<div class="bny-tab active" data-tab="search">🔍 搜索</div>' +
            '<div class="bny-tab" data-tab="polish">✨ 润色</div>' +
        '</div>' +
        '<div class="bny-tab-content active" data-tab="search">' +
            '<div class="bny-search-header">' +
                '<span class="bny-engine-tag"></span>' +
                '<input type="text" class="bny-input" placeholder="搜索 或 输入网址..." />' +
                '<button class="bny-btn bny-go">搜索</button>' +
                '<button class="bny-btn bny-clear">清空</button>' +
            '</div>' +
            '<div class="bny-search-body">' +
                '<div class="bny-tip">选中文字后点🐰 自动搜索<br/>输入网址可直接访问</div>' +
                '<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer" style="display:none;"></iframe>' +'<a class="bny-fallback" target="_blank" rel="noopener" style="display:none;">加载不出来？点这里打开 ↗</a>' +
            '</div>' +
        '</div>' +
        '<div class="bny-tab-content" data-tab="polish">' +
            '<div class="bny-polish-content">' +
                '<div class="bny-section-label">📄 提取的&lt;content&gt; 正文：</div>' +
                '<div class="bny-preview empty">点击下方按钮抓取最新回复...</div>' +
                '<div class="bny-token-info"></div>' +
                '<button class="bny-btn bny-go" style="width:100%;margin:2px 0;" id="bny-grab">📋 抓取最新回复</button>' +
                '<div class="bny-btn-row">' +
                    '<button class="bny-action-btn kill" disabled>✨ 杀八股</button>' +
                    '<button class="bny-action-btn style" disabled>🎨 文风</button>' +
                '</div>' +
                '<div class="bny-status-text"></div>' +
                '<div class="bny-result-section">' +
                    '<div class="bny-section-label">✅ 润色结果：</div>' +
                    '<div class="bny-result-box"></div>' +
                '</div>' +
                '<button class="bny-undo-btn">↩撤销还原</button>' +
            '</div>' +
        '</div>' +
        '<button class="bny-close-float">\u2715</button>';
    shadow.appendChild(panel);

    var tabEls = panel.querySelectorAll(".bny-tab");
    var tabContents = panel.querySelectorAll(".bny-tab-content");
    tabEls.forEach(function (tab) {
        tab.addEventListener("click", function (e) {
            e.stopPropagation();
            var t = this.getAttribute("data-tab");
            tabEls.forEach(function (x) { x.classList.remove("active"); });
            tabContents.forEach(function (x) { x.classList.remove("active"); });
            this.classList.add("active");
            panel.querySelector('.bny-tab-content[data-tab="' + t + '"]').classList.add("active");
        });
    });

    var searchInput = panel.querySelector(".bny-input");
    var searchBtn = panel.querySelector(".bny-go");
    var clearBtn = panel.querySelector(".bny-clear");
    var iframe = panel.querySelector("iframe");
    var fallbackLink = panel.querySelector(".bny-fallback");
    var tip = panel.querySelector(".bny-tip");
    var engineTag = panel.querySelector(".bny-engine-tag");
    var closeFloatBtn = panel.querySelector(".bny-close-float");

    var previewEl = panel.querySelector(".bny-preview");
    var tokenInfo = panel.querySelector(".bny-token-info");
    var grabBtn = panel.querySelector("#bny-grab");
    var killBtn = panel.querySelector(".bny-action-btn.kill");
    var styleBtn = panel.querySelector(".bny-action-btn.style");
    var statusText = panel.querySelector(".bny-status-text");
    var resultSection = panel.querySelector(".bny-result-section");
    var resultBox = panel.querySelector(".bny-result-box");
    var undoBtn = panel.querySelector(".bny-undo-btn");

    var panelOpen = false;
    var hasSearchContent = false;
    var undoData = null;
    var grabbedContent = null;
    var grabbedMsgIndex = null;
    var grabbedFullText = null;

    function isUrl(str) {
        var s = str.trim().toLowerCase();
        if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) return true;
        if(/^[a-z0-9]([a-z0-9\-]*\.)+[a-z]{2,}/.test(s)) return true;
        return false;
    }

    function toUrl(str) {
        var s = str.trim();
        if (s.indexOf("http://") !== 0 && s.indexOf("https://") !== 0) s = "https://" + s;
        return s;
    }

    function doSearch(query) {
        if (!query.trim()) return;
        var q = query.trim();
        var engine = getEngine();
        engineTag.textContent = engine.name;
        if (isUrl(q)) {
            var url = toUrl(q);
            iframe.src = url;
            fallbackLink.href = url;
        } else {
            iframe.src = engine.search(q);
            fallbackLink.href = engine.fallback(q);
        }
        iframe.style.display = "block";
        tip.style.display = "none";
        fallbackLink.style.display = "block";
        hasSearchContent = true;
    }

    function clearSearch() {
        iframe.src = "";
        iframe.style.display = "none";
        tip.style.display = "flex";
        fallbackLink.style.display = "none";
        searchInput.value = "";
        hasSearchContent = false;
    }

    function positionPanel() {
        var pw = Math.min(window.innerWidth * 0.9, 400);
        var ph = Math.min(window.innerHeight * 0.62, 520);
        var gap = 10;
        var bunnyCenter = posX + 26;
        var left = bunnyCenter - pw / 2;
        if (left < 5) left = 5;
        if (left + pw > window.innerWidth - 5) left = window.innerWidth - 5 - pw;
        var top;
        if (posY - gap - ph > 5) {
            top = posY - gap - ph;
        } else {
            top = posY + 52+ gap;
            if (top + ph > window.innerHeight - 5) top = window.innerHeight - 5 - ph;
        }
        panel.style.left = left + "px";
        panel.style.top = top + "px";
        panel.style.width = pw + "px";
        panel.style.height = ph + "px";
    }

    function openPanel(text) {
        engineTag.textContent = getEngine().name;
        if (text) {
            searchInput.value = text;
            tabEls.forEach(function (x) { x.classList.remove("active"); });
            tabContents.forEach(function (x) { x.classList.remove("active"); });
            tabEls[0].classList.add("active");
            tabContents[0].classList.add("active");
            doSearch(text);
        }
        if (!text && !hasSearchContent) tip.style.display = "flex";
        positionPanel();
        panel.style.display = "flex";
        panelOpen = true;
    }

    function closePanel() {
        panel.style.display = "none";
        panelOpen = false;
    }

    function togglePanel() {
        if (panelOpen) { closePanel(); }
        else {
            var sel = window.getSelection();
            var text = sel ? sel.toString().trim() : "";
            openPanel(text);
        }
    }

    function extractContent(fullText) {
        var match = fullText.match(/<content>([\s\S]*?)<\/content>/i);
        if (match) return match[1].trim();
        return null;
    }

    function replaceContent(fullText, newContent) {
        return fullText.replace(/<content>[\s\S]*?<\/content>/i, "<content>" + newContent + "</content>");
    }

    function roughTokenCount(str) {
        return Math.ceil(str.length / 2);
    }

    function getLastBotMessage() {
        try {
            var context = SillyTavern.getContext();
            var chat = context.chat;
            for (var i = chat.length - 1; i >= 0; i--) {
                if (!chat[i].is_user && !chat[i].is_system) {
                    return { index: i, text: chat[i].mes };
                }
            }
        } catch (e) {}
        return null;
    }

    grabBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var msg = getLastBotMessage();
        if (!msg) {
            previewEl.textContent = "❌ 没有找到AI回复";
            previewEl.classList.add("empty");
            killBtn.disabled = true;
            styleBtn.disabled = true;
            return;
        }

        grabbedFullText = msg.text;
        grabbedMsgIndex = msg.index;
        var content = extractContent(msg.text);

        if (content) {
            grabbedContent = content;
            var preview = content.length > 300 ? content.substring(0, 300) + "..." : content;
            previewEl.textContent = preview;
            previewEl.classList.remove("empty");
            var tokens = roughTokenCount(content);
            tokenInfo.textContent = "≈ " + tokens + " tokens (估算)";
            killBtn.disabled = false;
            styleBtn.disabled = false;
            statusText.textContent = "";
            statusText.className = "bny-status-text";
            resultSection.style.display = "none";
            undoBtn.style.display = "none";
        } else {
            grabbedContent = null;
            previewEl.textContent = "⚠️ 未找到 <content> 标签，将使用全文";
            previewEl.classList.add("empty");

            grabbedContent = msg.text;
            var preview2 = msg.text.length > 300 ? msg.text.substring(0, 300) + "..." : msg.text;
            previewEl.textContent = "⚠️ 未找到<content>标签，使用全文：\n\n" + preview2;
            tokenInfo.textContent = "≈ " + roughTokenCount(msg.text) + " tokens (估算·全文)";
            killBtn.disabled = false;
            styleBtn.disabled = false;
        }
    });

    function doPolish(mode) {
        var st = loadSettings();
        if (!st.url || !st.key) {
            statusText.textContent = "⚠️ 请先在设置里填写 API 地址和 Key！";
            statusText.className = "bny-status-text error";
            return;
        }
        if (!grabbedContent) {
            statusText.textContent = "⚠️ 请先抓取回复！";
            statusText.className = "bny-status-text error";
            return;
        }

        var prompt = mode === "kill" ? st.killPrompt : st.stylePrompt;
        if (!prompt) {
            statusText.textContent = "⚠️ 请先在设置里填写" + (mode === "kill" ? "杀八股" : "文风") + "指令！";
            statusText.className = "bny-status-text error";
            return;
        }

        killBtn.disabled = true;
        styleBtn.disabled = true;
        var label = mode === "kill" ? "杀八股" : "文风润色";
        statusText.textContent = "🔄 " + label + "中...请稍候";
        statusText.className = "bny-status-text";

        var body = {
            model: st.model || "gpt-4o-mini",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: grabbedContent }
            ],
            temperature: 0.7
        };

        fetch(st.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + st.key
            },
            body: JSON.stringify(body)
        })
        .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (data) {
            var newText = "";
            if (data.choices && data.choices[0]) {
                newText = data.choices[0].message.content;} else if (data.content && data.content[0]) {
                newText = data.content[0].text;
            }
            if (!newText) throw new Error("API返回为空");

            undoData = { index: grabbedMsgIndex, originalText: grabbedFullText };

            var hasTag = /<content>[\s\S]*?<\/content>/i.test(grabbedFullText);
            var finalText;
            if (hasTag) {
                finalText = replaceContent(grabbedFullText, newText);
            } else {
                finalText = newText;
            }

            try {
                var context = SillyTavern.getContext();
                context.chat[grabbedMsgIndex].mes = finalText;
                var mesDiv = document.querySelector('#chat .mes[mesid="' + grabbedMsgIndex + '"] .mes_text');
                if (mesDiv) {
                    if (typeof messageFormatting === "function") {
                        mesDiv.innerHTML = messageFormatting(finalText, context.name2, false, false, grabbedMsgIndex);
                    } else {
                        mesDiv.innerHTML = finalText.replace(/\n/g, "<br>");
                    }
                }context.saveChat();
            } catch (ex) {
                console.error("Bunny: replace error", ex);
            }

            grabbedFullText = finalText;
            grabbedContent = newText;

            killBtn.disabled = false;
            styleBtn.disabled = false;
            statusText.textContent = "✅ " + label + "完成！已替换正文";
            statusText.className = "bny-status-text success";

            var resultPreview = newText.length > 300 ? newText.substring(0, 300) + "..." : newText;
            resultBox.textContent = resultPreview;
            resultSection.style.display = "block";
            undoBtn.style.display = "block";

            var newPreview = newText.length > 300 ? newText.substring(0, 300) + "..." : newText;
            previewEl.textContent = newPreview;
            tokenInfo.textContent = "≈ " + roughTokenCount(newText) + " tokens (估算)";
        })
        .catch(function (err) {
            killBtn.disabled = false;
            styleBtn.disabled = false;
            statusText.textContent = "❌ 失败: " + err.message;
            statusText.className = "bny-status-text error";
        });
    }

    killBtn.addEventListener("click", function (e) { e.stopPropagation(); doPolish("kill"); });
    styleBtn.addEventListener("click", function (e) { e.stopPropagation(); doPolish("style"); });

    undoBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!undoData) return;
        try {
            var context = SillyTavern.getContext();
            context.chat[undoData.index].mes = undoData.originalText;
            var mesDiv = document.querySelector('#chat .mes[mesid="' + undoData.index + '"] .mes_text');
            if (mesDiv) {
                if (typeof messageFormatting === "function") {
                    mesDiv.innerHTML = messageFormatting(undoData.originalText, context.name2, false, false, undoData.index);
                } else {
                    mesDiv.innerHTML = undoData.originalText.replace(/\n/g, "<br>");
                }
            }
            context.saveChat();
            grabbedFullText = undoData.originalText;
            var c = extractContent(undoData.originalText);
            grabbedContent = c || undoData.originalText;
        } catch (ex) {}statusText.textContent = "↩ 已撤销还原！";
        statusText.className = "bny-status-text";undoBtn.style.display = "none";
        resultSection.style.display = "none";
        undoData = null;
        var p = grabbedContent.length > 300 ? grabbedContent.substring(0, 300) + "..." : grabbedContent;
        previewEl.textContent = p;
    });

    searchBtn.addEventListener("click", function (e) { e.stopPropagation(); doSearch(searchInput.value); });
    clearBtn.addEventListener("click", function (e) { e.stopPropagation(); clearSearch(); });
    closeFloatBtn.addEventListener("click", function (e) { e.stopPropagation(); closePanel(); });

    searchInput.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") doSearch(searchInput.value); });
    searchInput.addEventListener("keyup", function (e) { e.stopPropagation(); });
    searchInput.addEventListener("keypress", function (e) { e.stopPropagation(); });
    searchInput.addEventListener("input", function (e) { e.stopPropagation(); });

    panel.addEventListener("touchstart", function (e) { e.stopPropagation(); });
    panel.addEventListener("touchmove", function (e) { e.stopPropagation(); });
    panel.addEventListener("touchend", function (e) { e.stopPropagation(); });
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    panel.addEventListener("mousedown", function (e) { e.stopPropagation(); });

    [killBtn, styleBtn, undoBtn, grabBtn].forEach(function (btn) {
        btn.addEventListener("touchstart", function (e) { e.stopPropagation(); });
        btn.addEventListener("touchend", function (e) { e.stopPropagation(); });
    });

    var dragging = false, hasMoved = false, startX = 0, startY = 0, posX = 100, posY = 300;

    function moveTo(x, y) {
        var maxX = window.innerWidth - 52, maxY = window.innerHeight - 52;
        if (x < 0) x = 0; if (y < 0) y = 0;
        if (x > maxX) x = maxX; if (y > maxY) y = maxY;
        posX = x; posY = y;
        fab.style.left = x + "px"; fab.style.top = y + "px";
        if (panelOpen) positionPanel();
    }

    fab.addEventListener("touchstart", function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        dragging = true; hasMoved = false;
        var t = e.touches[0]; startX = t.clientX - posX; startY = t.clientY - posY;
    }, { passive: false });

    fab.addEventListener("touchmove", function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (!dragging) return; hasMoved = true;
        var t = e.touches[0]; moveTo(t.clientX - startX, t.clientY - startY);
    }, { passive: false });

    fab.addEventListener("touchend", function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        var wasDrag = dragging, wasMove = hasMoved;
        dragging = false; hasMoved = false;
        if (wasDrag && !wasMove) setTimeout(function () { togglePanel(); }, 50);
        if (wasDrag && wasMove) {
            localStorage.setItem("bnyPosX", String(posX));
            localStorage.setItem("bnyPosY", String(posY));
        }
    }, { passive: false });

    fab.addEventListener("mousedown", function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        dragging = true; hasMoved = false;
        startX = e.clientX - posX; startY = e.clientY - posY;
    });

    document.addEventListener("mousemove", function (e) {
        if (!dragging) return; hasMoved = true;
        moveTo(e.clientX - startX, e.clientY - startY);
    });

    document.addEventListener("mouseup", function () {
        if (!dragging) return;
        var wasMove = hasMoved; dragging = false; hasMoved = false;
        if (!wasMove) togglePanel();
        else { localStorage.setItem("bnyPosX", String(posX)); localStorage.setItem("bnyPosY", String(posY)); }
    });

    function showFab() {
        var sx = localStorage.getItem("bnyPosX"), sy = localStorage.getItem("bnyPosY");
        if (sx !== null && sy !== null) { posX = parseInt(sx); posY = parseInt(sy); }
        moveTo(posX, posY); fab.style.display = "block";
    }

    function hideFab() { fab.style.display = "none"; closePanel(); }

    var saved = localStorage.getItem("bnyShow");
    if (saved === "1") {
        $("#bny-toggle").prop("checked", true);
        showFab();
        $("#bny-status").text("Bunny is visible!");
    }

    $("#bny-toggle").on("change", function () {
        var on = $(this).prop("checked");
        if (on) { showFab(); $("#bny-status").text("Bunny is visible!"); }
        else { hideFab(); $("#bny-status").text("Bunny is hidden"); }
        localStorage.setItem("bnyShow", on ? "1" : "0");
    });
});
