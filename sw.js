// sw.js — เก็บไฟล์ทั้งเว็บไว้ในเครื่อง (สร้างอัตโนมัติ อย่าแก้ด้วยมือ)
// เปิดเว็บครั้งแรก: โหลดไฟล์ทุกหน้าเก็บไว้เบื้องหลัง → ครั้งต่อไปเปลี่ยนหน้าได้ทันทีโดยไม่ต้องรอเน็ต
// อัปเดตเว็บ (เลขเวอร์ชันเปลี่ยน): เบราว์เซอร์โหลดชุดใหม่เก็บไว้ แล้วลบชุดเก่าทิ้งเอง
const VERSION = "20261120l";
const CACHE = "lazy-goose-" + VERSION;
const FILES = ["_headers", "common/basket.css", "common/calculator.css", "common/calculator.js", "common/chapter-solutions.js", "common/chapteranswer.js", "common/chapterscore.css", "common/chapterscore.js", "common/daisy.css", "common/fastnav.js", "common/fontload.js", "common/fonts.css", "common/gamebuttons.css", "common/gamebuttons.js", "common/lesson.css", "common/lesson.js", "common/pageready.js", "common/practice.js", "common/progress.css", "common/progress.js", "common/scroll.css", "common/scroll.js", "common/settings.css", "common/settings.js", "common/solution.css", "common/stage.js", "common/theme.css", "common/theme.js", "common/wave.css", "common/wave.js", "common/waves.css", "game/goose.css", "game/goose.html", "game/goose.js", "game/goose.png", "index.css", "index.html", "index.js", "menu/menu.css", "menu/menu.html", "menu/menu.js", "percent/percent.css", "percent/percent.html", "percent/percent.js", "percent/percentans.css", "percent/percentans.html", "percent/percentanswer.html", "percent/percentbasic.css", "percent/percentbasic.html", "percent/percentconvert.css", "percent/percentconvert.html", "percent/percentplay.js", "percent/percentplay1.css", "percent/percentplay1.html", "percent/percentplay1.js", "percent/percentplay2.html", "percent/percentplay2.js", "percent/percentplay3.html", "percent/percentplay3.js", "percent/percentplay4.html", "percent/percentplay4.js", "percent/percentplay5.html", "percent/percentplay5.js", "percent/percentscore.css", "percent/percentscore.html", "percent/percentscore.js", "pics/goose-walk.gif", "pics/goose.gif", "pics/goose.svg", "pics/la-castle.svg", "pics/la-cloud-white.svg", "pics/la-grass.svg", "pics/la-sky.svg", "pics/la-tree.svg", "pics/ladybug.svg", "pics/px-t-101.png", "pics/px-t-111.png", "pics/px-t-115.png", "pics/px-t-121.png", "pics/px-t-122.png", "pics/px-t-71.png", "pics/px-t-76.png", "pics/px-t-97.png", "prop/prop.css", "prop/prop.html", "prop/prop.js", "prop/propans.css", "prop/propans.html", "prop/propanswer.html", "prop/propdirect.css", "prop/propdirect.html", "prop/propinverse.css", "prop/propinverse.html", "prop/proplesson.css", "prop/propplay.js", "prop/propplay1.css", "prop/propplay1.html", "prop/propplay1.js", "prop/propplay2.html", "prop/propplay2.js", "prop/propplay3.html", "prop/propplay3.js", "prop/propplay4.html", "prop/propplay4.js", "prop/propplay5.html", "prop/propplay5.js", "prop/propscore.css", "prop/propscore.html", "prop/propscore.js", "ratio/ratio.css", "ratio/ratio.html", "ratio/ratio.js", "ratio/ratioans.css", "ratio/ratioans.html", "ratio/ratioans.js", "ratio/ratioanswer.html", "ratio/ratiobasic.css", "ratio/ratiobasic.html", "ratio/ratioch1-8.js", "ratio/ratioequal.css", "ratio/ratioequal.html", "ratio/ratiomulti.css", "ratio/ratiomulti.html", "ratio/ratioplay.js", "ratio/ratioplay1.css", "ratio/ratioplay1.html", "ratio/ratioplay1.js", "ratio/ratioplay2.css", "ratio/ratioplay2.html", "ratio/ratioplay2.js", "ratio/ratioplay3.css", "ratio/ratioplay3.html", "ratio/ratioplay3.js", "ratio/ratioplay4.css", "ratio/ratioplay4.html", "ratio/ratioplay4.js", "ratio/ratioplay5.css", "ratio/ratioplay5.html", "ratio/ratioplay5.js", "ratio/ratioscore.css", "ratio/ratioscore.html", "ratio/ratioscore.js", "test/answer-key.js", "test/question-sets.js", "test/quiz-render.js", "test/quiz.css", "test/quiz.js", "test/quiz1.html", "test/quiz10.html", "test/quiz2.html", "test/quiz3.html", "test/quiz4.html", "test/quiz5.html", "test/quiz6.html", "test/quiz7.html", "test/quiz8.html", "test/quiz9.html", "test/quizprogress.js", "test/score-config.js", "test/scorebook.js", "test/student.css", "test/student.html", "test/student.js", "test/test.css", "test/test.html", "test/test.js", "test/testanswer.css", "test/testanswer.html", "test/testanswer.js", "test/testscore.css", "test/testscore.html", "test/testscore.js"];

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        // ทีละไฟล์: ไฟล์ไหนโหลดไม่ได้ก็ข้าม ไม่ให้ทั้งชุดล้ม
        await Promise.all(FILES.map(f => cache.add(new Request(f, { cache: "reload" })).catch(() => {})));
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith("lazy-goose-") && k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;           // Google Sheet ฯลฯ ไม่ยุ่ง
    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        let key = req;
        if (url.pathname.endsWith("/")) key = new Request(url.pathname + "index.html");
        const hit = await cache.match(key, { ignoreSearch: true });
        if (hit) return hit;
        try {
            const res = await fetch(req);
            if (res.ok && res.type === "basic") cache.put(key, res.clone()).catch(() => {});
            return res;
        } catch (e) {
            return (await cache.match(key, { ignoreSearch: true })) || Response.error();
        }
    })());
});
