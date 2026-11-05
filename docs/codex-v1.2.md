# Oliver's English Adventure v1.2：Codex 修正指令

## 使用方式

1. 把這份檔案放進 repo：`docs/codex-v1.2.md`，在 `codex/oliver-english-adventure` 分支上開一個新分支 `v1.2`。
2. 一次只執行一個階段。對 Codex 說：「請讀 `docs/codex-v1.2.md`，只執行 Phase 0，完成後停下來回報。」
3. 每個階段完成後，你親自看過畫面與 `docs/` 裡的報告，確認沒問題再進下一階段。
4. 如果開了新的 Codex 對話，Codex 會先讀到 Phase 0 建立的 `AGENTS.md`，產品守則會自動延續。

| 階段    | 內容                                     | 需要你做的事                         |
| ------- | ---------------------------------------- | ------------------------------------ |
| Phase 0 | 產品守則、內容盤點、語音檢測頁           | 用 iPhone 開語音檢測頁，把結果貼回來 |
| Phase 1 | 互動卡格式與 30 張精選卡（草稿）         | 審核 30 張卡的英文與玩法             |
| Phase 2 | 首頁改版、紀錄簡化、課堂模組改為選用     | 真機看首頁                           |
| Phase 3 | 新單元「名字怎麼念」：恐龍・爬蟲・小昆蟲 | 抽查發音資料                         |
| Phase 4 | 預錄音檔與播放流程，發布 v1.2.0          | 產生或錄製音檔                       |

如果 Phase 0 的 iPhone 語音檢測結果很差（聲音怪、恐龍名念錯），請把 Phase 4 提前到 Phase 1 之前。

---

## Phase 0：產品守則、內容盤點、語音檢測頁

```
你正在維護 Oliver's English Adventure：React + TypeScript + Vite 的 PWA，使用本機儲存與 Service Worker，部署在 GitHub Pages，目前版本 v1.1.0。
請先閱讀 README.md、docs/RELEASE-1.1.md、docs/TESTING.md 與 docs/codex-v1.2.md，了解現有架構、資料結構、路由方式與測試指令。

本階段只做以下三件事，不更動任何現有使用者介面與教材內容。

【任務 1：建立 AGENTS.md】
在 repo 根目錄建立（或更新）AGENTS.md，寫入下面的「產品守則」，之後所有修改都必須遵守：

# 產品守則
- 核心原則：Parents use the phone. Children interact with their parents. 手機是家長的備課工具，不是給孩子看的螢幕。
- 不做：倒數計時、連續打卡、分數、排名、測驗、答對答錯判定、給孩子看的獎勵動畫、推播通知。
- 不新增：帳號、後端、分析追蹤、第三方 SDK、對外網路請求、麥克風、定位。音檔與教材都打包在站內。
- 新增任何 npm 套件前，先停下來詢問。
- 首頁預設區塊保持極簡；除非指令明確要求，新功能不得放進首頁預設區塊。
- 內容語氣：描述、邀請與共玩優先於指令和提問。不要求孩子跟著說，接受沉默與中文回答。
- 英文例句與發音資料（src/data/creatureNames.ts 的 en、chunks、alt 欄位）由人工審核，不得自行改寫。發現疑似錯誤時，在回報中列出，不要直接改。
- 本機資料結構有任何變更，都要撰寫 migration，確保 v1.1 使用者的紀錄、收藏與 JSON 備份不遺失，且舊備份可匯入。
- 每次會部署的修改都要更新 Service Worker 快取版本，確認已加到 iPhone 主畫面的舊版會取得新內容。
- 每次修改後執行全部單元測試與行動尺寸 E2E 測試，維持全數通過，並為新功能補上測試。
- 介面文字使用繁體中文（台灣用語）。

【任務 2：內容盤點報告】
把現有 112 句英文逐句分類成五種類型之一：
- instruction（指令，例如 Wash your hands.）
- question（提問，例如 What color is it?）
- description（描述，例如 The water is warm.）
- invitation（邀請一起做，例如 Let's stomp together.）
- play（玩笑、唱念、故意說錯，例如 Is this a banana? No!）

產出 docs/CONTENT-AUDIT.md，內容包括：
1. 每個情境的五類句數統計表，以及全部合計比例。
2. 「高摩擦情境」（吃飯、清潔、收拾、出門）中屬於 instruction 或 question 的句子清單。
3. 每句指令或提問附一個改寫建議，改成描述、邀請或共玩的說法（只寫在報告裡，不要改教材）。
4. 列出你認為英文不夠自然、或對 3 歲孩子太長的句子。
5. 檢查現有「接話提示」是否包含兩個做法：「先等待幾秒」與「用英文把孩子的中文意思說一次，而不是要求他用英文再說」。列出缺少的部分。

分類時如果你不確定，標記 uncertain，不要硬分。

【任務 3：語音檢測頁】
新增一個隱藏的「語音檢測」頁面，不放在主要導覽中：在設定頁最底部放一個小字連結進入，並依現有路由方式實作。頁面內容：
1. 顯示裝置資訊（navigator.userAgent）與目前 app 自動選用的聲音。
2. 列出 speechSynthesis.getVoices() 的全部聲音：name、lang、localService、default。注意 iOS 上聲音可能非同步載入，要監聽 voiceschanged。
3. 測試按鈕，每項都有「正常」與「慢速」兩種播放：
   - 生活句：Shoes on! / Let's wash your hands. / Time for bed. / Can you stomp like a dinosaur? / Good night, sleep tight.
   - 困難名稱：Triceratops / Pteranodon / Parasaurolophus / Pachycephalosaurus / Quetzalcoatlus / chameleon / tortoise / cicada
4. 「複製檢測結果」按鈕：把裝置資訊、聲音清單與目前選用的聲音整理成純文字，複製到剪貼簿，方便家長貼給開發者。
5. 不發出任何網路請求，不儲存任何資料。

【完成條件】
- AGENTS.md 與 docs/CONTENT-AUDIT.md 已建立。
- 語音檢測頁可在行動尺寸正常使用，並有對應的 E2E 測試。
- 現有 36 項單元測試與 21 項 E2E 測試全數通過。
- 回報：盤點統計摘要、你發現最需要改寫的 10 句、任何不確定之處。完成後停下來，不要進入 Phase 1。
```

