// =====================================================
// goose.js — เกมห่านผจญภัย (แนวเดินกระโดดเก็บตัวเลข)
//  - พาห่านไปเก็บป้ายตัวเลขที่เป็นคำตอบของโจทย์ด้านบนให้ครบ ประตูจะเปิด แล้วเดินเข้าประตู
//  - ป้ายที่ไม่ใช่คำตอบ: ห่านจะเด้งกลับ / หนาม: กลับไปจุดเริ่ม
//  - เล่นได้ทั้งคีย์บอร์ด (← → / A D, กระโดด: ↑ / W / Space) และปุ่มบนจอ
//  ?ch=ratio | prop | percent
// =====================================================
(function () {
    const F = (a, b) => `<span class="gfrac"><span>${a}</span><span>${b}</span></span>`;
    const B = '<span class="gblank">?</span>';

    // โจทย์แต่ละบท: 3 ด่าน / tiles = ค่าบนป้าย a, b, c, d ตามลำดับ (คำตอบ + ตัวหลอก)
    const SETS = {
        ratio: {
            name: "อัตราส่วนที่เท่ากัน", back: "../ratio/ratioans.html",
            levels: [
                { eqs: [[`2 : 3 = 4 : ${B}`, 6], [`1 : 5 = ${B} : 15`, 3]], tiles: [6, 3, 8] },
                { eqs: [[`3 : 4 = 9 : ${B}`, 12], [`10 : 4 = 5 : ${B}`, 2], [`${B} : 8 = 3 : 4`, 6]], tiles: [12, 2, 6, 9] },
                { eqs: [[`6 : 9 = 2 : ${B}`, 3], [`5 : 2 = ${B} : 8`, 20], [`4 : 7 = 12 : ${B}`, 21]], tiles: [3, 20, 21, 14] }
            ]
        },
        prop: {
            name: "สัดส่วน", back: "../prop/propans.html",
            levels: [
                { eqs: [[`${F(B, 6)} = ${F(2, 3)}`, 4], [`${F(3, 5)} = ${F(9, B)}`, 15]], tiles: [4, 15, 10] },
                { eqs: [[`${F(B, 20)} = ${F(1, 4)}`, 5], [`${F(2, 7)} = ${F(8, B)}`, 28], [`${F(5, 8)} = ${F(B, 16)}`, 10]], tiles: [5, 28, 10, 14] },
                { eqs: [[`${F(B, 9)} = ${F(4, 3)}`, 12], [`${F(6, B)} = ${F(3, 10)}`, 20], [`${F(7, 2)} = ${F(21, B)}`, 6]], tiles: [12, 20, 6, 18] }
            ]
        },
        percent: {
            name: "ร้อยละ", back: "../percent/percentans.html",
            levels: [
                { eqs: [[`50% ของ 40 = ${B}`, 20], [`10% ของ 90 = ${B}`, 9]], tiles: [20, 9, 45] },
                { eqs: [[`25% ของ 80 = ${B}`, 20], [`20% ของ 50 = ${B}`, 10], [`75% ของ 40 = ${B}`, 30]], tiles: [20, 10, 30, 25] },
                { eqs: [[`3 : 4 = ${B}%`, 75], [`1 : 5 = ${B}%`, 20], [`30% ของ 200 = ${B}`, 60]], tiles: [75, 20, 60, 50] }
            ]
        }
    };

    // แผนที่ 20 x 11 ช่อง : # พื้น, = แท่นลอย, ^ หนาม, P จุดเริ่ม, D ประตู, a-d ป้ายตัวเลข
    const MAPS = [
        [
            "....................",
            "....................",
            "....................",
            "....................",
            "..............b.....",
            "......a......===....",
            ".....===............",
            "..........===.......",
            ".P......c.......D...",
            "####################",
            "####################"
        ],
        [
            "....................",
            "....................",
            "...a............b...",
            "..===..........===..",
            ".........c..........",
            "......=======.......",
            "....................",
            "...===........===...",
            ".P.......d.........D",
            "#######^^####^^#####",
            "####################"
        ],
        [
            "....................",
            ".a................b.",
            "===..............===",
            "....................",
            "....===......===....",
            ".........c..........",
            "........===.........",
            "....................",
            ".P..==....d...==...D",
            "######^^####^^######",
            "####################"
        ]
    ];

    const ch = new URLSearchParams(location.search).get("ch");
    const SET = SETS[ch] || SETS.ratio;
    const T = 16, COLS = 20, ROWS = 11, W = COLS * T, H = ROWS * T;
    const LINE = "#3b2516";

    const cv = document.getElementById("game");
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const eqBox = document.getElementById("eqs");
    const lvlLabel = document.getElementById("lvl");
    const overlay = document.getElementById("gOverlay");
    const oTitle = document.getElementById("gTitle");
    const oText = document.getElementById("gText");
    const oBtn = document.getElementById("gNext");
    document.getElementById("gName").textContent = SET.name;
    document.getElementById("backBtn").addEventListener("click", () => { location.href = SET.back; });

    const sprite = new Image();
    sprite.src = "./goose.png";

    let level = 0, map, tiles, eqs, door, start, p, keys = { l: false, r: false, j: false }, state = "play", shake = 0, mistakes = 0, tick = 0, jBuf = 0, jHeld = false, coyote = 0;

    function solid(c, r) {
        if (c < 0 || c >= COLS) return true;
        if (r < 0 || r >= ROWS) return false;
        const k = map[r][c];
        return k === "#" || k === "=";
    }

    function load(n) {
        level = n;
        const L = SET.levels[n];
        map = MAPS[n].map(s => s.split(""));
        tiles = [];
        eqs = L.eqs.map(([html, ans]) => ({ html, ans, done: false }));
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const k = map[r][c];
            if (k === "P") { start = { x: c * T + 1, y: r * T - 2 }; map[r][c] = "."; }
            else if (k === "D") { door = { x: c * T - 2, y: r * T - 8, w: 20, h: 24 }; map[r][c] = "."; }
            else if (k >= "a" && k <= "d") { tiles.push({ x: c * T + 1, y: r * T + 1, v: L.tiles[k.charCodeAt(0) - 97], bad: 0, got: false }); map[r][c] = "."; }
        }
        p = { x: start.x, y: start.y, w: 14, h: 18, vx: 0, vy: 0, on: false, dir: 1 };
        state = "play";
        overlay.hidden = true;
        lvlLabel.textContent = `ด่าน ${n + 1} / ${SET.levels.length}`;
        drawEqs();
    }

    function drawEqs() {
        eqBox.innerHTML = "";
        eqs.forEach(e => {
            const d = document.createElement("div");
            d.className = "geq" + (e.done ? " done" : "");
            d.innerHTML = e.done ? e.html.replace('<span class="gblank">?</span>', `<span class="gblank ok">${e.ans}</span>`) + '<span class="gcheck">✓</span>' : e.html;
            eqBox.appendChild(d);
        });
    }

    const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    function respawn() { p.x = start.x; p.y = start.y; p.vx = p.vy = 0; shake = 10; }

    function step() {
        tick++;
        if (state !== "play") return;
        const sp = 2;
        p.vx = (keys.r ? sp : 0) - (keys.l ? sp : 0);
        if (p.vx) p.dir = p.vx > 0 ? 1 : -1;
        if (keys.j && !jHeld) { jBuf = 8; }
        jHeld = keys.j;
        if (jBuf > 0) jBuf--;
        coyote = p.on ? 6 : Math.max(0, coyote - 1);
        if (jBuf > 0 && coyote > 0) { p.vy = -6.4; p.on = false; jBuf = 0; coyote = 0; }
        if (!keys.j && p.vy < -2.5) p.vy = -2.5;      // ปล่อยปุ่มเร็ว = กระโดดเตี้ย
        p.vy = Math.min(p.vy + 0.35, 7);

        // แกน x
        p.x += p.vx;
        let c0 = Math.floor(p.x / T), c1 = Math.floor((p.x + p.w - 1) / T), r0 = Math.floor(p.y / T), r1 = Math.floor((p.y + p.h - 1) / T);
        for (let r = r0; r <= r1; r++) {
            if (p.vx > 0 && solid(c1, r)) p.x = c1 * T - p.w;
            if (p.vx < 0 && solid(c0, r)) p.x = (c0 + 1) * T;
        }
        // แกน y
        p.y += p.vy;
        p.on = false;
        c0 = Math.floor(p.x / T); c1 = Math.floor((p.x + p.w - 1) / T); r0 = Math.floor(p.y / T); r1 = Math.floor((p.y + p.h - 1) / T);
        for (let c = c0; c <= c1; c++) {
            if (p.vy > 0 && solid(c, r1)) { p.y = r1 * T - p.h; p.vy = 0; p.on = true; }
            if (p.vy < 0 && solid(c, r0)) { p.y = (r0 + 1) * T; p.vy = 0; }
        }
        if (p.y > H + 40) respawn();

        // หนาม
        const fr = Math.floor((p.y + p.h - 3) / T);
        for (let c = Math.floor((p.x + 3) / T); c <= Math.floor((p.x + p.w - 4) / T); c++) {
            if (fr >= 0 && fr < ROWS && c >= 0 && c < COLS && map[fr][c] === "^") { respawn(); break; }
        }

        // ป้ายตัวเลข
        tiles.forEach(t => {
            if (t.got) return;
            if (t.bad > 0) { t.bad--; return; }
            if (!hit(p, { x: t.x, y: t.y, w: 14, h: 14 })) return;
            const e = eqs.find(q => !q.done && q.ans === t.v);
            if (e) { e.done = true; t.got = true; drawEqs(); }
            else { t.bad = 50; mistakes++; shake = 8; p.vy = -3.5; p.x -= p.dir * 10; }
        });

        // ประตู
        if (eqs.every(e => e.done) && hit(p, { x: door.x + 6, y: door.y + 6, w: 8, h: 18 })) win();
    }

    function win() {
        state = "win";
        const last = level === SET.levels.length - 1;
        oTitle.textContent = last ? "เก่งมาก !" : "ผ่านด่าน !";
        oText.textContent = last ? "ผ่านครบทุกด่านแล้ว" : `ไปต่อด่าน ${level + 2}`;
        oBtn.textContent = last ? "เล่นอีกครั้ง" : "ด่านถัดไป";
        oBtn.onclick = () => load(last ? 0 : level + 1);
        overlay.hidden = false;
        oBtn.focus();
    }

    // ---------- วาด ----------
    function draw() {
        ctx.save();
        if (shake > 0) { ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3); shake--; }
        // ท้องฟ้าเหลืองลายจุด
        ctx.fillStyle = "#ffdf70"; ctx.fillRect(-4, -4, W + 8, H + 8);
        ctx.fillStyle = "#ffeeaa";
        for (let y = 6; y < H; y += 12) for (let x = 6; x < W; x += 12) ctx.fillRect(x, y, 2, 2);
        // เมฆ
        cloud(40 + (tick * 0.05) % (W + 60) - 60, 22); cloud(220 - (tick * 0.03) % (W + 60), 46);

        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const k = map[r][c], x = c * T, y = r * T;
            if (k === "#" || k === "=") {
                const top = !solid(c, r - 1);
                ctx.fillStyle = k === "=" ? "#f7c6cf" : "#e9a95c"; ctx.fillRect(x, y, T, T);
                if (k === "#") { ctx.fillStyle = "#d48a3e"; ctx.fillRect(x + 3, y + 9, 3, 3); ctx.fillRect(x + 10, y + 5, 3, 3); }
                else { ctx.fillStyle = "#fff"; ctx.fillRect(x + 3, y + 9, 2, 2); ctx.fillRect(x + 10, y + 9, 2, 2); }
                if (top) {
                    ctx.fillStyle = "#01a662"; ctx.fillRect(x, y, T, 6);
                    ctx.fillStyle = "#018c55"; ctx.fillRect(x, y + 5, T, 1); ctx.fillRect(x + 2, y + 6, 3, 2); ctx.fillRect(x + 9, y + 6, 3, 2);
                    ctx.fillStyle = LINE; ctx.fillRect(x, y, T, 1);
                }
                ctx.fillStyle = LINE;
                if (!solid(c - 1, r) && c > 0) ctx.fillRect(x, y, 1, T);
                if (!solid(c + 1, r) && c < COLS - 1) ctx.fillRect(x + T - 1, y, 1, T);
                if (!solid(c, r + 1) && r < ROWS - 1) ctx.fillRect(x, y + T - 1, T, 1);
            } else if (k === "^") {
                ctx.fillStyle = LINE;
                for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8, y + T); ctx.lineTo(x + i * 8 + 4, y + 5); ctx.lineTo(x + i * 8 + 8, y + T); ctx.fill(); }
                ctx.fillStyle = "#f4f1ec";
                for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8 + 1.5, y + T); ctx.lineTo(x + i * 8 + 4, y + 8); ctx.lineTo(x + i * 8 + 6.5, y + T); ctx.fill(); }
            }
        }

        // ประตู
        const open = eqs.every(e => e.done);
        ctx.fillStyle = LINE; rr(door.x, door.y, door.w, door.h, 9); ctx.fill(); ctx.fillRect(door.x, door.y + 12, door.w, door.h - 12);
        ctx.fillStyle = open ? "#bfe4b0" : "#e5432f"; rr(door.x + 2, door.y + 2, door.w - 4, door.h - 2, 7); ctx.fill(); ctx.fillRect(door.x + 2, door.y + 12, door.w - 4, door.h - 12);
        ctx.fillStyle = open ? "#3b2516" : "#fff";
        if (open) ctx.fillRect(door.x + 6, door.y + 7, 8, 17);
        else { ctx.fillRect(door.x + 8, door.y + 11, 4, 4); ctx.fillRect(door.x + 9, door.y + 14, 2, 4); }

        // ป้ายตัวเลข
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 9px sans-serif";
        tiles.forEach((t, i) => {
            if (t.got) return;
            const by = t.y + Math.round(Math.sin((tick + i * 20) / 18) * 1.5);
            ctx.fillStyle = LINE; ctx.fillRect(t.x - 1, by - 1, 16, 16);
            ctx.fillStyle = t.bad > 0 ? "#f4979f" : "#fff"; ctx.fillRect(t.x, by, 14, 14);
            ctx.fillStyle = t.bad > 0 ? "#e5432f" : "#ffe08a"; ctx.fillRect(t.x, by + 11, 14, 3);
            ctx.fillStyle = LINE; ctx.fillText(String(t.v), t.x + 7, by + 6.5);
        });

        // ห่าน
        const bob = p.on && p.vx ? Math.round(Math.sin(tick / 4)) : 0;
        ctx.save();
        ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h - 22 + bob));
        if (p.dir < 0) ctx.scale(-1, 1);
        if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -14, 0);
        else { ctx.fillStyle = "#fff"; ctx.fillRect(-7, 4, 14, 18); }
        ctx.restore();
        ctx.restore();
    }

    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h); ctx.closePath(); }
    function cloud(x, y) {
        x = Math.round(x);
        ctx.fillStyle = LINE; ctx.fillRect(x - 1, y + 3, 30, 8); ctx.fillRect(x + 5, y - 1, 12, 6); ctx.fillRect(x + 14, y + 1, 10, 4);
        ctx.fillStyle = "#fff"; ctx.fillRect(x, y + 4, 28, 6); ctx.fillRect(x + 6, y, 10, 6); ctx.fillRect(x + 15, y + 2, 8, 4);
    }

    // ---------- ควบคุม ----------
    const KEY = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "j", w: "j", W: "j", " ": "j" };
    addEventListener("keydown", e => { const k = KEY[e.key]; if (k && state === "play") { keys[k] = true; if (k === "j" && !e.repeat) jBuf = 8; e.preventDefault(); } });
    addEventListener("keyup", e => { const k = KEY[e.key]; if (k) keys[k] = false; });
    document.querySelectorAll("[data-key]").forEach(b => {
        const k = b.dataset.key;
        const on = e => { e.preventDefault(); keys[k] = true; b.classList.add("down"); };
        const off = e => { e.preventDefault(); keys[k] = false; b.classList.remove("down"); };
        b.addEventListener("pointerdown", on);
        ["pointerup", "pointerleave", "pointercancel"].forEach(n => b.addEventListener(n, off));
        b.addEventListener("contextmenu", e => e.preventDefault());
    });
    document.getElementById("gRestart").addEventListener("click", () => load(level));
    addEventListener("blur", () => { keys.l = keys.r = keys.j = false; });

    // ---------- วนเกม (60 ครั้ง/วินาที) ----------
    let last = performance.now(), acc = 0;
    function loop(now) {
        acc += Math.min(now - last, 100); last = now;
        while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
        draw();
        requestAnimationFrame(loop);
    }
    window.__goose = { get p() { return p; }, get eqs() { return eqs; }, get tiles() { return tiles; }, get door() { return door; }, get state() { return state; }, keys, load };
    load(0);
    requestAnimationFrame(loop);
})();
