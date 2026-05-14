import "./Planner.css";

const DAYS_HEADER = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startCalend = (firstDay.getDay() + 6) % 7;

  const grid = [];

  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startCalend + 1;
    const date = new Date(year, month, dayNumber);

    grid.push({
      day: date.getDate(),
      current: date.getMonth() === month,
      date: date,
    });
  }

  return grid;
}

export default function MonthCalendar({ selectedDate, tacheDay, onSelect }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const today = new Date();
  const grid = getMonthGrid(year, month);

  function prevMonth() {
    const d = new Date(year, month - 1, 1);
    onSelect(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function nextMonth() {
    const d = new Date(year, month + 1, 1);
    onSelect(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  const isSameDate = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="cal-card">

      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="cal-month-title">{MONTH_NAMES[month]} {year}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="cal-grid">
        {DAYS_HEADER.map(day => (
          <div key={day} className="cal-day-header">{day}</div>
        ))}

        {grid.map((cell, i) => {
          const date = cell.date;
          const key = date.toDateString();

          const isSelected = cell.current && isSameDate(date, selectedDate);
          const isToday = cell.current && isSameDate(date, today);
          const hasTasks = cell.current && tacheDay?.[key]?.length > 0;

          return (
            <div
              key={i}
              className={`cal-day ${!cell.current ? "cal-day--other" : ""} ${isSelected ? "cal-day--selected" : ""} ${isToday && !isSelected ? "cal-day--today" : ""}`}
              onClick={() => cell.current && onSelect(date)}
            >
              {cell.day}
              {hasTasks && !isSelected && <span className="cal-day-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
