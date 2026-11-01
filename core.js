/* =============================================================
 * core.js — 基础工具：选择器、轻提示、界面层显隐、背景、进度存档读写
 * -------------------------------------------------------------
 * 改剧情台词 / 选项 / 好感度  → story.js
 * 改立绘大小位置 / 界面样式   → index.html 的 CSS
 * ============================================================= */
/* =========================================
   0. 基础工具
========================================= */

const $ = id => document.getElementById(id);

let toastTimer = null;

function toast(msg) {
    const t = $("toast");
    t.innerText = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* 只显示指定菜单层，"none" 表示全部隐藏 */
const MENU_LAYERS = ["start-screen", "save-screen", "gallery-screen", "follow-screen"];

function showLayer(id) {
    MENU_LAYERS.forEach(layer => {
        $(layer).classList.toggle("layer-hide", layer !== id);
    });
}

/* 显隐剧情层（背景 / 立绘 / 对话框 / 菜单） */
function setGameLayerVisible(visible) {
    if (visible) {
        $("game-layer").classList.remove("layer-hide");
    } else {
        $("game-layer").classList.add("layer-hide");
    }
}

function hideEnding() {
    $("ending-screen").style.display = "none";
}

/* 背景：底层始终铺渐变兜底；图片预加载成功后在上层淡入，失败则停留在渐变 */
let bgToken = 0;   /* 防止快速切场景时旧图后到覆盖新图 */

function setBackground(url, gradient) {
    const bg = $("background");
    const layer = $("bg-image");

    if (!bg || !layer) return;

    /* 底层渐变：兜底色，任何情况下都有画面 */
    bg.style.backgroundImage = gradient || "linear-gradient(135deg, #596c83, #252a3c)";

    const token = ++bgToken;

    /* 无图片：直接淡出上一层图片，只留渐变 */
    if (!url) {
        layer.style.opacity = "0";
        return;
    }

    const img = new Image();

    img.onload = () => {
        if (token !== bgToken) return;          /* 已经切到别的场景了，丢弃 */
        layer.style.backgroundImage = `url("${url}")`;
        layer.style.opacity = "1";
    };

    img.onerror = () => {
        if (token !== bgToken) return;
        layer.style.opacity = "0";              /* 外链失败 → 保留渐变，不出现空白 */
    };

    img.src = url;
}

/* 元数据：最高好感度 + 已达成结局 */
const META_KEY = "zjkgal_meta";

function loadMeta() {
    try {
        const meta = JSON.parse(localStorage.getItem(META_KEY));
        if (meta && typeof meta === "object") {
            return {
                maxAffection: Number.isFinite(meta.maxAffection) ? meta.maxAffection : 0,
                endings: Array.isArray(meta.endings) ? meta.endings : []
            };
        }
    } catch {}
    return { maxAffection: 0, endings: [] };
}

function saveMeta(meta) {
    try {
        localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {}
}
