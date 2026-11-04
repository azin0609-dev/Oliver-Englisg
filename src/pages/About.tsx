import { ArrowRight, Heart, MessageCircle, ShieldCheck, Sprout } from 'lucide-react';
import { Garden } from '../components/Art';
export default function AboutPage() {
  return (
    <div className="about-page">
      <a href="#/" className="back-link">
        ← 回到首頁
      </a>
      <section className="brand-story-hero">
        <span className="eyebrow">OUR LITTLE WHY · 品牌說明</span>
        <h1>
          英文不用很厲害，
          <br />
          也能把陪伴說成英文。
        </h1>
        <p>
          給忙碌的 3–6 歲孩子爸媽，
          <br />
          一位隨手就能用的日常美語小幫手。
        </p>
        <Garden />
      </section>
      <section className="brand-story-copy">
        <span className="eyebrow">FOR PARENTS, WITH LOVE</span>
        <h2>
          想給孩子多一點英文，
          <br />
          從自己說得出口的一句開始。
        </h2>
        <p>
          英文程度普通，卻也想讓寶貝在生活中自然接觸美語；忙著工作、張羅三餐、照顧孩子，常常有心陪練，卻不知道這一刻可以怎麼說。
        </p>
        <p>
          Oliver’s English Adventure
          就是為這樣的爸媽準備的。我們把吃飯、刷牙、穿鞋、玩玩具和睡前擁抱，整理成簡短的美語示範、親子接話與小小動作，幫你把正在發生的日常，變成孩子聽得到、用得上的英文情境。
        </p>
        <p>
          不需要在家整天說英文，也不必先把自己練成英文老師。聽一句、試著說、陪孩子做一次，讓美語一點一點走進你們的生活。
        </p>
      </section>
      <div className="brand-values">
        {[
          {
            Icon: MessageCircle,
            title: '爸媽先安心',
            text: '有英文、中文意思、語音與接話靈感。卡住時，也知道下一句可以怎麼說。',
          },
          {
            Icon: Heart,
            title: '孩子照自己的步調',
            text: '指一指、說中文、只聽不說，都能參與。沒有排名，也不催著開口。',
          },
          {
            Icon: Sprout,
            title: '把陪伴帶回生活',
            text: '手機是爸媽的助手。說完一句，就把螢幕放一旁，和孩子真正玩在一起。',
          },
        ].map(({ Icon, title, text }) => (
          <article key={title}>
            <Icon size={26} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="brand-promise">
        <ShieldCheck size={24} />
        <p>沒有廣告、沒有兒童錄音。學習紀錄留在你的裝置，爸媽可以自己備份與保管。</p>
      </div>
      <section className="brand-ending">
        <span>一句日常，一點陪伴。</span>
        <h2>讓英文，慢慢住進生活裡。</h2>
        <a className="button primary" href="#/today">
          從今天的一句開始
          <ArrowRight size={17} />
        </a>
        <small>Oliver’s English Adventure · Oliver 的英文小冒險</small>
      </section>
    </div>
  );
}
