/* =============================================================
 * story.js — zjk 角色资料 + 全部剧情数据（场景/台词/选项/好感度）+ 游戏状态变量
 * -------------------------------------------------------------
 * 改剧情台词 / 选项 / 好感度  → story.js
 * 改立绘大小位置 / 界面样式   → index.html 的 CSS
 * ============================================================= */
/* =========================================
   1. 男主角资料（zjk 立绘）
========================================= */

const PORTRAIT = "imagines/zjk.png";

const maleLead = {
    name: "zjk",
    affection: 0,
    expressions: {
        normal: PORTRAIT,
        smile: "imagines/zjk_smile.png",   /* 好感增加时的笑容表情（第三版） */
        sad: PORTRAIT,
        angry: PORTRAIT
    }
};

/* =========================================
   2. 游戏状态
========================================= */

let gameState = {
    currentScene: "scene1",
    dialogueIndex: 0,
    affection: 0,
    isTyping: false,
    gameEnded: false
};

let typingTimer = null;
let currentText = "";
let currentPosition = 0;
let inStory = false;        /* 是否已进入剧情层 */
let gameStartedOnce = false;

/* 临时表情：好感增加时切换为笑容，显示一句后恢复 */
let tempExpression = null;   /* 例如 "smile" */
let tempExpressionLines = 0; /* 剩余显示句数 */

/* =========================================
   3. 剧情数据
========================================= */

