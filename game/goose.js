// =====================================================
// goose.js — เกมห่านผจญภัย (แนวเดินกระโดดเก็บตัวเลข)
//  - พาห่านไปเก็บป้ายตัวเลขที่เป็นคำตอบของโจทย์ด้านบนให้ครบ ประตูจะเปิด แล้วเดินเข้าประตู
//  - ป้ายที่ไม่ใช่คำตอบ: ห่านจะเด้งกลับ / หนาม: กลับไปจุดเริ่ม
//  - เล่นได้ทั้งคีย์บอร์ด (← → / A D, กระโดด: ↑ / W / Space) และปุ่มบนจอ
//  ?ch=ratio | prop | percent
// =====================================================
(function () {
    const qch = new URLSearchParams(location.search).get("ch");
    const ch = ["ratio", "prop", "percent"].includes(qch) ? qch : "ratio";
    const F = (a, b) => `<span class="gfrac"><span>${a}</span><span>${b}</span></span>`;
    const B = '<span class="gblank">?</span>';

    // ---------- คลังโจทย์ บทละ 10 ข้อ (ข้อ 1–4 ง่าย ใช้ในด่าน 1) ----------
    // ด่าน 1: สุ่ม 2 ข้อจากข้อง่าย / ด่าน 2–3: สุ่มข้อละ 3 จากข้อที่เหลือ (ไม่ซ้ำกันในรอบเดียว)
    const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const COUNT = [2, 3, 3];
    const BANK = {
        ratio: [
            [`2 : 3 = 4 : ${B}`, 6], [`1 : 5 = ${B} : 15`, 3], [`3 : 4 = 9 : ${B}`, 12], [`10 : 4 = 5 : ${B}`, 2],
            [`5 : 2 = ${B} : 8`, 20], [`4 : 7 = 12 : ${B}`, 21], [`${B} : 12 = 2 : 3`, 8], [`6 : 9 = ${B} : 15`, 10],
            [`18 : 24 = 3 : ${B}`, 4], [`9 : 6 = ${B} : 10`, 15]
        ],
        prop: [
            [`${F(B, 6)} = ${F(2, 3)}`, 4], [`${F(3, 5)} = ${F(9, B)}`, 15], [`${F(B, 20)} = ${F(1, 4)}`, 5], [`${F(2, 7)} = ${F(8, B)}`, 28],
            [`${F(5, 8)} = ${F(B, 16)}`, 10], [`${F(B, 9)} = ${F(4, 3)}`, 12], [`${F(6, B)} = ${F(3, 10)}`, 20], [`${F(7, 2)} = ${F(21, B)}`, 6],
            [`${F(12, 18)} = ${F(B, 3)}`, 2], [`${F(15, B)} = ${F(5, 6)}`, 18]
        ],
        percent: [
            [`50% ของ 40 = ${B}`, 20], [`10% ของ 90 = ${B}`, 9], [`20% ของ 50 = ${B}`, 10], [`25% ของ 60 = ${B}`, 15],
            [`75% ของ 40 = ${B}`, 30], [`3 : 4 = ${B}%`, 75], [`2 : 5 = ${B}%`, 40], [`30% ของ 200 = ${B}`, 60],
            [`5% ของ 160 = ${B}`, 8], [`7 : 20 = ${B}%`, 35]
        ]
    };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let deal = [];
    function newRun() {
        const all = BANK[ch].map((e, i) => i);
        const easy = shuffle(all.slice(0, 4));
        const first = easy.slice(0, 2);
        const rest = shuffle(all.filter(i => !first.includes(i))).slice(0, 6);
        deal = [first, rest.slice(0, 3), rest.slice(3, 6)];
    }

    function makeLevel(lv) {
        if (lv === 0 || !deal.length) newRun();
        const eqs = deal[lv].map(i => BANK[ch][i]);
        const ans = eqs.map(e => e[1]);
        // ป้ายหลอก: ใกล้เคียงคำตอบข้อใดข้อหนึ่ง แต่ไม่ซ้ำคำตอบ
        let decoy;
        do { decoy = pick(ans) + pick([-3, -2, -1, 1, 2, 3, 5, 10]); } while (decoy < 1 || decoy > 99 || ans.includes(decoy));
        const tiles = [...ans, decoy];
        for (let i = tiles.length - 1; i > 0; i--) { const j = R(0, i); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
        return { eqs, tiles };
    }

    const SETS = {
        ratio: { name: "อัตราส่วนที่เท่ากัน", back: "../ratio/ratioans.html" },
        prop: { name: "สัดส่วน", back: "../prop/propans.html" },
        percent: { name: "ร้อยละ", back: "../percent/percentans.html" }
    };
    const NLEVELS = 3;

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

    const SET = SETS[ch];
    const T = 16, COLS = 20, ROWS = 11, W = COLS * T, H = ROWS * T;
    const LINE = "#3b2516";

    const cv = document.getElementById("game");
    const ctx = cv.getContext("2d");
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

    let levels = [];
    function load(n, same) {
        level = n;
        if (!same || !levels[n]) levels[n] = makeLevel(n);
        const L = levels[n];
        map = MAPS[n].map(s => s.split(""));
        tiles = [];
        eqs = L.eqs.map(([html, ans]) => ({ html, ans, done: false }));
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const k = map[r][c];
            if (k === "P") { start = { x: c * T + 1, y: r * T - 2 }; map[r][c] = "."; }
            else if (k === "D") { door = { x: Math.min(c * T - 2, W - 21), y: r * T - 8, w: 20, h: 24 }; map[r][c] = "."; }
            else if (k >= "a" && k <= "d") { tiles.push({ x: c * T + 1, y: r * T + 1, v: L.tiles[k.charCodeAt(0) - 97], bad: 0, got: false }); map[r][c] = "."; }
        }
        p = { x: start.x, y: start.y, w: 14, h: 18, vx: 0, vy: 0, on: false, dir: 1 };
        state = "play";
        overlay.hidden = true;
        lvlLabel.textContent = `ด่าน ${n + 1} / ${NLEVELS}`;
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
        const last = level === NLEVELS - 1;
        oTitle.textContent = last ? "เก่งมาก !" : "ผ่านด่าน !";
        oText.textContent = last ? "ผ่านครบทุกด่านแล้ว" : `ไปต่อด่าน ${level + 2}`;
        oBtn.textContent = last ? "เล่นอีกครั้ง" : "ด่านถัดไป";
        oBtn.onclick = () => load(last ? 0 : level + 1);   // เล่นอีกครั้ง/ด่านถัดไป = สุ่มโจทย์ใหม่
        overlay.hidden = false;
        oBtn.focus();
    }

    // ---------- วาด (เวกเตอร์ คมทุกขนาดจอ) ----------
    // วาดบนผืนผ้าใบที่ละเอียดตามขนาดจอจริง แล้วย่อพิกัดกลับเป็น 320 x 176
    let S = 0, bg = null, bgFor = null;
    function fit() {
        const cssW = cv.clientWidth || W;
        const s = Math.max(2, Math.min(6, Math.ceil(cssW * (window.devicePixelRatio || 1) / W)));
        if (s !== S) { S = s; cv.width = W * S; cv.height = H * S; bg = null; }
    }
    addEventListener("resize", fit);

    const GRASS = "#01a662", GRASS_D = "#018c55", DIRT = "#e9a95c", DIRT_D = "#d48a3e", PINK = "#f7c6cf";
    const isG = (c, r) => r >= 0 && r < ROWS && c >= 0 && c < COLS && map[r][c] === "#";

    function rrect(g, x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
        g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
        g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
    }

    // แถบหญ้าด้านบน ขอบล่างเป็นลอน
    function grass(g, x, y, w) {
        g.fillStyle = GRASS_D;
        g.beginPath(); g.moveTo(x, y);
        g.lineTo(x + w, y); g.lineTo(x + w, y + 5);
        for (let i = x + w; i > x; i -= 4) g.arc(i - 2, y + 5, 2, 0, Math.PI);
        g.closePath(); g.fill();
        g.fillStyle = GRASS;
        g.fillRect(x, y, w, 4.2);
    }

    // พื้นหลัง + พื้นดิน + แท่นลอย + หนาม (ไม่ขยับ วาดครั้งเดียวต่อด่าน)
    function buildBg() {
        bg = document.createElement("canvas");
        bg.width = W * S; bg.height = H * S;
        const g = bg.getContext("2d");
        g.setTransform(S, 0, 0, S, 0, 0);
        g.lineJoin = "round"; g.lineCap = "round";

        g.fillStyle = "#ffdf70"; g.fillRect(0, 0, W, H);
        g.fillStyle = "#ffeeaa";
        for (let y = 6; y < H; y += 12) for (let x = 6; x < W; x += 12) { g.beginPath(); g.arc(x + 1, y + 1, 1.1, 0, Math.PI * 2); g.fill(); }

        // พื้นดิน
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (map[r][c] !== "#") continue;
            const x = c * T, y = r * T;
            g.fillStyle = DIRT; g.fillRect(x, y, T, T);
            g.fillStyle = DIRT_D;
            g.beginPath(); g.arc(x + 4.5, y + 10.5, 1.4, 0, Math.PI * 2); g.arc(x + 11.5, y + 6.5, 1.4, 0, Math.PI * 2); g.fill();
            if (!isG(c, r - 1) && !(r > 0 && map[r - 1][c] === "^")) grass(g, x, y, T);   // ใต้หนามเป็นดินล้วน
        }
        g.strokeStyle = LINE; g.lineWidth = 1.1;
        g.beginPath();
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (map[r][c] !== "#") continue;
            const x = c * T, y = r * T;
            if (!isG(c, r - 1) && !(r > 0 && map[r - 1][c] === "^")) { g.moveTo(x, y + 0.5); g.lineTo(x + T, y + 0.5); }
            if (c > 0 && !isG(c - 1, r)) { g.moveTo(x + 0.5, y); g.lineTo(x + 0.5, y + T); }
            if (c < COLS - 1 && !isG(c + 1, r)) { g.moveTo(x + T - 0.5, y); g.lineTo(x + T - 0.5, y + T); }
        }
        g.stroke();

        // แท่นลอย (ต่อกันเป็นแท่งเดียว มุมมน)
        for (let r = 0; r < ROWS; r++) {
            let c = 0;
            while (c < COLS) {
                if (map[r][c] !== "=") { c++; continue; }
                let e = c; while (e < COLS && map[r][e] === "=") e++;
                const x = c * T + 0.6, y = r * T + 0.6, w = (e - c) * T - 1.2, h = T - 3;
                g.save(); rrect(g, x, y, w, h, 4); g.clip();
                g.fillStyle = PINK; g.fillRect(x, y, w, h);
                g.fillStyle = "#fff";
                for (let k = c * T + 4; k < e * T - 2; k += 6) { g.beginPath(); g.arc(k, y + 9.5, 0.9, 0, Math.PI * 2); g.fill(); }
                grass(g, x, y, w);
                g.restore();
                rrect(g, x, y, w, h, 4); g.strokeStyle = LINE; g.lineWidth = 1.1; g.stroke();
                c = e;
            }
        }

        // หนาม
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (map[r][c] !== "^") continue;
            const x = c * T, y = r * T;
            g.fillStyle = DIRT; g.fillRect(x, y + T - 2, T, 2);
            for (let i = 0; i < 2; i++) {
                const bx = x + i * 8;
                g.beginPath(); g.moveTo(bx + 0.6, y + T); g.lineTo(bx + 4, y + 4); g.lineTo(bx + 7.4, y + T); g.closePath();
                g.fillStyle = "#f4f1ec"; g.fill();
                g.beginPath(); g.moveTo(bx + 4, y + 4); g.lineTo(bx + 7.4, y + T); g.lineTo(bx + 4, y + T); g.closePath();
                g.fillStyle = "#cfc8bd"; g.fill();
                g.beginPath(); g.moveTo(bx + 0.6, y + T); g.lineTo(bx + 4, y + 4); g.lineTo(bx + 7.4, y + T);
                g.strokeStyle = LINE; g.lineWidth = 1; g.stroke();
            }
            g.strokeStyle = LINE; g.lineWidth = 1.1;
            g.beginPath(); g.moveTo(x, y + T - 0.5); g.lineTo(x + T, y + T - 0.5); g.stroke();
        }
        bgFor = map;
    }

    function draw() {
        fit();
        if (!bg || bgFor !== map) buildBg();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        if (shake > 0) { ctx.translate((Math.random() - 0.5) * 3 * S, (Math.random() - 0.5) * 3 * S); shake--; }
        ctx.drawImage(bg, 0, 0);
        ctx.scale(S, S);
        ctx.lineJoin = "round"; ctx.lineCap = "round";

        cloud(40 + (tick * 0.05) % (W + 60) - 60, 22); cloud(220 - (tick * 0.03) % (W + 60), 46);

        // ประตู (โค้งด้านบน)
        const open = eqs.every(e => e.done);
        const dx = door.x, dy = door.y, dw = door.w, dh = door.h;
        const arch = (x, y, w, h) => { ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); };
        arch(dx, dy, dw, dh); ctx.fillStyle = open ? "#7cc46a" : "#e5432f"; ctx.fill();
        ctx.strokeStyle = LINE; ctx.lineWidth = 1.3; ctx.stroke();
        if (open) {
            arch(dx + 3.5, dy + 3.5, dw - 7, dh - 3.5); ctx.fillStyle = "#3b2516"; ctx.fill();
        } else {
            arch(dx + 3.5, dy + 3.5, dw - 7, dh - 3.5); ctx.strokeStyle = "rgba(59,37,22,0.45)"; ctx.lineWidth = 0.9; ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(dx + dw / 2, dy + 12.5, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(dx + dw / 2 - 1, dy + 13); ctx.lineTo(dx + dw / 2 + 1, dy + 13); ctx.lineTo(dx + dw / 2 + 1.6, dy + 17.5); ctx.lineTo(dx + dw / 2 - 1.6, dy + 17.5); ctx.closePath(); ctx.fill();
        }

        // ป้ายตัวเลข
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        tiles.forEach((t, i) => {
            if (t.got) return;
            const by = t.y + Math.sin((tick + i * 20) / 18) * 1.5;
            ctx.save();
            rrect(ctx, t.x - 0.5, by - 0.5, 15, 15, 3); ctx.clip();
            ctx.fillStyle = t.bad > 0 ? "#f4979f" : "#fff"; ctx.fillRect(t.x - 1, by - 1, 16, 16);
            ctx.fillStyle = t.bad > 0 ? "#e5432f" : "#ffe08a"; ctx.fillRect(t.x - 1, by + 11, 16, 4);
            ctx.restore();
            rrect(ctx, t.x - 0.5, by - 0.5, 15, 15, 3); ctx.strokeStyle = LINE; ctx.lineWidth = 1.1; ctx.stroke();
            const txt = String(t.v);
            ctx.font = `bold ${txt.length > 2 ? 7 : 9}px sans-serif`;
            ctx.fillStyle = LINE; ctx.fillText(txt, t.x + 7, by + 6);
        });

        // ห่าน (ภาพพิกเซลเดิม)
        const bob = p.on && p.vx ? Math.round(Math.sin(tick / 4)) : 0;
        ctx.save();
        ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h - 22 + bob));
        if (p.dir < 0) ctx.scale(-1, 1);
        if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -14, 0);
        else { ctx.fillStyle = "#fff"; ctx.fillRect(-7, 4, 14, 18); }
        ctx.restore();
    }

    function cloud(x, y) {
        const puffs = [[6, 7, 5], [13, 4, 6.5], [21, 7, 5]];
        ctx.beginPath(); ctx.moveTo(x + 1, y + 11); ctx.lineTo(x + 27, y + 11);
        ctx.fillStyle = LINE;
        puffs.forEach(([cx, cy, r]) => { ctx.beginPath(); ctx.arc(x + cx, y + cy, r + 1, 0, Math.PI * 2); ctx.fill(); });
        rrect(ctx, x, y + 6, 28, 6.5, 3.2); ctx.fill();
        ctx.fillStyle = "#fff";
        puffs.forEach(([cx, cy, r]) => { ctx.beginPath(); ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2); ctx.fill(); });
        rrect(ctx, x + 1, y + 7, 26, 4.5, 2.2); ctx.fill();
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
    document.getElementById("gRestart").addEventListener("click", () => load(level, true));   // เริ่มด่านใหม่ = โจทย์เดิม
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
