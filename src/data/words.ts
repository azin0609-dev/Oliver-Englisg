import type { CategoryId, Material } from '../types';
import { categoryById } from './categories';
const entries: Record<CategoryId, string> = {
  morning: `morning|早晨
sun|太陽
bed|床
pillow|枕頭
blanket|毯子
window|窗戶
curtain|窗簾
light|光
face|臉
stretch|伸展
wake up|醒來
breakfast|早餐`,
  wash: `toothbrush|牙刷
toothpaste|牙膏
teeth|牙齒
soap|肥皂
water|水
towel|毛巾
bath|泡澡
bubbles|泡泡
hands|雙手
fingers|手指
hair|頭髮
clean|乾淨的`,
  food: `apple|蘋果
banana|香蕉
noodles|麵
rice|飯
milk|牛奶
bread|麵包
egg|蛋
carrot|紅蘿蔔
spoon|湯匙
fork|叉子
plate|盤子
cup|杯子`,
  outside: `shirt|上衣
pants|長褲
shoes|鞋子
socks|襪子
hat|帽子
jacket|外套
backpack|背包
door|門
umbrella|雨傘
rain|雨
zipper|拉鍊
boots|靴子`,
  toys: `dinosaur|恐龍
T. rex|暴龍
Triceratops|三角龍
Stegosaurus|劍龍
car|車子
blue|藍色
orange|橘色
magnet|磁鐵
coin|硬幣
cash register|收銀機
chair|椅子
playpen|遊戲圍欄
letter|字母
red|紅色
yellow|黃色
green|綠色
block|積木
ball|球`,
  park: `tree|樹
leaf|葉子
flower|花
bird|鳥
butterfly|蝴蝶
ant|螞蟻
grass|草
rock|石頭
slide|溜滑梯
swing|鞦韆
jump|跳
run|跑`,
  tidy: `box|盒子
basket|籃子
shelf|架子
book|書
toy|玩具
floor|地板
table|桌子
bag|袋子
inside|裡面
under|下面
big|大的
small|小的`,
  feelings: `happy|開心的
sad|難過的
angry|生氣的
tired|累的
hungry|餓的
thirsty|渴的
scared|害怕的
hug|擁抱
help|幫忙
please|請
thank you|謝謝
sorry|對不起`,
  friends: `friend|朋友
brother|兄弟
sister|姊妹
share|分享
turn|輪到的機會
wait|等待
together|一起
gentle|溫柔的
hand|手
puzzle|拼圖
giraffe|長頸鹿
elephant|大象`,
  bedtime: `moon|月亮
star|星星
night|夜晚
story|故事
sleep|睡覺
dream|夢
bear|熊
rabbit|兔子
cat|貓
dog|狗
quiet|安靜的
love|愛`,
};
export const words: Material[] = Object.entries(entries).flatMap(([category, rows]) =>
  rows.split('\n').map((row, index) => {
    const [english, traditionalChinese] = row.split('|');
    return {
      id: `word-${category}-${index + 1}`,
      category: category as CategoryId,
      difficulty: index < 8 ? 1 : 2,
      english,
      traditionalChinese,
      parentTip: `${categoryById[category as CategoryId].tip} 指著實物或做動作示範「${traditionalChinese}」，不必要求背誦。`,
      suggestedReply: english,
      tags: [
        category,
        traditionalChinese,
        english,
        ...(category === 'toys' && index < 4 ? ['恐龍', 'dinosaur'] : []),
      ],
    };
  }),
);
