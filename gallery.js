/* =============================================================
 * gallery.js — 鉴赏模式：CG 图鉴、放大 200% 细节欣赏、
 *              拖动查看、点击不同部位触发不同反应
 * -------------------------------------------------------------
 * 改 CG 图 / 部位锚点 / 触碰台词  → 本文件的 galleryCGs、touchParts
 * 改舞台样式（边框/气泡/粒子）    → index.html 的 CSS
 * 调试：?parts=1 会显示出部位锚点，方便微调坐标
 * ============================================================= */
/* =========================================
   14. 鉴赏模式
========================================= */

/* 部位锚点坐标为「相对图片自身的百分比」（左上 0,0 → 右下 100,100）
   取值来源：对 CG 做肤色检测得到的脸/手位置 */
const galleryCGs = [
    {
        src: PORTRAIT,
        title: "zjk · 走廊",
        note: "周一早晨，他说「对我来说挺早的」",
        expr: "imagines/zjk_smile.png",       /* 触碰时的临时表情层 */
        box: { x0: 30, y0: 7, x1: 83, y1: 100 },   /* 人物在图中的包围盒（%） */
        parts: {
            head:  { x: 55, y: 8 },
            face:  { x: 55, y: 17 },
            chest: { x: 55, y: 31 },
            handL: { x: 36, y: 47 },
            handR: { x: 75, y: 47 },
            leg:   { x: 52, y: 78 }
        }
    },
    {
        src: "imagines/zjk222_nobg.png",   /* 已抠图去背景 */
        title: "zjk · 食堂偶遇",
        note: "好感度达到 26 解锁",
        needAffection: 26,
        box: { x0: 0, y0: 9, x1: 100, y1: 96 },
        parts: {
            head:  { x: 48, y: 18 },
            face:  { x: 48, y: 26 },
            chest: { x: 48, y: 42 },
            handL: { x: 30, y: 54 },
            handR: { x: 68, y: 52 },
            leg:   { x: 50, y: 76 }
        }
    },
    {
        src: "imagines/zjk333.png",
        title: "zjk · 刚好看见你",
        note: "达成 TRUE END 解锁",
        needEnding: "TRUE END",
        box: { x0: 16, y0: 5, x1: 81, y1: 100 },
        parts: {
            head:  { x: 49, y: 9 },
            face:  { x: 49, y: 18 },
            chest: { x: 49, y: 32 },
            handL: { x: 25, y: 52 },
            handR: { x: 71, y: 53 },
            leg:   { x: 51, y: 77 }
        }
    }
];

/* 各部位的称呼、台词、音效音高、粒子符号、整体反馈动作 */
const touchParts = {
    head: {
        label: "摸了摸头",
        tone: 660,
        marks: ["♥", "✦", "♡"],
        react: "react-shake",
        expr: true,
        lines: [
            "……别揉啦，头发会乱的。",
            "唔……又摸我的头。",
            "（他微微低下头，任你揉乱他的头发）",
            "这么喜欢摸头吗，你。"
        ]
    },
    face: {
        label: "戳了戳脸",
        tone: 740,
        marks: ["♥", "♡", "✧"],
        react: "react-shake",
        expr: true,
        lines: [
            "……干嘛一直盯着我看。",
            "喂，脸红的人明明是你吧。",
            "别、别碰脸……会痒的。",
            "（他偏过头，耳尖一点点红）"
        ]
    },
    chest: {
        label: "靠在胸口",
        tone: 520,
        marks: ["♥", "♡", "♥"],
        react: "react-hug",
        expr: false,
        lines: [
            "心跳……好像真的变快了。",
            "校服会被你弄皱的。",
            "（他轻轻按住你的手，没有推开）",
            "这里啊……不能随便碰哦。"
        ]
    },
    hand: {
        label: "牵住手",
        tone: 830,
        marks: ["♡", "✧", "♡"],
        react: "react-hug",
        expr: false,
        lines: [
            "手……牵着也不行吗？",
            "你的手，比我的暖。",
            "（他悄悄回握住你的指尖）",
            "这样……会不会靠太近了。"
        ]
    },
    leg: {
        label: "蹲下看腿",
        tone: 430,
        marks: ["✦", "✧"],
        react: "react-jump",
        expr: false,
        lines: [
            "哎，蹲下的话就看不见你啦。",
            "腿长是天生的，没办法。",
            "（他往后退了半步）",
            "你在看哪里啊……"
        ]
    }
};

