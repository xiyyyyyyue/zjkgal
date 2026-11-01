/* =============================================================
 * save.js — 存档界面：3 个存档槽的保存 / 读取 / 删除
 * -------------------------------------------------------------
 * 改剧情台词 / 选项 / 好感度  → story.js
 * 改立绘大小位置 / 界面样式   → index.html 的 CSS
 * ============================================================= */
/* =========================================
   13. 存档：3 个存档槽
========================================= */

const SAVES_KEY = "zjkgal_saves";
const SLOT_COUNT = 3;

function loadSaves() {
    try {
        const data = JSON.parse(localStorage.getItem(SAVES_KEY));
        if (Array.isArray(data) && data.length === SLOT_COUNT) return data;
    } catch {}
    return Array(SLOT_COUNT).fill(null);
}

function persistSaves(saves) {
    try {
        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    } catch {
        toast("浏览器存储不可用，无法保存");
    }
}

function openSaveScreen() {
    setGameLayerVisible(false);
    hideEnding();
    showLayer("save-screen");
    renderSaveSlots();
}

function renderSaveSlots() {
    const saves = loadSaves();
    const box = $("save-slots");
    box.innerHTML = "";

    saves.forEach((slot, index) => {
        const row = document.createElement("div");
        row.className = "slot";

        const info = document.createElement("div");
        info.className = "slot-info";

        const name = document.createElement("div");
        name.className = "slot-name";

        const detail = document.createElement("div");
        detail.className = "slot-detail";

        if (slot) {
            const sceneTitle =
                (story[slot.currentScene] && story[slot.currentScene].title) || "未知章节";

            let timeText = "未知时间";
            try {
                timeText = new Date(slot.time).toLocaleString("zh-CN", {
                    year: "numeric", month: "2-digit", day: "2-digit",
                    hour: "2-digit", minute: "2-digit"
                });
            } catch {}

            name.innerText = `存档 ${index + 1}　${sceneTitle}`;
            detail.innerText = `${timeText}　♥ 好感度 ${slot.affection}`;
        } else {
            name.innerText = `存档 ${index + 1}　空`;
            detail.innerText = "—— 尚无记录 ——";
        }

        info.append(name, detail);

        const btns = document.createElement("div");
        btns.className = "slot-btns";

        const canSave = inStory && !gameState.gameEnded;

        const saveBtn = document.createElement("button");
        saveBtn.innerText = "保存";
        saveBtn.disabled = !canSave;
        saveBtn.onclick = () => writeSlot(index);

        const loadBtn = document.createElement("button");
        loadBtn.innerText = "读取";
        loadBtn.disabled = !slot;
        loadBtn.onclick = () => readSlot(index);

        const delBtn = document.createElement("button");
        delBtn.innerText = "删除";
        delBtn.disabled = !slot;
        delBtn.onclick = () => deleteSlot(index);

        btns.append(saveBtn, loadBtn, delBtn);
        row.append(info, btns);
        box.appendChild(row);
    });
}

function writeSlot(index) {
    if (!inStory || gameState.gameEnded) {
        toast("当前没有可保存的进度");
        return;
    }

    const saves = loadSaves();
    saves[index] = {
        currentScene: gameState.currentScene,
        dialogueIndex: gameState.dialogueIndex,
        affection: gameState.affection,
        time: Date.now()
    };

    persistSaves(saves);
    renderSaveSlots();
    toast(`已保存到存档 ${index + 1}`);
}

function readSlot(index) {
    const slot = loadSaves()[index];

    if (!slot) {
        toast("该存档为空");
        return;
    }

    doLoadGame(slot);
}

function deleteSlot(index) {
    const saves = loadSaves();
    if (!saves[index]) return;

    saves[index] = null;
    persistSaves(saves);
    renderSaveSlots();
    toast(`已删除存档 ${index + 1}`);
}

function doLoadGame(data) {
    if (
        !data ||
        !story[data.currentScene] ||
        !Number.isInteger(data.dialogueIndex) ||
        data.dialogueIndex < 0 ||
        data.dialogueIndex > story[data.currentScene].dialogues.length ||
        !Number.isFinite(data.affection)
    ) {
        toast("存档数据无效");
        return;
    }

    clearInterval(typingTimer);

    hideEnding();
    showLayer("none");
    setGameLayerVisible(true);

    gameState.currentScene = data.currentScene;
    gameState.dialogueIndex = data.dialogueIndex;
    gameState.affection = Math.max(0, Math.min(100, data.affection));
    gameState.isTyping = false;
    gameState.gameEnded = false;

    inStory = true;
    gameStartedOnce = true;
    maleLead.affection = gameState.affection;

    tempExpression = null;
    tempExpressionLines = 0;

    updateAffection();

    const scene = story[data.currentScene];
    setBackground(scene.background, scene.bgGradient);
    setCharacter(scene.character);

    $("choices").style.display = "none";

    resumeCurrentLine();
    toast("读档成功");
}
