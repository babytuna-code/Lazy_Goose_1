// fastnav.js — ให้เปลี่ยนหน้าลื่น ไม่ต้องรอโหลด
// ลงทะเบียน service worker (sw.js ที่โฟลเดอร์หลักของเว็บ) ซึ่งเก็บไฟล์ทุกหน้าไว้ในเครื่อง
// เปิดเว็บครั้งแรกจะโหลดเก็บไว้เบื้องหลัง ครั้งต่อไปทุกหน้ามาจากเครื่องทันที
(function () {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    const me = document.currentScript && document.currentScript.src;
    if (!me) return;
    const root = new URL("../", me);                 // fastnav.js อยู่ใน common/ → โฟลเดอร์หลัก
    const go = () => navigator.serviceWorker.register(new URL("sw.js", root).href, { scope: root.pathname }).catch(() => {});
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
})();
