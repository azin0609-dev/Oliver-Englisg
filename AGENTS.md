# 小日子英文 · Little Moments

產品現名為「小日子英文／Little Moments」。歷史文件裡的 Oliver's English Adventure 是同一個專案，不得把品牌改回舊名；孩子的顯示暱稱仍由家長自行設定。

目前工作位於 `v1.2`，從 `codex/oliver-english-adventure` 的品牌更新基準建立。請讀 README.md、docs/RELEASE-1.1.md、docs/TESTING.md 與 docs/codex-v1.2.md。

## 階段邊界

- 這一輪只執行 `docs/codex-v1.2.md` 的 Phase 0。完成後回報並停止，不得自行進入 Phase 1。
- Phase 1–4 各有家長的人工審核與真機驗收；需要後續明確指令才能進入下一階段。
- Phase 0 不更動既有教材與既有使用流程；只新增守則、內容盤點報告、隱藏語音檢測頁與設定頁底部的小字入口。
- 英文改寫建議只能放在盤點報告，不能直接替換教材。
- 後續使用者已明確要求新的 App 圖示；可更新品牌圖片、安裝引用及發布產物，不代表進入 Phase 1。
- 使用這個隔離環境中的既有 checkout。除非使用者明確要求，不建立 Git worktree。

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

## 相容性與驗證

- 保留 `oliver-adventure-v1` 儲存鍵、備份 app 識別、PWA id／scope 與既有路由，避免品牌更新影響家長資料。
- 沿用既有套件與語音管理器。檢測結果只留在畫面記憶體，由家長自行複製，不做上傳或本機儲存。
- `npm run build` 由產物內容雜湊產生 Service Worker 快取版本。不得使用固定版本，也不得刪除學習資料。
- 執行 `npm run typecheck`、`npm test`、`npm run build`、`npm run test:e2e`，確認既有測試與新增測試確實執行。
- Chromium 行動尺寸模擬與語音替身測試不等於 iPhone 真機聽感；未驗證的項目要明確標示。
