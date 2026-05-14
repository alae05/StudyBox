import { useState, useEffect } from "react";
import "./Planner.css";

const HOURS = [];

for (let i = 0; i < 24; i++) {
  HOURS.push(i);
}

const SLOT_H = 60; 
const START_H = 0;

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTH_NAMES_SHORT = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const toPx = (t) =>
  ((toMinutes(t) - START_H * 60) / 60) * SLOT_H;

const getHeight = (s, e) =>
  Math.max(((toMinutes(e) - toMinutes(s)) / 60) * SLOT_H, 36);

const formatLabel = (d) => {
  const isToday = d.toDateString() === new Date().toDateString();
  const day = DAY_NAMES[d.getDay()].toUpperCase();
  const num = d.getDate();
  const month = MONTH_NAMES_SHORT[d.getMonth()];

  return isToday
    ? `AUJOURD'HUI — ${num} ${month}`
    : `${day} — ${num} ${month}`;
};

export default function DayTimeline({ selectedDate, tacheDay }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const isToday = selectedDate.toDateString() === now.toDateString();

  const nowPx = (now.getHours() * 60 + now.getMinutes()) / 60 * SLOT_H;

  const showNow = isToday && nowPx >= 0 && nowPx <= 24 * SLOT_H;

  return (
    <div className="timeline-card">

      <div className="timeline-date-label">
        {formatLabel(selectedDate)}
      </div>

      <div className="timeline-scroll">
        <div className="timeline-body" style={{ height: 24 * SLOT_H }}>

          {HOURS.map(h => (
            <div key={h} className="tl-row" style={{ top: h * SLOT_H }}>
              <span className="tl-hour">
                {String(h).padStart(2, "0")}h
              </span>
              <div className="tl-line" />
            </div>
          ))}

          {showNow && (
            <div className="tl-now" style={{ top: nowPx }}>
              <div className="tl-now-dot" />
              <div className="tl-now-line" />
            </div>
          )}

          <div className="tl-blocks">
            {(tacheDay || []).map(t => {
              const style = {
                top: toPx(t.start),
                height: getHeight(t.start, t.end || t.start),
                borderLeftColor: t.color,
                background: `${t.color}18`,
              };

              return (
                <div
                  key={t.id}
                  className={`tl-block ${t.done ? "tl-block--done" : ""}`}
                  style={style}
                >
                  <span
                    className="tl-block-label"
                    style={{ color: t.done ? "#aaa" : t.color }}
                  >
                    {t.start} — {t.text}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
