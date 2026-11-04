import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchMaterials } from '../lib/recommendations';
import { useApp } from '../lib/context';
import { materialById } from '../data';
import { EmptyState, MaterialCard, PageHeading } from '../components/Cards';
export function SearchPage({ query }: { query: string }) {
  const { data } = useApp();
  const [value, setValue] = useState(query);
  const [limit, setLimit] = useState(20);
  const results = useMemo(() => searchMaterials(query), [query]);
  return (
    <div>
      <PageHeading
        eyebrow="FIND THE WORDS FOR THIS MOMENT"
        title={`現在，想跟 ${data.settings.nickname} 說什麼？`}
        description="中文、英文都可以。從內建教材裡，找一句自然的說法。"
      />
      <form
        className="home-search standalone-search"
        onSubmit={(e) => {
          e.preventDefault();
          setLimit(20);
          location.hash = `/search?q=${encodeURIComponent(value.trim())}`;
        }}
      >
        <Search size={21} />
        <input
          autoFocus
          value={value}
          aria-label="搜尋生活英文"
          placeholder="試試：快去刷牙、dinosaur…"
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
          <button
            type="button"
            aria-label="清除搜尋"
            onClick={() => {
              setValue('');
              location.hash = '/search';
            }}
          >
            <X size={18} />
          </button>
        )}
        <button type="submit" className="search-submit">
          搜尋
        </button>
      </form>
      {!query && (
        <div className="search-suggestions">
          <span>從這些生活時刻開始：</span>
          {['快去刷牙', '不要丟玩具', '你想吃什麼', '把恐龍放回盒子', 'Are you hungry?'].map(
            (q) => (
              <button
                key={q}
                onClick={() => {
                  setValue(q);
                  location.hash = `/search?q=${encodeURIComponent(q)}`;
                }}
              >
                {q}
              </button>
            ),
          )}
        </div>
      )}
      {query && (
        <p className="results-count">
          「{query}」找到 {results.length} 筆教材
        </p>
      )}
      <div className="card-stack">
        {results.slice(0, limit).map((m) => (
          <MaterialCard item={m} key={m.id} />
        ))}
      </div>
      {query && results.length === 0 && (
        <EmptyState
          title="這句話，教材裡還沒收錄。"
          description="試試更短的關鍵字，例如「刷牙」、「玩具」或「hungry」。這裡是內建教材搜尋，暫時不提供即時翻譯。"
        />
      )}
      {results.length > limit && (
        <button className="button secondary load-more" onClick={() => setLimit(limit + 20)}>
          再看 20 筆
        </button>
      )}
    </div>
  );
}
export function FavoritesPage() {
  const { data } = useApp();
  const favorites = Object.entries(data.records)
    .filter(([, r]) => r.favorite)
    .map(([id]) => materialById[id])
    .filter(Boolean);
  return (
    <div>
      <PageHeading
        eyebrow="WORDS YOU WANT TO KEEP CLOSE"
        title="我的收藏小口袋"
        description={`把常用的英文放這裡，下次需要就找得到。共 ${favorites.length} 筆。`}
      />
      {favorites.length ? (
        <div className="card-stack">
          {favorites.map((m) => (
            <MaterialCard item={m} key={m.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="收藏第一句，帶進生活裡。"
          description="點教材右上角的書籤，就能把喜歡的英文收進小口袋。離線也可以看。"
          href="#/topics"
          label="找一句喜歡的英文"
        />
      )}
    </div>
  );
}