const GALLERY_ZOOM = 2;   /* 放大 200% */

let galleryIndex = 0;
let gZoom = GALLERY_ZOOM;
let gTx = 0, gTy = 0;                 /* 平移量（stage 像素） */
let gView = { fw: 0, fh: 0, fx: 0, fy: 0 };   /* 图片在舞台内的实际渲染矩形 */
let gFit = false;                            /* true = 完整视图（1x），false = 200% 细节视图 */
let hitCanvas = null, hitCtx = null;
let noteTimer = null;
let bubbleTimer = null;
let bubbleW = 170, bubbleH = 40;      /* 气泡尺寸缓存，避免拖动时反复 reflow */

function isCGUnlocked(cg) {
    if (cg.needAffection === undefined && cg.needEnding === undefined) return true;

    const meta = loadMeta();

    if (cg.needAffection !== undefined && meta.maxAffection < cg.needAffection) return false;
    if (cg.needEnding !== undefined && meta.endings.indexOf(cg.needEnding) === -1) return false;

    return true;
}

function openGallery() {
    setGameLayerVisible(false);
    hideEnding();
    showLayer("gallery-screen");
    galleryIndex = 0;
    renderGallery();
}

function renderGallery() {
    const cg = galleryCGs[galleryIndex];
    const unlocked = isCGUnlocked(cg);
    const img = $("gallery-img");

    hideBubble();
    clearTouchFx();
    clearTimeout(noteTimer);

    /* 注意顺序：先挂 onload，再赋 src，避免缓存命中时错过加载事件 */
    img.onload = null;
    if (unlocked) {
        img.onerror = () => { img.src = PORTRAIT; };
        img.onload = prepare;
        img.src = cg.src;
        if (img.complete && img.naturalWidth) prepare();
        /* 兜底：极少数情况下图片已在解码中但尚未就绪 */
        setTimeout(() => { if (!gView.fw && img.naturalWidth) prepare(); }, 80);
    } else {
        img.removeAttribute("src");
        prepare();   /* 未解锁：清空视角，避免出现上一张的残留缩放 */
    }

    function prepare() { setupImageView(unlocked); }

    $("gallery-caption").innerText = unlocked ? cg.title : "？？？　未解锁";
    $("gallery-note").innerText = unlocked
        ? cg.note
        : cg.note + "（进度不足）";
    $("gallery-counter").innerText = `${galleryIndex + 1} / ${galleryCGs.length}`;

    $("gallery-prev").disabled = galleryIndex === 0;
    $("gallery-next").disabled = galleryIndex === galleryCGs.length - 1;
    $("gallery-prev").style.opacity = galleryIndex === 0 ? ".35" : "1";
    $("gallery-next").style.opacity = galleryIndex === galleryCGs.length - 1 ? ".35" : "1";
}

/* ---------- 布局：让 #gallery-figure 与图片实际渲染矩形重合 ---------- */
function setupImageView(unlocked) {
    const stage = $("gallery-stage");
    const fig = $("gallery-figure");
    const img = $("gallery-img");

    buildPartDots();

    gView = { fw: 0, fh: 0, fx: 0, fy: 0 };
    if (!unlocked || !img.naturalWidth) {
        fig.style.transform = "none";
        return;
    }

    const sw = stage.clientWidth, sh = stage.clientHeight;
    const nw = img.naturalWidth, nh = img.naturalHeight;
    const s = Math.min(sw / nw, sh / nh);
    const fw = nw * s, fh = nh * s;

    gView = { fw: fw, fh: fh, fx: (sw - fw) / 2, fy: (sh - fh) / 2 };
    fig.style.left = gView.fx + "px";
    fig.style.top = gView.fy + "px";
    fig.style.width = fw + "px";
    fig.style.height = fh + "px";

    prepareHitTest(img);
    resetGalleryView();
}

/* 把当前 CG 的初始视野对准头胸之间（放大后默认看得见脸） */
function centerOnPart(ax, ay, anim) {
    const stage = $("gallery-stage");
    const sh = stage.clientHeight, sw = stage.clientWidth;
    gZoom = GALLERY_ZOOM;
    gTx = sw / 2 - gView.fx - gView.fw / 2 - gZoom * (ax / 100 * gView.fw - gView.fw / 2);
    gTy = sh / 2 - gView.fy - gView.fh / 2 - gZoom * (ay / 100 * gView.fh - gView.fh / 2);
    applyTransform(anim !== false);
}

