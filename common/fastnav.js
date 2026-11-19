// fastnav.js — ให้เปลี่ยนหน้าเร็วขึ้น (ฉบับนำเสนอ)
// โหลดหน้าที่น่าจะกดไปต่อไว้ล่วงหน้าตอนเครื่องว่าง
//  - Chrome / Edge / Android: ใช้ Speculation Rules (prerender หน้าเนื้อหา/เมนู, prefetch หน้าอื่น)
//  - Safari / iPhone และอื่น ๆ: ดึงไฟล์หน้าเก็บไว้ในแคชของเบราว์เซอร์
// หน้าเกม/คะแนน/แบบทดสอบ ไม่ prerender (กันสคริปต์ในหน้าเหล่านั้นทำงานก่อนผู้ใช้กดจริง)
(function () {
    const here = location.pathname;
    const urls = new Set();
    const add = u => {
        if (!u || /^(javascript|mailto|tel):|^#/.test(u)) return;
        try {
            const x = new URL(u, location.href);
            x.hash = "";
            if (x.origin === location.origin && x.pathname !== here && /\.html$/.test(x.pathname)) urls.add(x.href);
        } catch (e) { /* ข้าม */ }
    };
    const b = document.body;
    add(b.dataset.next); add(b.dataset.prev);
    document.querySelectorAll("a[href]").forEach(a => add(a.getAttribute("href")));
    document.querySelectorAll("[onclick]").forEach(el => {
        const m = String(el.getAttribute("onclick")).match(/href\s*=\s*['"]([^'"]+)['"]/);
        if (m) add(m[1]);
    });
    document.querySelectorAll("[data-start-quiz]").forEach(el => add(el.dataset.startQuiz));

    // หน้าที่ปุ่มพาไปด้วยสคริปต์ (ไม่มีลิงก์ในหน้า)
    const MAP = {
        "index.html": ["menu/menu.html"],
        "menu.html": ["../ratio/ratioans.html", "../prop/propans.html", "../percent/percentans.html", "../test/test.html"],
        "ratioans.html": ["../menu/menu.html"], "propans.html": ["../menu/menu.html"], "percentans.html": ["../menu/menu.html"]
    };
    const file = here.split("/").pop() || "index.html";
    (MAP[file] || []).forEach(add);
    // เกมท้ายบท: ด่านถัดไป
    const pm = file.match(/^(ratio|prop|percent)play(\d)\.html$/);
    if (pm) add(+pm[2] < 5 ? `./${pm[1]}play${+pm[2] + 1}.html` : `./${pm[1]}score.html`);

    const list = [...urls].slice(0, 12);
    if (!list.length) return;
    const SAFE = /\/(index|menu|test|(ratio|prop|percent)(ans|basic|equal|multi|direct|inverse|convert))\.html$/;
    const pre = [];   // prerender ปิดไว้ (ใช้แค่ prefetch เพื่อความเสถียร)
    const fetchOnly = list.filter(u => !pre.includes(u));

    const run = () => {
        if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
            const s = document.createElement("script");
            s.type = "speculationrules";
            s.textContent = JSON.stringify({
                prerender: pre.length ? [{ source: "list", urls: pre, eagerness: "immediate" }] : [],
                prefetch: fetchOnly.length ? [{ source: "list", urls: fetchOnly, eagerness: "immediate" }] : []
            });
            document.head.appendChild(s);
        } else {
            list.forEach((u, i) => setTimeout(() => { fetch(u, { credentials: "same-origin" }).catch(() => {}); }, i * 150));
        }
    };
    if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 600);
})();
