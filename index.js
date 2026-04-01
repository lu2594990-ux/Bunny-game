jQuery(() => {
    var getContainer = function () {
        return $(document.getElementById("extensions_settings"));
    };

    getContainer().append(
        '<div class="inline-drawer">' +
            '<div class="inline-drawer-toggle inline-drawer-header">' +
                '<b>Bunny Game</b>' +
                '<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>' +
            '</div>' +
            '<div class="inline-drawer-content">' +
                '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 0;">' +
                    '<input type="checkbox" id="bny-toggle" />' +
                    '<span>Show Bunny</span>' +
                '</label>' +
                '<div id="bny-status" style="padding:5px 0;font-size:12px;color:#888;">Bunny is hidden</div>' +
            '</div>' +
        '</div>'
    );

    localStorage.removeItem("bnyPosX");
    localStorage.removeItem("bnyPosY");

    var host = document.createElement("div");
    host.id = "bny-host";
    host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;";
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: "open" });

    var fab = document.createElement("div");
    fab.innerHTML = "&#x1F430;";
    fab.setAttribute("style", "position:fixed;left:100px;top:300px;width:52px;height:52px;font-size:24px;line-height:52px;text-align:center;border-radius:50%;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:2px solid rgba(255,255,255,0.3);cursor:pointer;box-shadow:0 4px 15px rgba(255,107,157,0.5);display:none;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto;");
    shadow.appendChild(fab);

    var dragging = false;
    var hasMoved = false;
    var startX = 0;
    var startY = 0;
    var posX = 100;
    var posY = 300;

    function moveTo(x, y) {
        var maxX = window.innerWidth - 52;
        var maxY = window.innerHeight - 52;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;
        posX = x;
        posY = y;
        fab.style.left = x + "px";
        fab.style.top = y + "px";
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
        var wasMoving = hasMoved;
        dragging = false;
        hasMoved = false;
        if (wasDragging && !wasMoving) {
            setTimeout(function () {
                alert("Bunny works! Tap OK!");
            }, 50);
        }
        if (wasDragging && wasMoving) {
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
        var wasMoving = hasMoved;
        dragging = false;
        hasMoved = false;
        if (wasMoving) {
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
