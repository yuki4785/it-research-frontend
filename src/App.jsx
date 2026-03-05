import { useState, useEffect } from "react";
import "./App.css";

const BASE = "http://localhost:8001";

const SOURCE_BADGE = {
  "はてなブックマーク": "badge-hatena",
  "Hacker News":        "badge-hn",
  "Reddit":             "badge-reddit",
  "Aikido Security":    "badge-aikido",
  "Wiz Research":       "badge-wiz",
};

export default function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [data, setData] = useState(null);
  const [activeSource, setActiveSource] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/dates`).then(r => r.json()).then(ds => {
      setDates(ds);
      if (ds.length > 0) setSelectedDate(ds[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setData(null);
    fetch(`${BASE}/articles/${selectedDate}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [selectedDate]);

  const sources = data?.sources ?? [];
  const visibleSources = activeSource === "ALL"
    ? sources
    : sources.filter(s => s.name === activeSource);

  const formatDate = (d) => {
    const [, m, day] = d.split("-");
    return `${parseInt(m)}/${parseInt(day)}`;
  };

  return (
    <div>
      <header className="app-header">
        <h1>IT Research</h1>
        <div className="date-tabs">
          {dates.map(d => (
            <button
              key={d}
              className={`date-tab${selectedDate === d ? " active" : ""}`}
              onClick={() => setSelectedDate(d)}
            >
              {formatDate(d)}
            </button>
          ))}
        </div>
      </header>

      {data && (
        <div className="source-filter">
          <button
            className={`source-btn${activeSource === "ALL" ? " active" : ""}`}
            onClick={() => setActiveSource("ALL")}
          >
            すべて ({sources.reduce((n, s) => n + s.items.length, 0)})
          </button>
          {sources.map(s => (
            <button
              key={s.name}
              className={`source-btn${activeSource === s.name ? " active" : ""}`}
              onClick={() => setActiveSource(s.name)}
            >
              {s.name} ({s.items.length})
            </button>
          ))}
        </div>
      )}

      <main className="app-main">
        {loading && <p className="empty">読み込み中...</p>}
        {!loading && !data && <p className="empty">日付を選択してください</p>}

        {visibleSources.map(source => (
          <div key={source.name} className="source-section">
            <div className="source-title">{source.name}</div>
            {source.items.map((item, i) => (
              <div key={i} className="article-card">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                {item.summary
                  ? <p className="article-summary">{item.summary}</p>
                  : <p className="no-summary">要約なし</p>
                }
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
