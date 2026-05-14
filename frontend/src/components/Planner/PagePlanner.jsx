import { useState, useEffect } from "react";
import SideBar from "../SideBar";
import MonthCalendar from "./MonthCalendar";
import DayTimeline from "./DayTimeline";
import TaskPanel from "./TaskPanel";
import "../Dashboard/Dashboard.css";
import "./Planner.css";
import HeaderDashboard from "../Dashboard/HeaderDashboard";

import { getTasks, createTask, toggleTask, deleteTask } from "../../api/api";
import { getModules } from "../../api/api";


export default function PagePlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks]               = useState([]);
  const [tasksByDay, setTasksByDay]     = useState({});
  const [modules, setModules]           = useState([]);  
  const [loading, setLoading]           = useState(false);

  const dayKey  = selectedDate.toDateString();
  const isToday = dayKey === new Date().toDateString();

  useEffect(() => {
    getModules()
      .then(setModules)
      .catch(err => console.error("Erreur chargement modules :", err));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getTasks(dayKey);
        setTasks(data);
        setTasksByDay(prev => ({ ...prev, [dayKey]: data }));
      } catch (err) {
        console.error("Erreur chargement tâches :", err);
      }
      setLoading(false);
    }
    load();
  }, [dayKey]);

  async function handleAdd(task) {
    const tempId   = `temp-${Date.now()}`;
    const tempTask = { ...task, id: tempId, done: false, dayKey };
    setTasks(prev => [...prev, tempTask]);
    setTasksByDay(prev => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] || []), tempTask],
    }));

    try {
      const newTask = await createTask({ ...task, dayKey });
      setTasks(prev => prev.map(t => t.id === tempId ? newTask : t));
      setTasksByDay(prev => ({
        ...prev,
        [dayKey]: (prev[dayKey] || []).map(t => t.id === tempId ? newTask : t),
      }));
    } catch (err) {
      console.error("Erreur création tâche :", err);
      setTasks(prev => prev.filter(t => t.id !== tempId));
      setTasksByDay(prev => ({
        ...prev,
        [dayKey]: (prev[dayKey] || []).filter(t => t.id !== tempId),
      }));
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleTask(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      setTasksByDay(prev => ({
        ...prev,
        [dayKey]: (prev[dayKey] || []).map(t => t.id === id ? updated : t),
      }));
    } catch (err) {
      console.error("Erreur toggle tâche :", err);
    }
  }

  async function handleDelete(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTasksByDay(prev => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter(t => t.id !== id),
    }));
    try {
      await deleteTask(id);
    } catch (err) {
      console.error("Erreur suppression tâche :", err);
      const data = await getTasks(dayKey);
      setTasks(data);
      setTasksByDay(prev => ({ ...prev, [dayKey]: data }));
    }
  }

  return (
    <div className="planner-layout">
      <SideBar />
      <div className="page-root">
        <HeaderDashboard title="Planner" />
        <div className="page-body">
          <div className="page-left">
            <MonthCalendar
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              tacheDay={tasksByDay}
            />
            <DayTimeline
              selectedDate={selectedDate}
              tacheDay={tasks}
            />
          </div>

          <TaskPanel
            tasks={tasks}
            modules={modules}
            onAdd={handleAdd}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}