function applyTransform(anim) {
    const fig = $("gallery-figure");
    const stage = $("gallery-stage");
    const maxX = Math.max(0, (gView.fw * gZoom - stage.clientWidth) / 2);
    const maxY = Math.max(0, (gView.fh * gZoom - stage.clientHeight) / 2);
    gTx = Math.min(maxX, Math.max(-maxX, gTx));
    gTy = Math.min(maxY, Math.max(-maxY, gTy));
    const tf = `translate(${gTx}px, ${gTy}px) scale(${gZoom})`;
    fig.classList.toggle("no-anim", !anim);
    fig.style.transform = tf;
    fig.style.setProperty("--fig-tf", tf);

    /* 气泡贴在人物右上角：跟随缩放/拖动重新贴合（用缓存尺寸，不触发 reflow） */
    const bubble = $("gallery-bubble");
    if (bubble && bubble.classList.contains("show")) {
        placeBubble(galleryCGs[galleryIndex]);
    }
}

function setFitMode(fit) {
    gFit = fit;
    const btn = $("gallery-fit");
    if (btn) btn.classList.toggle("active", gFit);
    const hint = $("gallery-hint");
    if (hint) {
        hint.innerText = gFit
            ? "完整视图 · 点 ⤢ 回到 200%"
            : "拖动查看 · 点点他有反应";
    }
}

/* ⤢ 完整视图 ⇄ 200% 细节视图 */
function toggleGalleryFit() {
    if (!gView.fw) return;
    setFitMode(!gFit);
    applyFitZoom(true);
}

function applyFitZoom(anim) {
    if (!gView.fw) return;
    if (gFit) {
        gZoom = 1;
        gTx = 0; gTy = 0;
        applyTransform(anim);
    } else {
        resetGalleryView(anim);
    }
}

function resetGalleryView(anim) {
    if (!gView.fw) return;
    if (gFit) {
        gZoom = 1;
        gTx = 0; gTy = 0;
        applyTransform(anim);
        return;
    }
    const cg = galleryCGs[galleryIndex];
    const anchor = (cg.parts && cg.parts.face) ? cg.parts.face : { x: 50, y: 25 };
    centerOnPart(anchor.x, anchor.y, anim !== false);
}

/* ---------- 透明检测：点到透明背景不算触碰 ---------- */
/* 注：以 file:// 直接打开时浏览器会把画布视为跨域（getImageData 抛错），
   此时自动降级为「不做透明判定」，仅靠距离判断部位，功能不受影响 */
let hitEnabled = false;

function prepareHitTest(img) {
    hitEnabled = false;
    hitCtx = null;
    hitCanvas = document.createElement("canvas");
    hitCanvas.width = img.naturalWidth;
    hitCanvas.height = img.naturalHeight;
    hitCtx = hitCanvas.getContext("2d");
    hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height);
    hitCtx.drawImage(img, 0, 0);
    try {
        hitCtx.getImageData(0, 0, 1, 1);
        hitEnabled = true;
    } catch (e) {
        hitCtx = null;   /* 画布被跨域保护：透明检测不可用 */
    }
}

function hitSolid(ax, ay) {
    if (!hitCtx) return true;
    const x = Math.max(0, Math.min(hitCanvas.width - 1, Math.round(ax / 100 * hitCanvas.width)));
    const y = Math.max(0, Math.min(hitCanvas.height - 1, Math.round(ay / 100 * hitCanvas.height)));
    const r = Math.max(2, Math.round(hitCanvas.width * 0.018));   /* 轮廓边缘容错 */
    const x0 = Math.max(0, x - r), y0 = Math.max(0, y - r);
    const w0 = Math.min(hitCanvas.width - x0, r * 2 + 1);
    const h0 = Math.min(hitCanvas.height - y0, r * 2 + 1);
    const data = hitCtx.getImageData(x0, y0, w0, h0).data;
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 30) return true;
    }
    return false;
}

/* ---------- 舞台坐标 ↔ 图片百分比 ---------- */
function partToStage(ax, ay) {
    return {
        x: gView.fx + gView.fw / 2 + gZoom * (ax / 100 * gView.fw - gView.fw / 2) + gTx,
        y: gView.fy + gView.fh / 2 + gZoom * (ay / 100 * gView.fh - gView.fh / 2) + gTy
    };
}

