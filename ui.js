/* =============================================================
 * ui.js — 界面跳转：主界面、关注我们、返回主界面
 * -------------------------------------------------------------
 * 改剧情台词 / 选项 / 好感度  → story.js
 * 改立绘大小位置 / 界面样式   → index.html 的 CSS
 * ============================================================= */
/* =========================================
   4. 主界面（已合并：标题界面即主界面）
========================================= */

function showMainMenu() {
    clearInterval(typingTimer);
    hideEnding();
    setGameLayerVisible(false);
    showLayer("start-screen");
    inStory = false;
    updateStoryButton();
}

/* 「剧情」按钮随进度变化 */
function updateStoryButton() {
    const hasProgress = gameStartedOnce && !gameState.gameEnded;

    const cn = $("btn-story") && $("btn-story").querySelector(".cn");
    if (cn) cn.innerText = hasProgress ? "继续剧情" : "开始游戏";

    const tip = $("main-menu-tip");
    if (tip) tip.innerText = hasProgress
        ? "当前进度：" + (story[gameState.currentScene] && story[gameState.currentScene].title)
        : "按 Esc 可随时返回主界面";
}

/* =========================================
   15. 关注我们
========================================= */

function openFollow() {
    setGameLayerVisible(false);
    hideEnding();
    showLayer("follow-screen");
}

/* =========================================
   16. 返回主界面（所有界面通用）
========================================= */

function backToMainMenu() {
    clearInterval(typingTimer);
    hideEnding();
    setGameLayerVisible(false);
    showLayer("start-screen");
    inStory = false;
    updateStoryButton();
}
