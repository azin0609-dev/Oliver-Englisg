# 小日子英文 · 新 App 圖示

版本：1.1.2。使用者在 Phase 0 完成後明確要求新的 App 圖示；這次只更新品牌圖片與安裝引用，不進入 Phase 1，也不改教材或學習紀錄。

<img src="../../public/little-moments-icon-512.png" alt="奶油白底色，大恐龍陪小恐龍一起讀繪本，旁邊有小太陽與對話泡泡" width="240" />

## 圖稿與匯出

新圖稿由本次圖像生成工具依品牌需求產生，原始 PNG 保存在 `little-moments-icon-source.png`。App 執行時只載入打包在站內的圖片，不呼叫任何圖片或 AI API，也沒有新增套件。

既有 Chromium 匯出流程只做尺寸轉換；沒有在匯出時重新創作或替換圖稿。執行：

```sh
npm run icons
npm run build
```

| 用途             | 新檔名                                 | 尺寸      |
| ---------------- | -------------------------------------- | --------- |
| PWA／favicon     | `little-moments-icon-192.png`          | 192 × 192 |
| PWA              | `little-moments-icon-512.png`          | 512 × 512 |
| iPhone 主畫面    | `little-moments-apple-touch-icon.png`  | 180 × 180 |
| Android maskable | `little-moments-icon-maskable-512.png` | 512 × 512 |

Maskable 版本保留額外邊距。舊的四個 PNG 檔名仍提供相同的新圖稿，以相容可能請求舊網址的捷徑；舊 `icon.svg` 保留供歷史連結使用，新版 favicon 已改用新 PNG。Manifest id／scope／start_url 與 localStorage／備份識別皆未變更。建置會依完整產物內容產生新的 SW 快取版本。

## iPhone 取得新圖示

1. 在原 App 的設定頁先匯出 JSON 備份。
2. 用 Safari 打開 <https://azin0609-dev.github.io/Oliver-Englisg/>，若看到「更新 App」先更新。設定頁可確認版本 1.1.2。
3. 點「分享」→「加入主畫面」，名稱填「小日子英文」。
4. 先保留舊圖示，確認新入口的資料。若 Safari／主畫面容器的資料不共用，可在新入口匯入備份。

iOS 可能保留已加入圖示的名稱與圖片；網站部署成功不能保證舊圖示會自動換圖。不要為了換圖清除網站資料。實體 iPhone 的圖示顯示仍需使用者確認。

## 驗證

維持 36 項單元測試與 26 項行動尺寸 E2E。原有 PWA 測試新增 PNG 簽章與真實尺寸檢查，涵蓋 Manifest 圖片與 iPhone touch icon；既有離線重開、SW 更新與資料保留測試繼續執行。