**你在 Phase 0 之後要做的事**：用 iPhone（最好兩支不同 iOS 版本）打開語音檢測頁，逐一播放困難名稱，按「複製檢測結果」保存下來。

---

## Phase 1：互動卡格式與 30 張精選卡

```
延續 Phase 0。請先讀 AGENTS.md 與 docs/CONTENT-AUDIT.md。

本階段建立新的「互動卡」資料格式與 30 張精選卡草稿，並做一個預覽頁供人工審核。暫時不要更動首頁。

【任務 1：資料格式】
新增 src/data/interactionCards.ts：

export type Moment = 'meal' | 'bath' | 'out' | 'play' | 'bedtime' | 'calm';
// meal 吃飯中、bath 刷牙洗澡、out 準備出門、play 一起玩、bedtime 睡前、calm 平靜下來後

export type LineType = 'instruction' | 'question' | 'description' | 'invitation' | 'play';

export interface InteractionCard {
  id: string;
  moment: Moment;
  primaryType: LineType;
  say: string;          // 先說：家長說就好，不用等孩子回答（最短版本）
  sayZh: string;
  actionZh: string;     // 做一下：一個實體小動作
  invite?: string;      // 邀請一起玩（選填）
  inviteZh?: string;
  replies?: {           // 孩子的反應；未填時使用通用接話
    silent?: string;
    chinese?: { zh: string; en: string };
    oneWord?: { kidSays: string; en: string };
  };
  levels: {
    short: string;      // 會說短句的孩子
    chatting: string;   // 會聊幾句的孩子
  };
  avoidZh?: string;     // 今天不用做
  status: 'draft' | 'reviewed';
}

另外建立通用接話（每張卡沒有自訂 replies 時顯示）：
- 沒反應：等五秒。你自己再做一次動作、再說一次，不追問，也不要求他跟著說。
- 說中文：用英文把他的意思說一次，例如孩子說「我要藍色的」，你說 "Oh, the blue one!"。不要求他再用英文說。
- 只說一個字：幫他把那個字擴成一句，例如孩子說 "Dog!"，你說 "Yes! A big dog!"。

【任務 2：30 張精選卡草稿】
六個時刻各 5 張，status 全部設為 'draft'。規則：
- 每個時刻至少 3 張的 primaryType 是 description、invitation 或 play。
- say 不超過 5 個英文字；levels.short 不超過 8 個字；levels.chatting 不超過 12 個字。
- 使用自然的美式日常口語，避免課本腔。
- play 時刻要包含恐龍、動物、昆蟲與玩具的共玩，其中一張用來介紹 Phase 3 的「名字怎麼念」單元。
- calm 時刻的卡片要加上提醒：「孩子情緒還很大時，先用你最自然的語言安撫；平靜下來後再用這張卡。」
- 可以參考 docs/CONTENT-AUDIT.md 的改寫建議，但不要修改原本 112 句教材。

範例卡（請照此格式，並收錄為 out 時刻的第一張）：

{
  id: 'out-shoes-stomp',
  moment: 'out',
  primaryType: 'play',
  say: 'Shoes on! One… two!',
  sayZh: '穿鞋囉！一、二！',
  actionZh: '把鞋子拿在手上，像恐龍一樣在地板上咚、咚走到孩子腳邊。',
  invite: 'Stomp, stomp! Dinosaur feet!',
  inviteZh: '咚、咚！恐龍腳！',
  replies: {
    silent: '等五秒，你自己再踩一次，笑著說 "Stomp!"。不追問，也不要求他跟著說。',
    chinese: { zh: '我不要穿', en: "You don't want to. Okay. This one or that one?" },
    oneWord: { kidSays: 'Dinosaur!', en: 'Yes! Dinosaur feet go stomp!' }
  },
  levels: {
    short: 'Which foot goes first? Left or right?',
    chatting: "Let's stomp all the way to the door. Ready, set, go!"
  },
  avoidZh: '要孩子跟著唸、糾正發音。',
  status: 'draft'
}

【任務 3：卡片元件與預覽頁】
- 建立 InteractionCard 元件，區塊順序：先說 → 做一下 → 邀請一起玩 → 如果孩子……（三種接話，預設收合） → 想說長一點時（預設收合） → 今天不用做。
- 英文句旁有播放鍵，使用現有的語音播放功能（正常與慢速）。
- 在設定頁「進階」區塊新增「卡片預覽」頁，依時刻列出 30 張卡，標示 draft／reviewed，供人工審核。

【完成條件】
- 單元測試：30 張卡、每個時刻 5 張、id 不重複、必填欄位齊全、每個時刻至少 3 張屬於 description／invitation／play、say 字數限制。
- 預覽頁的 E2E 測試。
- 全部既有測試通過。
- 回報：30 張卡的英文 say 清單（方便人工快速審核），完成後停下來。
```