function stageToPart(sx, sy) {
    if (!gView.fw) return null;
    return {
        x: (((sx - gView.fx - gView.fw / 2 - gTx) / gZoom + gView.fw / 2) / gView.fw) * 100,
        y: (((sy - gView.fy - gView.fh / 2 - gTy) / gZoom + gView.fh / 2) / gView.fh) * 100
    };
}

/* ---------- 点击 → 找最近部位 ---------- */
function inFigureBox(cg, p) {
    const b = cg.box;
    if (!b) return true;
    const pad = 3;   /* 轮廓容错 */
    return p.x >= b.x0 - pad && p.x <= b.x1 + pad && p.y >= b.y0 - pad && p.y <= b.y1 + pad;
}

function nearestPart(p) {
    const cg = galleryCGs[galleryIndex];
    if (!cg.parts) return null;
    if (!inFigureBox(cg, p)) return null;

    let best = null, bestD = 1e9;
    for (const raw in cg.parts) {
        const a = cg.parts[raw];
        /* 按图片实际像素比例折算距离（宽高不等，统一到像素量纲） */
        const dx = (a.x - p.x) / 100 * gView.fw;
        const dy = (a.y - p.y) / 100 * gView.fh;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = raw; }
    }
    /* 距离太远（点到人物外缘以外）就不算碰到他 */
    const limit = Math.min(gView.fw, gView.fh) * 0.5;
    return bestD <= limit ? best : null;
}

function touchGallleryPart(part, sx, sy) {
    const key = (part === "handL" || part === "handR") ? "hand" : part;
    const conf = touchParts[key];
    if (!conf) return;

    const cg = galleryCGs[galleryIndex];
    const anchor = cg.parts[part];
    const pos = partToStage(anchor.x, anchor.y);

    /* 台词气泡：固定在人物右上角（不跟随点击点） */
    const bubble = $("gallery-bubble");
    bubble.innerText = conf.lines[Math.floor(Math.random() * conf.lines.length)];
    bubble.classList.add("show");
    measureBubble(bubble);
    placeBubble(cg);
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, 2800);

    /* 粒子 */
    spawnParticles(pos.x, pos.y, conf.marks);

    /* 整体反馈 */
    const stage = $("gallery-stage");
    stage.classList.remove("react-shake", "react-jump", "react-hug");
    void stage.offsetWidth;
    stage.classList.add(conf.react);
    setTimeout(() => stage.classList.remove(conf.react), 650);

    /* 临时笑脸 */
    const expr = $("gallery-expr");
    if (conf.expr && cg.expr) {
        expr.src = cg.expr;
        expr.classList.add("show");
        setTimeout(() => expr.classList.remove("show"), 1600);
    } else {
        expr.classList.remove("show");
    }

    blip(conf.tone);

    /* 上手后提示自动淡出 */
    const hint = $("gallery-hint");
    if (hint) hint.style.opacity = "0";

    /* 底部说明同步提示 */
    clearTimeout(noteTimer);
    $("gallery-note").innerText = `刚刚：${conf.label} · ♥`;
    noteTimer = setTimeout(() => {
        $("gallery-note").innerText = cg.note;
    }, 2600);
}

function handleStageTap(sx, sy) {
    const img = $("gallery-img");
    if (!img || !img.naturalWidth) return;
    const p = stageToPart(sx, sy);
    if (!p) return;
    try {
        if (!hitSolid(p.x, p.y)) return;
    } catch (e) { /* 画布不可读时忽略透明判定 */ }
    const part = nearestPart(p);
    if (!part) return;
    touchGallleryPart(part, sx, sy);
}

/* 量一次气泡尺寸（内容变化后调用），拖动/缩放时复用缓存避免 reflow */
function measureBubble(bubble) {
    const el = bubble || $("gallery-bubble");
    if (!el) return;
    bubbleW = el.offsetWidth || bubbleW;
    bubbleH = el.offsetHeight || bubbleH;
}

/* 气泡固定贴在「人物右上角」：随缩放/拖动保持贴合，并向舞台内收敛不越界
   left = 气泡左边缘，top = 气泡底边（CSS 用 translate(0,-100%) 上提自身高度） */
