/* =============================================================
 * engine.js — 剧情引擎：场景加载、立绘与表情、打字机、选项、好感度、结局判定
 * -------------------------------------------------------------
 * 改剧情台词 / 选项 / 好感度  → story.js
 * 改立绘大小位置 / 界面样式   → index.html 的 CSS
 * ============================================================= */
/* =========================================
   5. 进入 / 返回剧情
========================================= */

function openStory() {
    hideEnding();
    showLayer("none");
    setGameLayerVisible(true);

    if (!gameStartedOnce || gameState.gameEnded) {
        startGame();
    } else {
        inStory = true;
        resumeCurrentLine();
    }
}

/* 重新开始时走这里 */
function startGame() {
    clearInterval(typingTimer);

    hideEnding();
    showLayer("none");
    setGameLayerVisible(true);

    gameState = {
        currentScene: "scene1",
        dialogueIndex: 0,
        affection: 0,
        isTyping: false,
        gameEnded: false
    };

    inStory = true;
    gameStartedOnce = true;
    maleLead.affection = 0;

    tempExpression = null;
    tempExpressionLines = 0;

    updateAffection();
    loadScene("scene1");
}

/* =========================================
   6. 加载场景 + zjk 立绘
========================================= */

function loadScene(sceneId) {
    const scene = story[sceneId];
    if (!scene) return;

    clearInterval(typingTimer);

    gameState.currentScene = sceneId;
    gameState.dialogueIndex = 0;
    gameState.isTyping = false;

    setBackground(scene.background, scene.bgGradient);
    setCharacter(scene.character);

    $("choices").style.display = "none";

    showDialogue();
}

function setCharacter(src) {
    const img = $("character-img");
    const placeholder = $("character-placeholder");

    if (src) {
        img.style.display = "block";
        if (img.getAttribute("src") !== src) img.src = src;
        placeholder.style.display = "none";
    } else {
        img.style.display = "none";
        img.removeAttribute("src");
        placeholder.style.display = "block";
    }
}

/* 当前应显示的立绘：临时表情优先，否则用场景默认立绘 */
function currentCharacterSrc() {
    const scene = story[gameState.currentScene];

    if (tempExpression && maleLead.expressions[tempExpression]) {
        return maleLead.expressions[tempExpression];
    }

    return scene ? scene.character : "";
}

/* 上下跳动 */
function bounceCharacter() {
    const img = $("character-img");

    img.classList.remove("char-bounce");
    void img.offsetWidth;          /* 强制重排，重新触发动画 */
    img.classList.add("char-bounce");
}

/* =========================================
   7. 对话系统
========================================= */

function showDialogue() {
    const scene = story[gameState.currentScene];

    /* 临时表情只显示指定句数，之后恢复常态立绘 */
    if (tempExpression) {
        if (tempExpressionLines > 0) {
            tempExpressionLines--;
        } else {
            tempExpression = null;
        }
    }

    setCharacter(currentCharacterSrc());

    if (gameState.dialogueIndex >= scene.dialogues.length) {
        showChoices();
        return;
    }

    const dialogue = scene.dialogues[gameState.dialogueIndex];

    $("speaker").innerText = dialogue.speaker;
    typeText(dialogue.text);
}

/* 从主界面回到剧情：直接显示当前整句，不重播打字机 */
function resumeCurrentLine() {
    const scene = story[gameState.currentScene];

    if (gameState.dialogueIndex >= scene.dialogues.length) {
        showChoices();
        return;
    }

    const dialogue = scene.dialogues[gameState.dialogueIndex];

    setCharacter(currentCharacterSrc());

    $("speaker").innerText = dialogue.speaker;
    $("dialogue").innerText = dialogue.text;
    gameState.isTyping = false;
    clearInterval(typingTimer);
}

/* =========================================
   8. 打字机效果
========================================= */

function typeText(text) {
    clearInterval(typingTimer);

    currentText = text;
    currentPosition = 0;
    gameState.isTyping = true;

    const dialogueElement = $("dialogue");
    dialogueElement.innerText = "";

    typingTimer = setInterval(() => {
        if (currentPosition < currentText.length) {
            dialogueElement.innerText += currentText[currentPosition];
            currentPosition++;
        } else {
            clearInterval(typingTimer);
            gameState.isTyping = false;
        }
    }, 45);
}