**你在 Phase 1 之後要做的事**：看預覽頁，審核 30 張卡的英文和動作，改好的卡把 `status` 改成 `'reviewed'`。

---

## Phase 2：首頁改版、紀錄簡化、課堂模組改為選用

```
延續 Phase 1。請先讀 AGENTS.md。本階段會更動本機資料的呈現方式，請先寫 migration，再改介面。

【任務 1：首頁】
首頁由上到下只保留以下內容：

1. 標題與說明文案（請完全照抄）：
   標題：今天說一句就好
   說明：選一個現在的時刻，聽一次、跟著唸，就放下手機去陪孩子。孩子不回英文也沒關係，你在說，他就在聽。

2. 「今天的一句」：保留現有每日活動，預設只顯示一句英文加一個動作，「完整五分鐘」維持可展開。

3. 六個時刻按鈕：吃飯中、刷牙洗澡、準備出門、一起玩、睡前、平靜下來後。
   點進去先只顯示該時刻的 3 張精選互動卡（status 為 reviewed 的優先，不足時用 draft 補）。
   底部有「看更多句子」，連到原本對應情境的句子列表：
   meal→吃飯、bath→清潔、out→出門、play→恐龍與玩具相關內容、bedtime→晚安、calm→安慰。
   「收拾」與其他情境放在「更多情境」入口，不出現在首頁。

4. 「我們家常用」：合併原本的「收藏」與「最近練習」。收藏在前，接著最近練習的 5 句，去除重複。

5. 頁尾一行小字：不用考試，不用打卡。紀錄只存在這支手機裡。

【任務 2：孩子的程度設定】
在設定頁新增「孩子現在大概……」三選一：剛開始、會說短句、會聊幾句。預設為剛開始。
- 剛開始：互動卡主句顯示 say。
- 會說短句：主句顯示 levels.short，say 以小字顯示在下方。
- 會聊幾句：主句顯示 levels.chatting，say 以小字顯示在下方。
這個設定只影響顯示，不判定孩子程度，也不出現任何評量字眼。

【任務 3：成長紀錄簡化】
- 「小發現筆記」改為紀錄頁的主要內容：頁面最上方是一個輸入框加「記下來」按鈕，一鍵新增一則筆記（自動帶日期）。
- 每則筆記可「分享」：優先使用 Web Share API 分享純文字；不支援時改為複製到剪貼簿並顯示「已複製」。
- 四種句子狀態（尚未觀察、聽得懂、提示後會說、能主動說出）移到「進階：句子狀態」頁，預設不在紀錄頁顯示。資料完整保留。
- 週摘要保留，但避免出現「完成率」「達成」之類的字眼。

【任務 4：課堂銜接改為選用】
- 在設定頁新增「孩子有上英文課嗎？」開關。
- migration：若使用者已有任何課堂紀錄，預設為開；否則預設為關。
- 關閉時，所有課堂相關入口都不顯示，但資料保留；推薦邏輯不受影響。

【任務 5：許願一句】
- 在 src/config.ts 新增 WISH_FORM_URL 常數，預設為空字串。
- 常數有值時，在搜尋結果為空以及每個時刻底部顯示「找不到想說的？許願一句」，以新分頁開啟該連結。
- 常數為空時完全不顯示。

【任務 6：網站描述】
把 index.html 的 meta description 與 manifest 的 description 改為：
給 3–6 歲孩子的爸媽：每次學一句生活英文，聽一次就能用在吃飯、刷牙、出門和玩耍。不用帳號，沒網路也能用。

【完成條件】
- migration 單元測試：用一份 v1.1 格式的本機資料與 JSON 備份，升級後收藏、最近練習、句子狀態、小發現筆記、課堂紀錄全部存在。
- E2E：首頁只顯示上述五個區塊；點「準備出門」看到 3 張卡；程度設定切換後主句改變；小發現筆記新增與分享（或複製）流程。
- 全部既有測試通過，更新 Service Worker 快取版本。
- 回報首頁在 390px 寬度下的截圖或區塊高度，完成後停下來。
```

---

## Phase 3：新單元「名字怎麼念」：恐龍・爬蟲・小昆蟲