function placeBubble(cg) {
    const bubble = $("gallery-bubble");
    const stage = $("gallery-stage");
    if (!bubble || !stage || !gView.fw) return;

    const b = (cg && cg.box) || { x0: 20, y0: 5, x1: 80, y1: 100 };
    const corner = partToStage(b.x1, b.y0);          /* 人物包围盒的右上角（含缩放/平移） */

    const pad = 8;
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const gap = 8;

    /* 水平：优先贴在人物右上角外侧；右侧空间不足就贴舞台右边缘
       （用 right 定位，右边缘固定，台词长短变化时不会左右漂移） */
    if (corner.x + gap + bubbleW + pad > sw) {
        bubble.style.left = "auto";
        bubble.style.right = pad + "px";
    } else {
        bubble.style.right = "auto";
        bubble.style.left = (corner.x + gap) + "px";
    }

    /* 垂直：气泡底边贴住人物头顶上方；头顶离舞台顶太近就贴舞台顶部（顶边固定） */
    let bottom = corner.y - 4;
    if (bottom - bubbleH < pad) bottom = bubbleH + pad;
    if (bottom > sh - pad) bottom = sh - pad;

    bubble.style.top = bottom + "px";
}

function hideBubble() {
    clearTimeout(bubbleTimer);
    const b = $("gallery-bubble");
    if (b) b.classList.remove("show");
}

function spawnParticles(x, y, marks) {
    const stage = $("gallery-stage");
    marks.forEach((m, i) => {
        const el = document.createElement("span");
        el.className = "gx-particle";
        el.innerText = m;
        el.style.left = (x + (i - (marks.length - 1) / 2) * 22) + "px";
        el.style.top = (y - 10) + "px";
        el.style.animationDelay = (i * 0.09) + "s";
        stage.appendChild(el);
        setTimeout(() => el.remove(), 1400);
    });
}

function clearTouchFx() {
    const stage = $("gallery-stage");
    if (!stage) return;
    stage.querySelectorAll(".gx-particle").forEach(el => el.remove());
    const expr = $("gallery-expr");
    if (expr) expr.classList.remove("show");
}

/* 调试用小圆点 */
function buildPartDots() {
    const fig = $("gallery-figure");
    fig.querySelectorAll(".part-dot").forEach(el => el.remove());
    const cg = galleryCGs[galleryIndex];
    if (!cg.parts) return;
    for (const k in cg.parts) {
        const a = cg.parts[k];
        const d = document.createElement("div");
        d.className = "part-dot";
        d.title = k;
        d.style.left = a.x + "%";
        d.style.top = a.y + "%";
        fig.appendChild(d);
    }
}

/* 极轻的一声“叮”（WebAudio 合成，无需音频素材） */
function blip(freq) {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = window._gxAudio || (window._gxAudio = new AC());
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
    } catch (e) { /* 忽略音频异常 */ }
}

function prevImage() {
    if (galleryIndex > 0) {
        galleryIndex--;
        renderGallery();
    }
}

function nextImage() {
    if (galleryIndex < galleryCGs.length - 1) {
        galleryIndex++;
        renderGallery();
    }
}

/* ---------- 拖动查看 + 点击判定 ---------- */
(function bindStageControls() {
    const stage = document.getElementById("gallery-stage");
    if (!stage) return;

    let dragging = false, moved = false;
    let startX = 0, startY = 0, baseX = 0, baseY = 0;

    stage.addEventListener("pointerdown", e => {
        if (!gView.fw) return;
        dragging = true; moved = false;
        startX = e.clientX; startY = e.clientY;
        baseX = gTx; baseY = gTy;
        stage.classList.add("dragging");
        try { stage.setPointerCapture && stage.setPointerCapture(e.pointerId); } catch (err) { }
        hideBubble();
    });

    stage.addEventListener("pointermove", e => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
        gTx = baseX + dx;
        gTy = baseY + dy;
        applyTransform(false);
    });

    const endDrag = e => {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove("dragging");
        if (!moved) {
            const r = stage.getBoundingClientRect();
            handleStageTap(e.clientX - r.left, e.clientY - r.top);
        }
    };

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", () => { dragging = false; stage.classList.remove("dragging"); });

    /* 滚轮微调缩放（1x ~ 3x） */
    /* 滚轮只用于微调，进入微调就意味着离开完整视图 */
    stage.addEventListener("wheel", e => {
        if (!gView.fw) return;
        e.preventDefault();
        if (gFit) setFitMode(false);
        gZoom = Math.min(3, Math.max(1, gZoom + (e.deltaY < 0 ? 0.15 : -0.15)));
        applyTransform(false);
    }, { passive: false });

    window.addEventListener("resize", () => {
        if (!$("gallery-screen") || $("gallery-screen").classList.contains("layer-hide")) return;
        setupImageView(isCGUnlocked(galleryCGs[galleryIndex]));
    });
})();
