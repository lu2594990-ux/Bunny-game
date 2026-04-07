jQuery(() => {
    $(document.getElementById("extensions_settings")).append(
        '<div class="inline-drawer">' +
        '<div class="inline-drawer-toggle inline-drawer-header">' +
        '<b>🐰 Bunny Toolbox</b>' +
        '<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>' +
        '</div>' +
        '<div class="inline-drawer-content">' +
        '<div style="padding:8px 0;">' +
        '<button id="bny-t1" style="background:#ff6b9d;color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:13px;cursor:pointer;">🔍 探测正则存储</button> ' +
        '<button id="bny-t2" style="background:#a855f7;color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:13px;cursor:pointer;">📋 查看正则内容</button> ' +
        '<button id="bny-t3" style="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:13px;cursor:pointer;">💬 最新消息</button>' +
        '</div>' +
        '<pre id="bny-out" style="margin-top:8px;padding:10px;background:#1a1a2e;color:#0f0;border-radius:8px;font-size:11px;max-height:400px;overflow:auto;white-space:pre-wrap;word-break:break-all;display:none;"></pre>' +
        '</div></div>'
    );

    $("#bny-t1").on("click", function () {
        var r = "";
        try {
            var ctx = SillyTavern.getContext();
            r += "=== Context顶层 Keys ===\n";
            var keys = Object.keys(ctx);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var v = ctx[k];
                var t = typeof v;
                if (v === null) r += k + ": null\n";
                else if (Array.isArray(v)) r += k + ": Array[" + v.length + "]\n";
                else if (t === "object") r += k + ": Object{" + Object.keys(v).slice(0, 8).join(", ") + "}\n";
                else if (t === "function") r += k + ": function\n";
                else r += k + ": " + t + " = " + String(v).substring(0, 50) + "\n";
            }
            r += "\n===搜索 regex 相关 ===\n";
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].toLowerCase().indexOf("regex") !== -1 || keys[i].toLowerCase().indexOf("script") !== -1) {
                    r += "★ " + keys[i] + " = " + JSON.stringify(ctx[keys[i]]).substring(0, 300) + "\n\n";
                }
            }
            r += "\n=== extensionSettings ===\n";
            if (ctx.extensionSettings) {
                var eKeys = Object.keys(ctx.extensionSettings);
                r += "keys: " + eKeys.join(", ") + "\n";
                for (var i = 0; i < eKeys.length; i++) {
                    if (eKeys[i].toLowerCase().indexOf("regex") !== -1) {
                        r += "★ extensionSettings." + eKeys[i] + " = " + JSON.stringify(ctx.extensionSettings[eKeys[i]]).substring(0, 500) + "\n\n";
                    }
                }
            } else {
                r += "extensionSettings 不存在\n";
            }r += "\n=== chatCompletionSettings ===\n";
            if (ctx.chatCompletionSettings) {
                var cKeys = Object.keys(ctx.chatCompletionSettings);
                r += "keys: " + cKeys.join(", ") + "\n";
                for (var i = 0; i < cKeys.length; i++) {
                    if (cKeys[i].toLowerCase().indexOf("regex") !== -1) {
                        r += "★ chatCompletionSettings." + cKeys[i] + "\n";
                    }
                }
            }
            r += "\n=== 全局变量探测 ===\n";
            var globals = ["regex_scripts", "regexScripts", "regex_replace", "scriptList", "extension_regex"];
            for (var i = 0; i < globals.length; i++) {
                if (window[globals[i]] !== undefined) {
                    r += "★ window." + globals[i] + "存在! = " + JSON.stringify(window[globals[i]]).substring(0, 300) + "\n";
                }
            }
        } catch (e) {
            r += "\nERROR: " + e.message + "\n" + e.stack;
        }
        $("#bny-out").text(r).show();
    });

    $("#bny-t2").on("click", function () {
        var r = "";
        try {
            var ctx = SillyTavern.getContext();
            r += "=== extensionSettings 全部内容（regex相关）===\n";
            if (ctx.extensionSettings) {
                var eKeys = Object.keys(ctx.extensionSettings);
                for (var i = 0; i < eKeys.length; i++) {
                    var val = ctx.extensionSettings[eKeys[i]];
                    if (typeof val === "object" && val !== null) {
                        var str = JSON.stringify(val);
                        if (str.toLowerCase().indexOf("regex") !== -1 || str.toLowerCase().indexOf("replace") !== -1 || str.toLowerCase().indexOf("find") !== -1 || str.toLowerCase().indexOf("script") !== -1) {
                            r += "\n★ " + eKeys[i] + ":\n" + JSON.stringify(val, null, 2).substring(0, 1000) + "\n";
                        }
                    }
                }
            }
            r += "\n=== 尝试读取角色卡数据 ===\n";
            if (ctx.characters && ctx.characterId !== undefined) {
                var char = ctx.characters[ctx.characterId];
                if (char) {
                    r += "角色名: " + (char.name || "?") + "\n";
                    var charKeys = Object.keys(char);
                    r += "角色数据keys: " + charKeys.join(", ") + "\n";
                    if (char.data) {
                        var dKeys = Object.keys(char.data);
                        r += "char.data keys: " + dKeys.join(", ") + "\n";
                        for (var i = 0; i < dKeys.length; i++) {
                            if (dKeys[i].toLowerCase().indexOf("regex") !== -1 || dKeys[i].toLowerCase().indexOf("script") !== -1 || dKeys[i].toLowerCase().indexOf("extension") !== -1) {
                                r += "★ char.data." + dKeys[i] + " = " + JSON.stringify(char.data[dKeys[i]]).substring(0, 500) + "\n";
                            }
                        }
                    }
                }
            }
        } catch (e) {
            r += "\nERROR: " + e.message + "\n" + e.stack;
        }
        $("#bny-out").text(r).show();
    });

    $("#bny-t3").on("click", function () {
        var r = "";
        try {
            var ctx = SillyTavern.getContext();
            var chat = ctx.chat;
            if (chat && chat.length > 0) {
                var last = chat[chat.length - 1];
                r += "=== 最后一条消息 ===\n";
                r += "发送者: " + (last.is_user ? "用户" : "AI") + "\n";
                r += "名字: " + (last.name || "?") + "\n";
                r += "消息keys: " + Object.keys(last).join(", ") + "\n";
                r += "\n=== 消息内容（前1000字）===\n";
                r += (last.mes || "空").substring(0, 1000) + "\n";
            } else {
                r += "没有聊天记录\n";
            }
        } catch (e) {
            r += "\nERROR: " + e.message + "\n" + e.stack;
        }
        $("#bny-out").text(r).show();
    });
});