/* =========================================
   9. 下一句
========================================= */

function nextDialogue() {
    if (!inStory || gameState.gameEnded) return;
    if ($("choices").style.display === "flex") return;

    if (gameState.isTyping) {
        clearInterval(typingTimer);
        $("dialogue").innerText = currentText;
        gameState.isTyping = false;
        return;
    }

    gameState.dialogueIndex++;
    showDialogue();
}

/* =========================================
   10. 选项系统
========================================= */

function showChoices() {
    const scene = story[gameState.currentScene];
    const choicesBox = $("choices");

    choicesBox.innerHTML = "";
    choicesBox.style.display = "flex";

    scene.choices.forEach(choice => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.innerText = choice.text;
        button.onclick = () => selectChoice(choice);
        choicesBox.appendChild(button);
    });
}

function selectChoice(choice) {
    gameState.affection = Math.max(
        0,
        Math.min(100, gameState.affection + choice.affection)
    );

    maleLead.affection = gameState.affection;

    recordProgress(gameState.affection);
    updateAffection();

    $("choices").style.display = "none";

    /* 好感增加：切到笑容立绘并跳动，下一句恢复常态 */
    if (choice.affection > 0) {
        tempExpression = "smile";
        tempExpressionLines = 1;
    }

    if (choice.next === "endingCheck") {
        checkEnding();
    } else {
        loadScene(choice.next);
        if (tempExpression) bounceCharacter();
    }
}

function recordProgress(affection) {
    const meta = loadMeta();
    meta.maxAffection = Math.max(meta.maxAffection, affection);
    saveMeta(meta);
}

/* =========================================
   11. 好感度
========================================= */

function updateAffection() {
    $("affection").innerText = gameState.affection;
    $("affection-fill").style.width = gameState.affection + "%";
}

/* =========================================
   12. 结局
========================================= */

function checkEnding() {
    gameState.gameEnded = true;
    inStory = false;

    recordProgress(gameState.affection);

    const affection = gameState.affection;

    let endingName =
        affection >= 36 ? "TRUE END" :
        affection >= 26 ? "NORMAL END" :
        "BAD END";

    const meta = loadMeta();
    if (!meta.endings.includes(endingName)) {
        meta.endings.push(endingName);
        saveMeta(meta);
    }

    if (endingName === "TRUE END") {
        showEnding(
            "TRUE END · 刚好看见你",
            "周一，你在食堂没有看见 zjk。<br><br>" +
            "周二，你在走廊碰见他，他说：「诶，你昨天没来？」<br><br>" +
            "你问：「你怎么知道？」<br><br>" +
            "他低头笑了一下。<br><br>「我了……」<br><br>他没说完。<br><br>「算了。」"
        );
    } else if (endingName === "NORMAL END") {
        showEnding(
            "NORMAL END · 概率问题",
            "你们依然是不同班的两个人，有各自的课程、朋友和生活。<br><br>" +
            "下周大概还会碰见他——可能在走廊，可能在楼梯口，也可能在食堂里，隔着几张桌子，刚好看见彼此。<br><br>" +
            "而那些看似没有意义的瞬间，已经慢慢变成了一周里最值得期待的事。"
        );
    } else {
        showEnding(
            "BAD END · 没有交集",
            "一周就这样过去了。<br><br>" +
            "走廊很挤，食堂很大，但你们没有再刚好看见过。<br><br>" +
            "有些概率，低到几乎不会发生。"
        );
    }
}

function showEnding(title, text) {
    const img = $("ending-img");
    img.onerror = () => { img.src = PORTRAIT; };
    img.src = (title === "TRUE END") ? "imagines/zjk333.png" : PORTRAIT;

    $("ending-title").innerText = title;
    $("ending-text").innerHTML = text;

    clearInterval(typingTimer);
    $("ending-screen").style.display = "flex";
}

function restartGame() {
    hideEnding();
    startGame();
}