```
延續 Phase 2。請先讀 AGENTS.md。

本階段新增「名字怎麼念」單元，幫家長正確念出孩子喜歡的恐龍、古代爬蟲、爬蟲類與昆蟲名稱。
發音資料由人工整理，請完全照下方內容建立，不要修改 en、chunks、alt 欄位；若你認為有錯誤，在回報中列出。

【任務 1：資料檔】
建立 src/data/creatureNames.ts，內容如下（chunks 是給家長看的念法拆段，大寫的段落是重音）：

export type CreatureGroup = 'dinosaur' | 'prehistoric' | 'reptile' | 'insect' | 'bug';

export interface CreatureName {
  id: string;
  en: string;
  zh: string;
  group: CreatureGroup;
  chunks: string[];
  alt?: string;
  nickname?: string;
  meaningZh?: string;
  tipZh?: string;
  kidLine: string;
  actionZh: string;
  notA?: 'dinosaur' | 'insect';
}

export const creatureNames: CreatureName[] = [
  // ── 恐龍 ──
  { id: 'triceratops', en: 'Triceratops', zh: '三角龍', group: 'dinosaur',
    chunks: ['try', 'SER', 'uh', 'tops'], meaningZh: '有三根角的臉',
    kidLine: 'Three horns! One, two, three.',
    actionZh: '兩根食指放在額頭當角，再指鼻子，一起數一、二、三。' },
  { id: 'tyrannosaurus', en: 'Tyrannosaurus rex', zh: '暴龍', group: 'dinosaur',
    chunks: ['tuh', 'ran', 'uh', 'SOR', 'us', 'rex'], nickname: 'T. rex（TEE-rex）',
    meaningZh: '殘暴蜥蜴之王', tipZh: '孩子常直接說 T. rex，念成 TEE-rex 就好。',
    kidLine: 'Big teeth! Tiny arms!',
    actionZh: '手肘夾緊身體，只用小手揮一揮，再張大嘴巴。' },
  { id: 'stegosaurus', en: 'Stegosaurus', zh: '劍龍', group: 'dinosaur',
    chunks: ['steg', 'uh', 'SOR', 'us'], meaningZh: '有屋頂的蜥蜴（背上的骨板像屋瓦）',
    kidLine: 'Look! Plates on its back.',
    actionZh: '手掌立起來，沿著孩子的背一片一片輕輕摸。' },
  { id: 'brachiosaurus', en: 'Brachiosaurus', zh: '腕龍', group: 'dinosaur',
    chunks: ['brak', 'ee', 'uh', 'SOR', 'us'], meaningZh: '手臂蜥蜴（前腳比後腳長）',
    kidLine: 'So tall! What a long neck!',
    actionZh: '一起踮腳，把手往上伸到最高。' },
  { id: 'velociraptor', en: 'Velociraptor', zh: '迅猛龍', group: 'dinosaur',
    chunks: ['vuh', 'LOSS', 'uh', 'rap', 'ter'], meaningZh: '敏捷的掠奪者',
    tipZh: '真正的迅猛龍大約只有火雞大小，電影裡的比較大。',
    kidLine: 'It runs so fast!',
    actionZh: '一起原地小碎步快跑。' },
  { id: 'ankylosaurus', en: 'Ankylosaurus', zh: '甲龍', group: 'dinosaur',
    chunks: ['ang', 'kuh', 'loh', 'SOR', 'us'], alt: 'an-KY-luh-SOR-us',
    meaningZh: '融合的蜥蜴（身上的骨板連在一起）',
    kidLine: 'It has a club on its tail. Swish!',
    actionZh: '屁股左右甩一甩，假裝是尾巴上的骨錘。' },
  { id: 'spinosaurus', en: 'Spinosaurus', zh: '棘龍', group: 'dinosaur',
    chunks: ['spy', 'nuh', 'SOR', 'us'], meaningZh: '有棘的蜥蜴',
    kidLine: 'A big sail on its back!',
    actionZh: '雙手在背後合起來，比出一面帆。' },
  { id: 'parasaurolophus', en: 'Parasaurolophus', zh: '副櫛龍', group: 'dinosaur',
    chunks: ['pair', 'uh', 'sor', 'OL', 'uh', 'fus'], meaningZh: '接近有冠的蜥蜴',
    tipZh: '頭上的長冠可能可以發出聲音。',
    kidLine: 'A long crest on its head. Toot, toot!',
    actionZh: '手從額頭往後比一根長管子，嘟起嘴巴吹。' },
  { id: 'pachycephalosaurus', en: 'Pachycephalosaurus', zh: '腫頭龍', group: 'dinosaur',
    chunks: ['pak', 'ee', 'sef', 'uh', 'loh', 'SOR', 'us'], meaningZh: '頭很厚的蜥蜴',
    tipZh: '最長的名字之一，先學會 pachy（PAK-ee）就很厲害了。',
    kidLine: 'Its head is so thick and hard!',
    actionZh: '用手掌輕拍自己的頭頂，咚、咚。' },
  { id: 'diplodocus', en: 'Diplodocus', zh: '梁龍', group: 'dinosaur',
    chunks: ['dih', 'PLOD', 'uh', 'kus'], alt: 'DIP-loh-DOH-kus',
    meaningZh: '雙樑（尾巴下方的骨頭）',
    kidLine: 'Long neck, long, long tail!',
    actionZh: '一隻手臂往前伸當脖子，另一隻手在身後當尾巴。' },
  { id: 'allosaurus', en: 'Allosaurus', zh: '異特龍', group: 'dinosaur',
    chunks: ['al', 'uh', 'SOR', 'us'], meaningZh: '不一樣的蜥蜴',
    kidLine: 'Sharp teeth. Chomp, chomp!',
    actionZh: '兩隻手當大嘴巴，一開一合。' },
  { id: 'iguanodon', en: 'Iguanodon', zh: '禽龍', group: 'dinosaur',
    chunks: ['ig', 'WAH', 'nuh', 'don'], meaningZh: '鬣蜥的牙齒',
    kidLine: 'Look! A spike on its thumb.',
    actionZh: '一起比讚，大拇指就是牠的尖刺。' },
  { id: 'carnotaurus', en: 'Carnotaurus', zh: '食肉牛龍', group: 'dinosaur',
    chunks: ['kar', 'noh', 'TOR', 'us'], meaningZh: '吃肉的公牛',
    kidLine: 'Two horns, like a bull!',
    actionZh: '兩根手指放在頭上當牛角。' },
  { id: 'dilophosaurus', en: 'Dilophosaurus', zh: '雙脊龍', group: 'dinosaur',
    chunks: ['dy', 'loh', 'fuh', 'SOR', 'us'], alt: 'dy-LOF-uh-SOR-us',
    meaningZh: '有兩片冠的蜥蜴',
    kidLine: 'Two crests on its head.',
    actionZh: '兩隻手在頭頂比出兩片冠。' },
  { id: 'gallimimus', en: 'Gallimimus', zh: '似雞龍', group: 'dinosaur',
    chunks: ['gal', 'ih', 'MY', 'mus'], meaningZh: '像雞一樣',
    kidLine: 'It runs like a big bird!',
    actionZh: '手肘彎起來當翅膀，一起跑。' },
  { id: 'argentinosaurus', en: 'Argentinosaurus', zh: '阿根廷龍', group: 'dinosaur',
    chunks: ['ar', 'jen', 'tee', 'noh', 'SOR', 'us'], meaningZh: '阿根廷的蜥蜴',
    kidLine: 'So huge! One of the biggest dinosaurs.',
    actionZh: '雙手張開到最大。' },
  { id: 'compsognathus', en: 'Compsognathus', zh: '美頜龍', group: 'dinosaur',
    chunks: ['komp', 'SOG', 'nuh', 'thus'], alt: 'komp-sog-NAY-thus',
    meaningZh: '漂亮的下巴',
    kidLine: 'A tiny dinosaur, as small as a chicken!',
    actionZh: '雙手捧出一隻雞的大小。' },

  // ── 古代爬蟲（不是恐龍）──
  { id: 'pteranodon', en: 'Pteranodon', zh: '無齒翼龍', group: 'prehistoric', notA: 'dinosaur',
    chunks: ['tuh', 'RAN', 'uh', 'don'], meaningZh: '有翅膀、沒有牙齒',
    tipZh: '開頭的 P 不發音。翼龍會飛，但不是恐龍。',
    kidLine: "It can fly! It's not a dinosaur.",
    actionZh: '張開雙臂，慢慢地飛。' },
  { id: 'quetzalcoatlus', en: 'Quetzalcoatlus', zh: '風神翼龍', group: 'prehistoric', notA: 'dinosaur',
    chunks: ['ket', 'sul', 'koh', 'AT', 'lus'], meaningZh: '以阿茲特克神話的羽蛇神命名',
    tipZh: '史上最大的飛行動物之一，不是恐龍。',
    kidLine: 'Its wings are so, so big!',
    actionZh: '手臂張開，慢慢繞一大圈。' },
  { id: 'mosasaurus', en: 'Mosasaurus', zh: '滄龍', group: 'prehistoric', notA: 'dinosaur',
    chunks: ['moh', 'zuh', 'SOR', 'us'], meaningZh: '默茲河的蜥蜴（最早在默茲河附近發現）',
    tipZh: '住在海裡的大型爬蟲，不是恐龍。',
    kidLine: 'It swims in the sea. Splash!',
    actionZh: '兩隻手掌合起來當嘴巴，在空中游。' },
  { id: 'plesiosaurus', en: 'Plesiosaurus', zh: '蛇頸龍', group: 'prehistoric', notA: 'dinosaur',
    chunks: ['plee', 'zee', 'uh', 'SOR', 'us'], alt: 'plee-see-uh-SOR-us',
    meaningZh: '接近蜥蜴',
    kidLine: 'A long neck in the water.',
    actionZh: '一隻手當長脖子，在「水面」上左看右看。' },
  { id: 'ichthyosaurus', en: 'Ichthyosaurus', zh: '魚龍', group: 'prehistoric', notA: 'dinosaur',
    chunks: ['ik', 'thee', 'uh', 'SOR', 'us'], meaningZh: '魚蜥蜴',
    tipZh: '開頭的 ich 念 ik。',
    kidLine: 'It looks like a dolphin!',
    actionZh: '手掌併攏，像海豚一樣上下游。' },
  { id: 'dimetrodon', en: 'Dimetrodon', zh: '異齒龍', group: 'prehistoric', notA: 'dinosaur',
    chunks: ['dy', 'MET', 'ruh', 'don'], meaningZh: '兩種長度的牙齒',
    tipZh: '比恐龍還早出現，親戚關係其實比較接近哺乳類。',
    kidLine: 'A sail on its back. Not a dinosaur!',
    actionZh: '雙手在背後比出一面帆。' },

  // ── 爬蟲類 ──
  { id: 'lizard', en: 'lizard', zh: '蜥蜴', group: 'reptile',
    chunks: ['LIZ', 'erd'],
    kidLine: 'A little lizard. Quick, quick!',
    actionZh: '手指在桌上快速「爬」過去。' },
  { id: 'gecko', en: 'gecko', zh: '壁虎', group: 'reptile',
    chunks: ['GEK', 'oh'],
    kidLine: 'It can climb up the wall!',
    actionZh: '手掌貼在牆上，一步一步往上爬。' },
  { id: 'turtle', en: 'turtle', zh: '烏龜', group: 'reptile',
    chunks: ['TER', 'tul'], tipZh: 'turtle 通常指會游泳的龜；在陸地上走的叫 tortoise。',
    kidLine: 'A slow, slow turtle.',
    actionZh: '縮起脖子，再慢慢伸出來。' },
  { id: 'tortoise', en: 'tortoise', zh: '陸龜', group: 'reptile',
    chunks: ['TOR', 'tus'], tipZh: '念 TOR-tus，不是 tor-toys。',
    kidLine: 'It walks on land, very slowly.',
    actionZh: '趴在地上，四肢慢慢爬。' },
  { id: 'snake', en: 'snake', zh: '蛇', group: 'reptile',
    chunks: ['SNAYK'],
    kidLine: 'Ssss! A long, long snake.',
    actionZh: '手臂像波浪一樣扭動。' },
  { id: 'crocodile', en: 'crocodile', zh: '鱷魚', group: 'reptile',
    chunks: ['KROK', 'uh', 'dile'],
    kidLine: 'Snap, snap! Big jaws!',
    actionZh: '兩隻手臂上下張開，再用力合起來。' },
  { id: 'alligator', en: 'alligator', zh: '短吻鱷', group: 'reptile',
    chunks: ['AL', 'uh', 'gay', 'ter'],
    tipZh: 'alligator 的嘴巴比較寬、比較圓；crocodile 的嘴巴比較尖。',
    kidLine: 'Its mouth is wide and round.',
    actionZh: '兩隻手掌張開，做出寬寬的嘴巴。' },
  { id: 'chameleon', en: 'chameleon', zh: '變色龍', group: 'reptile',
    chunks: ['kuh', 'MEEL', 'yun'], tipZh: '開頭的 ch 念 k 的音。',
    kidLine: 'It can change colors!',
    actionZh: "指著家裡不同顏色的東西說：\"Now it's red! Now it's blue!\"" },
  { id: 'iguana', en: 'iguana', zh: '鬣蜥', group: 'reptile',
    chunks: ['ih', 'GWAH', 'nuh'],
    kidLine: 'Look at the spikes on its back!',
    actionZh: '用手指沿著孩子的背，輕輕點一排刺。' },
  { id: 'komodo-dragon', en: 'Komodo dragon', zh: '科摩多巨蜥', group: 'reptile',
    chunks: ['kuh', 'MOH', 'doh', 'DRAG', 'un'],
    tipZh: '不是真的龍，是世界上最大的蜥蜴。',
    kidLine: 'The biggest lizard in the world!',
    actionZh: '趴在地上，慢慢地、重重地爬。' },

  // ── 昆蟲 ──
  { id: 'ant', en: 'ant', zh: '螞蟻', group: 'insect',
    chunks: ['ANT'],
    kidLine: 'A tiny ant. Six legs!',
    actionZh: '手指在桌上排隊走，一起數六隻腳。' },
  { id: 'bee', en: 'bee', zh: '蜜蜂', group: 'insect',
    chunks: ['BEE'],
    kidLine: 'Buzz, buzz! A busy bee.',
    actionZh: '手指在空中繞圈飛，嘴巴發出嗡嗡聲。' },
  { id: 'butterfly', en: 'butterfly', zh: '蝴蝶', group: 'insect',
    chunks: ['BUT', 'er', 'fly'],
    kidLine: 'Flap, flap! A pretty butterfly.',
    actionZh: '兩手大拇指扣在一起，其他手指當翅膀拍。' },
  { id: 'caterpillar', en: 'caterpillar', zh: '毛毛蟲', group: 'insect',
    chunks: ['KAT', 'er', 'pil', 'er'], tipZh: '長大會變成蝴蝶或蛾。',
    kidLine: 'Wiggle, wiggle, little caterpillar.',
    actionZh: '食指一伸一縮，慢慢往前爬。' },
  { id: 'ladybug', en: 'ladybug', zh: '瓢蟲', group: 'insect',
    chunks: ['LAY', 'dee', 'bug'], tipZh: '美國說 ladybug，英國常說 ladybird。',
    kidLine: 'Red with black dots!',
    actionZh: '在孩子手背上輕輕點，一起數點點。' },
  { id: 'beetle', en: 'beetle', zh: '甲蟲', group: 'insect',
    chunks: ['BEE', 'tul'],
    kidLine: 'A shiny beetle.',
    actionZh: '兩手合起來當硬硬的殼，再打開飛走。' },
  { id: 'rhinoceros-beetle', en: 'rhinoceros beetle', zh: '獨角仙', group: 'insect',
    chunks: ['ry', 'NOSS', 'er', 'us', 'BEE', 'tul'],
    tipZh: 'rhinoceros 是犀牛，牠頭上的角像犀牛角。',
    kidLine: 'A big horn, like a rhino!',
    actionZh: '一根手指放在額頭上當角。' },
  { id: 'stag-beetle', en: 'stag beetle', zh: '鍬形蟲', group: 'insect',
    chunks: ['STAG', 'BEE', 'tul'], tipZh: 'stag 是公鹿，牠的大顎像鹿角。',
    kidLine: 'Big jaws, like deer antlers!',
    actionZh: '兩隻手放在頭上比鹿角，一開一合。' },
  { id: 'dragonfly', en: 'dragonfly', zh: '蜻蜓', group: 'insect',
    chunks: ['DRAG', 'un', 'fly'],
    kidLine: 'Zoom! It flies so fast.',
    actionZh: '雙臂張開，快速轉彎飛。' },
  { id: 'grasshopper', en: 'grasshopper', zh: '蚱蜢', group: 'insect',
    chunks: ['GRASS', 'hop', 'er'],
    kidLine: 'Hop, hop, hop!',
    actionZh: '一起原地跳三下。' },
  { id: 'praying-mantis', en: 'praying mantis', zh: '螳螂', group: 'insect',
    chunks: ['PRAY', 'ing', 'MAN', 'tis'],
    tipZh: 'praying 是祈禱，因為牠的前腳收起來像在合掌。',
    kidLine: 'It folds its arms like this.',
    actionZh: '雙手彎起來，收在胸前。' },
  { id: 'firefly', en: 'firefly', zh: '螢火蟲', group: 'insect',
    chunks: ['FIRE', 'fly'],
    kidLine: 'Its light goes on and off.',
    actionZh: '手掌一開一合，當作一閃一閃的燈。' },
  { id: 'cicada', en: 'cicada', zh: '蟬', group: 'insect',
    chunks: ['sih', 'KAY', 'duh'], tipZh: '中間的 ca 念 KAY。',
    kidLine: 'Listen! It sings in summer.',
    actionZh: '一起學蟬叫，再一起安靜下來聽。' },

  // ── 小蟲（不是昆蟲）──
  { id: 'spider', en: 'spider', zh: '蜘蛛', group: 'bug', notA: 'insect',
    chunks: ['SPY', 'der'], tipZh: '蜘蛛有八隻腳，不是昆蟲。',
    kidLine: "Eight legs! It's not an insect.",
    actionZh: '一起數八根手指，讓手指在桌上爬。' },
  { id: 'snail', en: 'snail', zh: '蝸牛', group: 'bug', notA: 'insect',
    chunks: ['SNAYL'], tipZh: '蝸牛不是昆蟲，也不是爬蟲。',
    kidLine: 'Slow, slow. It carries its home.',
    actionZh: '把拳頭放在背上當殼，慢慢爬。' },
];

【任務 2：入口】
- 「一起玩」時刻的第一個項目是「名字怎麼念：恐龍・爬蟲・小昆蟲」。
- 現有中英文搜尋要能搜到名字卡：中文名（三角龍）、英文名（triceratops，不分大小寫）、nickname（t rex、T. rex）。
- 不要加到首頁其他位置。

【任務 3：列表頁】
- 頁首一行說明：拿出家裡的玩具或圖鑑，對著真的恐龍念給孩子聽。
- 可展開的「破解小撇步」（預設收合）：
  -saurus 念 SOR-us，意思是蜥蜴。
  -don 意思是牙齒。
  tri- 意思是三，Triceratops 就是「三根角的臉」。
  ptero- 意思是翅膀，開頭的 p 不發音。
  會了這幾個，很多名字都能猜出怎麼念。
- 分組標籤：🦖 恐龍、🦴 古代爬蟲、🦎 爬蟲、🐞 昆蟲、🕷️ 小蟲；最上方是「我們家的」（收藏的名字）。
- 每列顯示：中文名、英文名、一個播放鍵（正常速度）、收藏星號。
- 不使用任何圖片，也不從網路載入圖片。

【任務 4：名字詳細卡】
由上到下：
1. 英文名（大字）與中文名；有 nickname 時顯示「小名：…」。
2. 念法拆段：chunks 以「-」連接顯示；大寫段落改用粗體、較大字級呈現（顯示時可轉為小寫加粗，避免全大寫難讀）。下方一行說明：粗體是重音，念大聲一點、拉長一點。
3. 兩個按鈕：▶ 正常念、🐢 慢慢念。慢慢念時，畫面依序高亮每個 chunk。
4. 有 alt 時顯示：也有人念成 …
5. 有 notA 時顯示小標籤：「不是恐龍喔！」或「不是昆蟲喔！」
6. 名字的意思（meaningZh）與小提醒（tipZh）。
7. 說給孩子聽：kidLine（附播放鍵）。
8. 一起做：actionZh。
9. 固定玩法提示（每張卡都顯示，{en} 代入英文名、{zh} 代入中文名）：
   拿起玩具故意說錯：「Is this a duck?」讓孩子笑著糾正你。孩子用中文說「是{zh}啦！」也算贏，你再笑著說：「Oh! A {en}!」

不要加入測驗、配對、答對答錯或任何計分。

【任務 5：播放規則】
- 先找預錄音檔 audio/names/{id}.mp3（正常）與 audio/names/{id}-slow.mp3（慢念）。Phase 3 還沒有音檔，請先把找檔與備援的邏輯寫好。
- 沒有音檔時改用現有 Web Speech 播放：
  - 正常念：念 en 欄位。
  - 慢慢念：用較慢語速念整個 en（例如 rate 0.6），不要把 chunks 逐段丟給語音引擎，因為像 dile、sor 這類片段會被念錯。chunk 高亮依時間平均分配即可。
  - 使用電腦語音時，在播放鍵附近顯示小字：電腦語音可能念不準，請以上方拼法為準。

【完成條件】
- 單元測試：資料共 48 筆；id 不重複；每筆 chunks 至少有一段含大寫；group 都合法；group 為 prehistoric 時 notA 必為 'dinosaur'，group 為 bug 時 notA 必為 'insect'；搜尋「三角龍」「triceratops」「t rex」都能找到；Web Speech 備援念的是 en 而不是 chunks。
- E2E：從「一起玩」進入列表、切換分組、打開詳細卡、按播放鍵、收藏後出現在「我們家的」。
- 確認本頁沒有任何對外網路請求。
- 全部既有測試通過，更新 Service Worker 快取版本。
- 回報：你認為發音資料可能有誤的項目（只列出，不要修改），完成後停下來。
```

