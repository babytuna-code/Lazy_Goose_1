// =====================================================
// theme.js — ลูกเล่นที่ใช้ทุกหน้า
//  - ก้อนเมฆลอยผ่านด้านหลังช้า ๆ
//  - แตะ/คลิกพื้นที่ว่าง มีดอกเดซี่กระจาย
//  ปิดเองเมื่อเครื่องตั้ง "ลดการเคลื่อนไหว"
// =====================================================
(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ---------- ก้อนเมฆ ----------
    const cloudSVG =
        '<svg viewBox="0 0 120 64" aria-hidden="true"><path d="M22 56 C8 56 4 42 14 36 C10 22 28 14 38 22 C42 8 66 4 74 18 ' +
        'C84 10 102 16 100 30 C114 30 118 48 106 54 C104 56 102 56 98 56 Z" fill="#fff" stroke="#3b2516" stroke-width="3.5" stroke-linejoin="round"/></svg>';
    const wide = window.innerWidth >= 700;
    const clouds = wide
        ? [{ y: "17%", w: 130, t: 75, d: -12 }, { y: "44%", w: 96, t: 95, d: -60 }, { y: "68%", w: 118, t: 85, d: -32 }]
        : [{ y: "20%", w: 80, t: 60, d: -22 }, { y: "60%", w: 64, t: 75, d: -48 }];
    clouds.forEach(c => {
        const el = document.createElement("div");
        el.className = "lg-cloud";
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = cloudSVG;
        el.style.setProperty("--y", c.y);
        el.style.setProperty("--w", c.w + "px");
        el.style.setProperty("--t", c.t + "s");
        el.style.setProperty("--d", c.d + "s");
        document.body.appendChild(el);
    });

    // ---------- ดอกเดซี่กระจาย ----------
    const SKIP = "button, a, input, select, textarea, label, [role=button], [role=dialog], .tip-overlay, .guide-overlay, .feedback-overlay, .settings-wrap, .calc-panel, .balloon, .ball-option, .tile, .flashcard";
    document.addEventListener("pointerdown", e => {
        if (e.target.closest(SKIP)) return;
        for (let i = 0; i < 6; i++) {
            const d = document.createElement("span");
            d.className = "lg-burst";
            const ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.6;
            const dist = 38 + Math.random() * 34;
            d.style.left = e.clientX + "px";
            d.style.top = e.clientY + "px";
            d.style.setProperty("--dx", Math.cos(ang) * dist + "px");
            d.style.setProperty("--dy", Math.sin(ang) * dist + "px");
            d.style.setProperty("--r", (Math.random() * 240 - 120) + "deg");
            document.body.appendChild(d);
            d.addEventListener("animationend", () => d.remove());
        }
    }, { passive: true });
})();

// นาฬิกากลางของทั้งเว็บ (เก็บเวลาเริ่มไว้ในแท็บนี้): เมฆและห่านเดินคำนวณตำแหน่งจากเวลานี้
// เปลี่ยนหน้า/เปลี่ยนข้อแล้วจึงเคลื่อนต่อจากตำแหน่งเดิม ไม่เริ่มใหม่จากขอบจอ
window.lgElapsed = function () {
    let e = window.__lgEpoch;
    if (!e) {
        try { e = +sessionStorage.getItem("lgEpoch"); if (!e) { e = Date.now(); sessionStorage.setItem("lgEpoch", String(e)); } }
        catch (_) { e = Date.now(); }
        window.__lgEpoch = e;
    }
    return (Date.now() - e) / 1000;
};


/* =====================================================
   กรอบเนื้อหาที่เลื่อนได้: ไล่จางขอบล่างเฉพาะตอนที่ยังมีเนื้อหาให้เลื่อนลงต่อ
   (ถ้าเนื้อหาพอดีจอ หรือเลื่อนถึงล่างสุดแล้ว ขอบล่างของกรอบจะเห็นชัดเต็ม ๆ)
===================================================== */
(function () {
    const els = [...document.querySelectorAll(".lesson-content")];
    if (!els.length) return;
    const upd = el => el.classList.toggle("lg-more", el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    const all = () => els.forEach(upd);
    els.forEach(el => {
        el.addEventListener("scroll", () => upd(el), { passive: true });
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => upd(el));
            ro.observe(el);
            [...el.children].forEach(c => ro.observe(c));
        }
    });
    addEventListener("resize", all);
    addEventListener("load", all);
    all();
})();


/* =====================================================
   การ์ดบทเรียนที่วางคู่กันในแถวเดียว (layout-pairs):
   ให้ส่วนหัวสี (ชมพู/เขียว/เหลือง/ฟ้า) สูงเท่ากันทั้งแถว แม้การ์ดหนึ่งมีปุ่มใต้หัวข้อแต่อีกการ์ดไม่มี
===================================================== */
(function () {
    const box = document.querySelector(".lesson-content.layout-pairs");
    if (!box) return;
    function eq() {
        const heads = [...box.querySelectorAll(":scope > .lesson-sec.card:not(.span-full) > .sec-head")];
        heads.forEach(h => { h.style.minHeight = ""; });
        const rows = {};
        heads.forEach(h => {
            const k = h.closest(".card").offsetTop;
            (rows[k] = rows[k] || []).push(h);
        });
        Object.values(rows).forEach(r => {
            if (r.length < 2) return;
            const m = Math.max(...r.map(h => h.offsetHeight));
            r.forEach(h => { h.style.minHeight = m + "px"; });
        });
    }
    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(eq, 60); };
    eq();
    addEventListener("resize", later);
    addEventListener("load", eq);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(eq);
})();