const story = {

    /* ========== 周一 · 07:53 · 教学楼走廊 ========== */
    scene1: {
        title: "周一 · 07:53 教学楼走廊",
        background: "imagines/bg/corridor_morning.jpg",
        bgGradient: "linear-gradient(135deg,#6a7d94,#2b3346)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "旁白", text: "早上的走廊有些拥挤。" },
            { speaker: "旁白", text: "你抱着一摞书从楼梯上来，刚转过弯，就看见 zjk 正靠在栏杆旁边，和几个朋友聊天。" },
            { speaker: "旁白", text: "他今天看起来心情不错，手里拿着一瓶水，听别人说话的时候偶尔笑一下。" },
            { speaker: "旁白", text: "你走近时，他刚好转过头。" },
            { speaker: "zjk",  text: "诶。" },
            { speaker: "你",   text: "早。" },
            { speaker: "zjk",  text: "你今天来这么早？" },
            { speaker: "你",   text: "这还早？" },
            { speaker: "zjk",  text: "对我来说挺早的。" },
            { speaker: "旁白", text: "他说完笑了一下，低头拧开瓶盖。" },
            { speaker: "旁白", text: "你本来准备直接走过去，他却突然伸手，轻轻碰了一下你最上面那本书。" },
            { speaker: "zjk",  text: "这么多？" },
            { speaker: "你",   text: "嗯。" },
            { speaker: "zjk",  text: "我了书。" },
            { speaker: "你",   text: "什么？" },
            { speaker: "zjk",  text: "没什么。" },
            { speaker: "旁白", text: "他把手收回去，自己先笑了。" },
            { speaker: "旁白", text: "你有时候真的不太理解他的脑回路。" },
            { speaker: "zjk",  text: "你今天干嘛？" },
            { speaker: "你",   text: "上学啊。" },
            { speaker: "zjk",  text: "……" },
            { speaker: "你",   text: "不然呢？" },
            { speaker: "旁白", text: "他笑得更明显了。" },
            { speaker: "旁白", text: "朋友在旁边喊他，他应了一声，转回去继续聊天。" },
            { speaker: "旁白", text: "你走出去几步，又听见他在后面说：" },
            { speaker: "zjk",  text: "诶，等下。" },
            { speaker: "旁白", text: "你回头。" }
        ],

        choices: [
            { text: "「怎么了？」",         affection: 3, next: "scene2" },
            { text: "「……」（当作没听见）", affection: 1, next: "scene2" }
        ]
    },

    /* ========== 周一 · 10:22 · 教学楼二楼 ========== */
    scene2: {
        title: "周一 · 10:22 教学楼二楼",
        background: "imagines/bg/corridor_class.jpg",
        bgGradient: "linear-gradient(135deg,#7b8ba3,#333c52)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "zjk",  text: "没事，拜拜。" },
            { speaker: "你",   text: "？" },
            { speaker: "旁白", text: "第二节课下课，你拿着水杯去接水。" },
            { speaker: "旁白", text: "回来的时候，刚好看见 zjk 从另一间教室出来。" },
            { speaker: "旁白", text: "他似乎刚和同学说完什么，手里还拿着一张纸。你走过去。" },
            { speaker: "你",   text: "诶，问你个问题。" },
            { speaker: "zjk",  text: "啥意思？" },
            { speaker: "你",   text: "我还没问呢。" },
            { speaker: "zjk",  text: "哦。" },
            { speaker: "旁白", text: "你把数学卷子递给他。" },
            { speaker: "你",   text: "这题你会吗？" },
            { speaker: "旁白", text: "他接过去，低头看了看。一开始还挺认真，过了十几秒，眉毛慢慢皱起来。" },
            { speaker: "zjk",  text: "……" },
            { speaker: "你",   text: "会吗？" },
            { speaker: "zjk",  text: "我了题目。" },
            { speaker: "你",   text: "所以呢？" },
            { speaker: "zjk",  text: "我感觉不太好讲。" },
            { speaker: "你",   text: "你试试嘛。" },
            { speaker: "旁白", text: "他拿笔在草稿纸上写了两行，又停下来。" },
            { speaker: "zjk",  text: "等下。" },
            { speaker: "旁白", text: "他盯着题目看了一会儿。" },
            { speaker: "zjk",  text: "卡了。" },
            { speaker: "你",   text: "你不是会吗？" },
            { speaker: "zjk",  text: "我没说我会啊。" },
            { speaker: "你",   text: "那你刚刚看那么认真。" },
            { speaker: "zjk",  text: "我在努力。" },
            { speaker: "旁白", text: "他说得一本正经。" },
            { speaker: "旁白", text: "你看着他写出来的步骤，发现其实已经有思路了。" },
            { speaker: "你",   text: "这不是挺好的吗？" },
            { speaker: "zjk",  text: "还行吧。" },
            { speaker: "旁白", text: "他把卷子递给你，表情有一点不自然。" },
            { speaker: "zjk",  text: "你再看看，反正我也不一定对。" }
        ],

        choices: [
            { text: "「谢谢，已经很好啦。」", affection: 5, next: "scene3" },
            { text: "「那我再看看吧。」",     affection: 2, next: "scene3" }
        ]
    },

    /* ========== 周一 · 12:16 · 食堂二楼 ========== */
    scene3: {
        title: "周一 · 12:16 食堂二楼",
        background: "imagines/bg/corridor_class.jpg",
        bgGradient: "linear-gradient(135deg,#8a7f6d,#3a3428)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "旁白", text: "他低头把笔帽盖上。" },
            { speaker: "zjk",  text: "乐乐。" },
            { speaker: "旁白", text: "然后把笔还给你。" },
            { speaker: "旁白", text: "你注意到，他被夸的时候好像总是这样，不太知道怎么接话。" },
            { speaker: "旁白", text: "午饭时间。你和朋友端着餐盘，在食堂里找了个靠窗的位置。" },
            { speaker: "旁白", text: "今天的饭菜不算特别好吃，你一边挑菜，一边听朋友讲话。" },
            { speaker: "旁白", text: "吃到一半，你突然看见了 zjk。" },
            { speaker: "旁白", text: "他坐在距离你们几排桌子的位置，旁边有好几个朋友，正吃着饭，偶尔抬头和别人说话。" },
            { speaker: "旁白", text: "你看了他一眼。然后低头。" },
            { speaker: "旁白", text: "过了一会儿，你拿起水杯。又看了一眼。" },
            { speaker: "旁白", text: "他也刚好抬头。四目相对。" },
            { speaker: "旁白", text: "你迅速低下头。你觉得自己应该没有表现得很明显。" },
            { speaker: "旁白", text: "但其实另一边的 zjk 也没好到哪里去。" },
            { speaker: "旁白", text: "他刚刚已经看了你不止一次。本来只是想看看你今天有没有来食堂，结果每次抬头都刚好能看见你。" },
            { speaker: "朋友", text: "你看啥呢？" },
            { speaker: "zjk",  text: "没看啥。" },
            { speaker: "朋友", text: "真的？" },
            { speaker: "zjk",  text: "嗯。" },
            { speaker: "旁白", text: "他低头扒了两口饭。过了几秒，又抬头。你正好也在看他。" },
            { speaker: "旁白", text: "这一次，他没有马上躲开。他看着你，稍微笑了一下。" },
            { speaker: "旁白", text: "你也笑了。然后两个人各自低下头，假装什么都没发生。" },
            { speaker: "朋友", text: "你是不是在看谁？" },
            { speaker: "你",   text: "没有。" },
            { speaker: "朋友", text: "那你怎么一直往那边看？" },
            { speaker: "你",   text: "我看食堂环境。" },
            { speaker: "朋友", text: "……你继续。" },
            { speaker: "旁白", text: "十二点二十五分，zjk 吃完饭，端着餐盘站起来。" },
            { speaker: "旁白", text: "他和朋友说了几句话，往回收餐盘的地方走。经过你们附近的时候，他稍微放慢了脚步。" },
            { speaker: "zjk",  text: "诶。" },
            { speaker: "旁白", text: "你抬头。" },
            { speaker: "你",   text: "干嘛？" },
            { speaker: "zjk",  text: "吃什么呢？" },
            { speaker: "旁白", text: "你看了一眼自己的餐盘。" },
            { speaker: "你",   text: "饭。" },
            { speaker: "旁白", text: "他停顿了一下。" },
            { speaker: "zjk",  text: "我了，问你吃什么菜。" },
            { speaker: "你",   text: "你自己不会看啊？" },
            { speaker: "旁白", text: "他笑了。" },
            { speaker: "zjk",  text: "行。" },
            { speaker: "旁白", text: "他走出去几步，又回头看了一眼。你刚好还在看他。" },
            { speaker: "旁白", text: "他抬了抬眉毛，像是在问：啥意思？" }
        ],

        choices: [
            { text: "低下头笑了",     affection: 5, next: "scene4" },
            { text: "假装在看别处",   affection: 2, next: "scene4" }
        ]
    },

    /* ========== 周二 · 15:42 · 教学楼走廊 ========== */
    scene4: {
        title: "周二 · 15:42 教学楼走廊",
        background: "imagines/bg/corridor_morning.jpg",
        bgGradient: "linear-gradient(135deg,#6f8095,#2c3445)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "旁白", text: "你低下头笑了。好感度 +1 · 食堂偶遇。" },
            { speaker: "旁白", text: "周二下午，你们在走廊碰见了。他手里拿着一支笔，正漫不经心地转着。" },
            { speaker: "旁白", text: "你走过去的时候，他突然伸手，把你手里的笔拿走了。" },
            { speaker: "你",   text: "诶！" },
            { speaker: "zjk",  text: "干嘛？" },
            { speaker: "你",   text: "这是我的笔。" },
            { speaker: "zjk",  text: "我知道。" },
            { speaker: "你",   text: "那你拿走干什么？" },
            { speaker: "zjk",  text: "看看。" },
            { speaker: "旁白", text: "他把笔转了一圈，又递回来。你刚接过来，他又伸手轻轻戳了一下你的手臂。" },
            { speaker: "zjk",  text: "你今天怎么了？" },
            { speaker: "你",   text: "什么怎么了？" },
            { speaker: "zjk",  text: "感觉你有点不对劲。" },
            { speaker: "旁白", text: "你愣了一下。" },
            { speaker: "你",   text: "没有啊。" },
            { speaker: "旁白", text: "他看着你，没有追问。" },
            { speaker: "zjk",  text: "哦。" },
            { speaker: "旁白", text: "过了一会儿，他又说：" },
            { speaker: "zjk",  text: "那就好。" },
            { speaker: "旁白", text: "你突然觉得有点好笑。" },
            { speaker: "你",   text: "你怎么这么认真？" },
            { speaker: "zjk",  text: "我哪有。" },
            { speaker: "旁白", text: "他低头笑了笑。" },
            { speaker: "zjk",  text: "随便问问。" },
            { speaker: "旁白", text: "你们站在走廊边聊了一会儿。期间他说起一个缩写，你没听明白。" },
            { speaker: "你",   text: "sys 是什么意思？" },
            { speaker: "zjk",  text: "你问我？" },
            { speaker: "你",   text: "对啊。" },
            { speaker: "zjk",  text: "我也不知道。" },
            { speaker: "你",   text: "那你为什么用？" },
            { speaker: "zjk",  text: "感觉挺方便的。" },
            { speaker: "你",   text: "……" },
            { speaker: "旁白", text: "他笑了。" },
            { speaker: "zjk",  text: "喵喵喵。" }
        ],

        choices: [
            { text: "忍不住笑出声",   affection: 4, next: "scene5" },
            { text: "「你真的很奇怪」", affection: 2, next: "scene5" }
        ]
    },

    /* ========== 周二 · 17:06 · 放学 ========== */
    scene5: {
        title: "周二 · 17:06 放学",
        background: "imagines/bg/corridor_long.jpg",
        bgGradient: "linear-gradient(135deg,#8a6f5e,#2e2a3a)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "旁白", text: "最后一节课结束以后，你收拾好东西，准备离开。" },
            { speaker: "旁白", text: "路过 zjk 班级附近时，你看见他还在里面。" },
            { speaker: "旁白", text: "他似乎并不着急。一会儿和同学说话，一会儿整理书包，一会儿又低头找什么东西。" },
            { speaker: "旁白", text: "你站在门口看了一会儿。" },
            { speaker: "你",   text: "你还不走？" },
            { speaker: "zjk",  text: "等下。" },
            { speaker: "旁白", text: "你点点头，站在门边等了一会儿。" },
            { speaker: "旁白", text: "五分钟过去了。他还在。" },
            { speaker: "你",   text: "你到底在干嘛？" },
            { speaker: "zjk",  text: "找东西。" },
            { speaker: "你",   text: "找到了吗？" },
            { speaker: "zjk",  text: "没有。" },
            { speaker: "旁白", text: "他继续翻书包。" },
            { speaker: "你",   text: "那我先走了。" },
            { speaker: "zjk",  text: "行。" },
            { speaker: "旁白", text: "你刚转身，听见他又说：" },
            { speaker: "zjk",  text: "诶，你是不是看见我的笔了？" },
            { speaker: "旁白", text: "你回头。" },
            { speaker: "你",   text: "你手上不就是吗？" },
            { speaker: "旁白", text: "他低头。沉默。" },
            { speaker: "zjk",  text: "……" },
            { speaker: "zjk",  text: "我了笔。" },
            { speaker: "旁白", text: "你笑得不行。最后你还是先走了。" },
            { speaker: "旁白", text: "而他又磨蹭了一会儿，才终于收拾好东西。" },
            { speaker: "旁白", text: "他背上书包，和同学说了声拜拜，走出教室。" },
            { speaker: "旁白", text: "整个过程没有什么特别的告别仪式。他也没有特意等谁。" },
            { speaker: "旁白", text: "只是第二天早上，你们又在走廊碰见了。" }
        ],

        choices: [
            { text: "在门口多等一会儿", affection: 4, next: "scene6" },
            { text: "先走了",           affection: 2, next: "scene6" }
        ]
    },

    /* ========== 周三 · 08:02 · 教学楼 ========== */
    scene6: {
        title: "周三 · 08:02 教学楼",
        background: "imagines/bg/corridor_class.jpg",
        bgGradient: "linear-gradient(135deg,#7287a0,#2d3547)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "zjk",  text: "诶。" },
            { speaker: "旁白", text: "你抬头。zjk 正站在走廊另一边。" },
            { speaker: "zjk",  text: "昨天回去了？" },
            { speaker: "你",   text: "不然呢？" },
            { speaker: "zjk",  text: "没什么。" },
            { speaker: "旁白", text: "他走近了一点。" },
            { speaker: "zjk",  text: "你昨天走得挺快。" },
            { speaker: "你",   text: "不是你说行的吗？" },
            { speaker: "zjk",  text: "哈哈哈哈。" },
            { speaker: "旁白", text: "他伸手轻轻拍了一下你的书包。" },
            { speaker: "zjk",  text: "今天带什么了？" },
            { speaker: "你",   text: "书。" },
            { speaker: "zjk",  text: "我了书。" },
            { speaker: "你",   text: "你今天怎么回事？" },
            { speaker: "旁白", text: "他笑得肩膀都动了一下。" },
            { speaker: "zjk",  text: "不知道。" },
            { speaker: "旁白", text: "你们聊了一会儿。突然，你发现他今天好像有些不一样。" },
            { speaker: "旁白", text: "平时他总是很自然地接话，今天却偶尔会停顿一下。" },
            { speaker: "你",   text: "你是不是没睡好？" },
            { speaker: "zjk",  text: "还行。" },
            { speaker: "你",   text: "是不是不舒服？" },
            { speaker: "zjk",  text: "没有。" },
            { speaker: "你",   text: "你今天怎么有点奇怪？" },
            { speaker: "旁白", text: "他看着你，笑了一下。" },
            { speaker: "zjk",  text: "我哪有。" },
            { speaker: "你",   text: "真的。" },
            { speaker: "zjk",  text: "卡了。" },
            { speaker: "旁白", text: "他说完就笑了。你也不知道他究竟在卡什么。" }
        ],

        choices: [
            { text: "「你到底在卡什么？」", affection: 3, next: "scene7" },
            { text: "「算了，不问了。」",   affection: 1, next: "scene7" }
        ]
    },

    /* ========== 周三 · 12:20 · 食堂 ========== */
    scene7: {
        title: "周三 · 12:20 食堂",
        background: "imagines/bg/corridor_class.jpg",
        bgGradient: "linear-gradient(135deg,#87806f,#38332c)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "旁白", text: "今天你们坐得比平时近一些。" },
            { speaker: "旁白", text: "虽然还是隔着几张桌子，但只要抬头就能看见对方。" },
            { speaker: "旁白", text: "你正在和朋友聊天，突然发现 zjk 那边似乎有人在说什么。他笑得很开心。" },
            { speaker: "旁白", text: "你忍不住看了一会儿。然后他突然抬头。又对视了。" },
            { speaker: "旁白", text: "这次他直接笑了出来。你也笑了。" },
            { speaker: "朋友", text: "你俩干嘛呢？" },
            { speaker: "你",   text: "没干嘛。" },
            { speaker: "朋友", text: "你们刚刚是不是对视了？" },
            { speaker: "你",   text: "食堂这么大，碰巧吧。" },
            { speaker: "朋友", text: "行，碰巧。" },
            { speaker: "旁白", text: "另一边，zjk 也被朋友问了类似的问题。" },
            { speaker: "朋友", text: "你刚刚看谁？" },
            { speaker: "zjk",  text: "没谁。" },
            { speaker: "朋友", text: "那你笑什么？" },
            { speaker: "zjk",  text: "好笑。" },
            { speaker: "朋友", text: "什么好笑？" },
            { speaker: "zjk",  text: "不知道。" },
            { speaker: "旁白", text: "他拿起水杯喝了一口。" },
            { speaker: "朋友", text: "你今天挺奇怪。" },
            { speaker: "zjk",  text: "啥意思？" },
            { speaker: "朋友", text: "没啥意思。" },
            { speaker: "旁白", text: "他笑了一下，继续吃饭。" }
        ],

        choices: [
            { text: "再看一眼",   affection: 4, next: "scene8" },
            { text: "低头吃饭",   affection: 2, next: "scene8" }
        ]
    },

    /* ========== 周四 · 16:38 · 教学楼走廊 ========== */
    scene8: {
        title: "周四 · 16:38 教学楼走廊",
        background: "imagines/bg/corridor_night.jpg",
        bgGradient: "linear-gradient(135deg,#4a5568,#1c212e)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "旁白", text: "这天下午，你的心情不太好。" },
            { speaker: "旁白", text: "你站在走廊尽头，低头看着手里的卷子。" },
            { speaker: "旁白", text: "zjk 从楼梯口走过来。他看见你，脚步慢了下来。" },
            { speaker: "zjk",  text: "诶。" },
            { speaker: "旁白", text: "你抬头。" },
            { speaker: "你",   text: "怎么了？" },
            { speaker: "zjk",  text: "没怎么。" },
            { speaker: "旁白", text: "他看了看你的表情。" },
            { speaker: "zjk",  text: "今天不开心？" },
            { speaker: "旁白", text: "你犹豫了一下。" },
            { speaker: "你",   text: "有一点。" },
            { speaker: "旁白", text: "他没有问为什么。也没有急着讲什么大道理。" },
            { speaker: "旁白", text: "只是站在你旁边，和你一起看了一会儿窗外。" },
            { speaker: "旁白", text: "过了一阵，他从口袋里拿出一颗糖，递给你。" },
            { speaker: "zjk",  text: "给。" },
            { speaker: "你",   text: "你怎么还有糖？" },
            { speaker: "zjk",  text: "之前买的。" },
            { speaker: "旁白", text: "你接过来。" },
            { speaker: "你",   text: "谢谢。" },
            { speaker: "zjk",  text: "嗯。" },
            { speaker: "旁白", text: "他停了一下。" },
            { speaker: "zjk",  text: "不开心就先不想了。" },
            { speaker: "旁白", text: "你拆开糖纸。" },
            { speaker: "你",   text: "你怎么知道？" },
            { speaker: "zjk",  text: "猜的。" },
            { speaker: "旁白", text: "你笑了。他看着你，也笑了一下。" },
            { speaker: "zjk",  text: "好点没？" }
        ],

        choices: [
            { text: "「好一点了。」",             affection: 8, next: "scene9" },
            { text: "「你怎么知道我心情不好？」", affection: 5, next: "scene9" }
        ]
    },

    /* ========== 周五 · 17:19 · 放学（第一章完） ========== */
    scene9: {
        title: "周五 · 17:19 放学",
        background: "imagines/bg/corridor_long.jpg",
        bgGradient: "linear-gradient(135deg,#9a7a63,#332b3f)",
        character: PORTRAIT,

        dialogues: [
            { speaker: "你",   text: "好一点了。" },
            { speaker: "zjk",  text: "niceeeeen。" },
            { speaker: "旁白", text: "他伸手，轻轻碰了一下你的肩膀。" },
            { speaker: "zjk",  text: "那我走了。" },
            { speaker: "你",   text: "嗯。" },
            { speaker: "旁白", text: "他走了几步，又回头。" },
            { speaker: "zjk",  text: "诶。" },
            { speaker: "你",   text: "怎么了？" },
            { speaker: "zjk",  text: "没事。" },
            { speaker: "旁白", text: "他笑着挥挥手。" },
            { speaker: "zjk",  text: "拜拜。" },
            { speaker: "旁白", text: "一周的最后一天。你收拾完东西，经过 zjk 班级的时候，发现他还在磨蹭。" },
            { speaker: "旁白", text: "桌上摆着几本书，书包拉链开着，他正和同学说话。" },
            { speaker: "旁白", text: "你没有进去，只是在走廊边等朋友。" },
            { speaker: "旁白", text: "过了一会儿，他终于把东西收拾好了。" },
            { speaker: "旁白", text: "先把笔袋塞进去，再把卷子整理好，最后拉上书包。" },
            { speaker: "旁白", text: "他背起书包，转头看见你。" },
            { speaker: "zjk",  text: "诶。" },
            { speaker: "你",   text: "嗯？" },
            { speaker: "zjk",  text: "还没走？" },
            { speaker: "你",   text: "等人。" },
            { speaker: "zjk",  text: "哦。" },
            { speaker: "旁白", text: "他点点头。" },
            { speaker: "zjk",  text: "那我先走了。" },
            { speaker: "你",   text: "拜拜。" },
            { speaker: "旁白", text: "他往楼梯口走去。你看着他的背影，突然想起什么。" },
            { speaker: "你",   text: "zjk！" },
            { speaker: "zjk",  text: "啥意思？" },
            { speaker: "旁白", text: "你笑了。" },
            { speaker: "你",   text: "没什么意思。" },
            { speaker: "旁白", text: "他看着你，愣了一下。然后笑了。" },
            { speaker: "zjk",  text: "喵喵喵。" },
            { speaker: "旁白", text: "他挥了挥手，转身离开。" },
            { speaker: "旁白", text: "这次你没有追上去。也没有觉得有什么遗憾。" },
            { speaker: "旁白", text: "你们本来就是两个不同班级的人，有各自的课程、朋友和生活。" },
            { speaker: "旁白", text: "你不知道他今天有没有在食堂看你，也不知道他刚刚是不是特意回头。" },
            { speaker: "旁白", text: "但你知道，下周大概还会碰见他。" },
            { speaker: "旁白", text: "可能在走廊。可能在楼梯口。也可能是在食堂里，隔着几张桌子，刚好看见彼此。" },
            { speaker: "旁白", text: "而那些看似没有意义的瞬间，好像已经慢慢变成了你一周里最值得期待的事情。" },
            { speaker: "旁白", text: "——第一章 完" }
        ],

        choices: [
            { text: "看着他离开", affection: 6, next: "endingCheck" },
            { text: "追上去",     affection: 4, next: "endingCheck" }
        ]
    }

};
