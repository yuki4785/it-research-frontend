import { useState, useEffect } from "react";
import "./App.css";

const BASE = "http://localhost:8001";

const MONTH_LABEL = (m) => {
  const [y, mo] = m.split("-");
  return `${y}年${parseInt(mo)}月`;
};

const formatDay = (d) => {
  const [, m, day] = d.split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
};

export default function App() {
  const [months, setMonths] = useState({});       // { "2026-03": ["2026-03-05", ...] }
  const [openMonths, setOpenMonths] = useState({}); // { "2026-03": true }
  const [selectedDate, setSelectedDate] = useState(null);
  const [data, setData] = useState(null);
  const [activeSource, setActiveSource] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/months`).then(r => r.json()).then(m => {
      setMonths(m);
      // 最新月だけ開く
      const latest = Object.keys(m).sort().reverse()[0];
      if (latest) {
        setOpenMonths({ [latest]: true });
        setSelectedDate(m[latest][0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setData(null);
    setActiveSource("ALL");
    fetch(`${BASE}/articles/${selectedDate}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [selectedDate]);

  const toggleMonth = (month) =>
    setOpenMonths(prev => ({ ...prev, [month]: !prev[month] }));

  const sources = data?.sources ?? [];
  const visibleSources = activeSource === "ALL"
    ? sources
    : sources.filter(s => s.name === activeSource);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-title">IT Research</div>
        {Object.entries(months).sort(([a], [b]) => b.localeCompare(a)).map(([month, dates]) => (
          <div key={month} className="month-group">
            <button className="month-header" onClick={() => toggleMonth(month)}>
              <span className="month-arrow">{openMonths[month] ? "▾" : "▸"}</span>
              {MONTH_LABEL(month)}
              <span className="month-count">{dates.length}</span>
            </button>
            {openMonths[month] && (
              <div className="month-dates">
                {dates.map(d => (
                  <button
                    key={d}
                    className={`day-item${selectedDate === d ? " active" : ""}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    {formatDay(d)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="main-col">
        {/* Source filter */}
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
          {!loading && !data && !selectedDate && <p className="empty">日付を選択してください</p>}

          {selectedDate && data && (
            <div className="date-heading">{selectedDate}</div>
          )}

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
    </div>
  );
}