**你在 Phase 3 之後要做的事**：抽查有 `alt` 的項目，以及 Tyrannosaurus、Parasaurolophus、Pachycephalosaurus、Quetzalcoatlus、Komodo dragon，用 Merriam-Webster 或 Cambridge 線上字典的發音比對。

---

## Phase 4：預錄音檔、播放流程與發布 v1.2.0

```
延續 Phase 3。請先讀 AGENTS.md。

本階段建立預錄音檔的流程，讓精選互動卡與名字卡優先播放音檔，Web Speech 改為備援。音檔由人工產生，你不需要也不應該產生音檔。

【任務 1：音檔清單】
產生 docs/audio-manifest.csv，欄位：file, type, text, note
- 30 張互動卡：每張卡的 say、invite、levels.short、levels.chatting 各一列。檔名 audio/cards/{cardId}-{field}.mp3。
- 48 個名字：每個名字兩列。
  - 正常：audio/names/{id}.mp3，text 為 en。
  - 慢念：audio/names/{id}-slow.mp3，text 為 en，note 寫「先依 chunks 慢慢分段念一次，停頓一下，再用正常速度念一次」，並附上 chunks 內容。
- 檔案規格寫在 docs/AUDIO.md：mp3、單聲道、64 kbps 以內、前後靜音不超過 0.2 秒、統一使用同一個美式英文聲音。

【任務 2：播放流程】
- 建立共用的播放函式：有對應音檔時播放音檔；沒有時退回 Web Speech。
- 正在播放時再按一次即停止；切換頁面時停止播放。
- iOS 需在使用者點擊時才開始播放，請確認第一次點擊就能出聲。

【任務 3：離線快取】
- Service Worker 預先快取所有存在的音檔。
- 若音檔總量超過 8 MB，改為快取名字音檔與 30 張卡的 say，其餘按需快取，並在回報中說明。

【任務 4：聲音選單】
- 設定頁移除聲音選單；改為放在「語音檢測」頁中，供進階使用者調整。
- 預設行為維持自動選擇美式英文聲音。

【任務 5：發布】
- 版本號改為 1.2.0，撰寫 docs/RELEASE-1.2.md（變更摘要、資料 migration 說明、已知限制），更新 docs/TESTING.md 與 README.md。
- 更新 Service Worker 快取版本。

【完成條件】
- 單元測試：有音檔時用音檔、沒音檔時用 Web Speech；manifest 涵蓋所有卡片欄位與名字。
- E2E：在有放入測試用音檔的情況下，名字卡播放走音檔路徑。
- 全部既有測試通過。
- 回報：manifest 總列數、預估音檔總大小、仍需人工驗證的項目。
```

**你在 Phase 4 之後要做的事**：依 `docs/audio-manifest.csv` 產生音檔，放進 `public/audio/`。

- 用 TTS 服務產生時，先確認方案允許把音檔放進公開網站散布，並全程使用同一個聲音。
- 也可以請英文母語的朋友或老師錄名字的部分，最自然，但要先取得對方同意公開使用。

---

## 發布前 iPhone 真機檢查

1. 用 Safari 開網站，加入主畫面，從主畫面打開。
2. 首頁：不用捲動就看得到標題、今天的一句與六個時刻。
3. 點「準備出門」：3 張卡，第一張是穿鞋卡，播放有聲音。
4. 一起玩 → 名字怎麼念 → Triceratops、Pteranodon：正常念與慢慢念都正確。
5. 開飛航模式，重新打開 App：首頁、互動卡、名字卡、音檔都能使用。
6. 新增一則小發現筆記並分享到 LINE。
7. 用 v1.1 時期的 JSON 備份匯入，確認舊紀錄都在。
