/* =============================================================
 * main.js — 入口：键盘操作、调试入口(?dev=1)、初始化
 * -------------------------------------------------------------
 * 改剧情台词 / 选项 / 好感度  → story.js
 * 改立绘大小位置 / 界面样式   → index.html 的 CSS
 * ============================================================= */
/* =========================================
   17. 键盘操作
========================================= */

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        const onStart = !$("start-screen").classList.contains("layer-hide");
        if (!onStart) backToMainMenu();
        return;
    }

    if (inStory && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        nextDialogue();
        return;
    }

    if (!$("gallery-screen").classList.contains("layer-hide")) {
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
    }
});


/* =========================================
   18. 调试入口：URL 参数直接查看剧情画面
   ------------------------------------------
   index.html?dev=1          直接进入剧情画面并显示场景切换条
   index.html?scene=scene5   直接进入指定场景（scene1 ~ scene9）
   index.html?dev=1&expr=smile  直接查看笑容表情立绘
   用于编辑/调试剧情画面，正常游玩不需要带参数
========================================= */

function initDebugEntry() {
    const params = new URLSearchParams(location.search);
    const dev = params.get("dev");
    const scene = params.get("scene");
    const expr = params.get("expr");

    /* 鉴赏模式部位锚点可视化：?parts=1 不进入剧情，只加显示标记 */
    if (params.get("parts") === "1") {
        document.body.classList.add("dev-parts");
    }

    if (dev !== "1" && !scene && !expr) return false;

    showLayer("none");
    setGameLayerVisible(true);
    startGame();

    if (scene && story[scene]) {
        loadScene(scene);
    }

    if (expr && maleLead.expressions[expr]) {
        tempExpression = expr;
        tempExpressionLines = 999;   /* 调试时常驻显示 */
        setCharacter(currentCharacterSrc());
    }

    if (dev === "1") {
        const bar = $("debug-bar");
        bar.style.display = "flex";

        Object.keys(story).forEach(id => {
            const btn = document.createElement("button");
            /* 按钮文字取简短形式，例如「S1 周一」 */
            const short = story[id].title ? story[id].title.split(" ")[0] : id;
            btn.innerText = id.replace("scene", "S") + " " + short;
            btn.onclick = () => {
                tempExpression = null;
                tempExpressionLines = 0;
                loadScene(id);
            };
            bar.appendChild(btn);
        });

        const smileBtn = document.createElement("button");
        smileBtn.innerText = "笑容表情";
        smileBtn.onclick = () => {
            tempExpression = "smile";
            tempExpressionLines = 999;
            setCharacter(currentCharacterSrc());
            bounceCharacter();
        };
        bar.appendChild(smileBtn);

        const resetBtn = document.createElement("button");
        resetBtn.innerText = "恢复常态";
        resetBtn.onclick = () => {
            tempExpression = null;
            tempExpressionLines = 0;
            setCharacter(currentCharacterSrc());
        };
        bar.appendChild(resetBtn);
    }

    return true;
}

/* =========================================
   19. BGM 背景音乐
------------------------------------------
   浏览器禁止无交互自动播放：首次点击页面任意处后开始播放。
   右下角音符按钮可开关，偏好存入 localStorage。
========================================= */

function initBgm() {
    const bgm = $("bgm");
    const btn = $("bgm-toggle");
    if (!bgm || !btn) return;

    let muted = false;
    try { muted = localStorage.getItem("zjkgal_bgm_muted") === "1"; } catch (e) {}
    bgm.volume = 0.35;

    const apply = () => {
        btn.classList.toggle("muted", muted);
        btn.title = muted ? "开启音乐" : "关闭音乐";
        if (muted) {
            bgm.pause();
        } else {
            bgm.play().catch(() => {});
        }
    };

    /* 首次交互解锁自动播放 */
    const unlock = () => {
        if (!muted) bgm.play().catch(() => {});
        document.removeEventListener("click", unlock);
        document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);

    btn.addEventListener("click", e => {
        e.stopPropagation();
        muted = !muted;
        try { localStorage.setItem("zjkgal_bgm_muted", muted ? "1" : "0"); } catch (e) {}
        apply();
    });

    apply();
}

/* =========================================
   20. 初始化
========================================= */

if (!initDebugEntry()) {
    setGameLayerVisible(false);
    showLayer("start-screen");
}

initBgm();
