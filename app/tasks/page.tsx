"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, CheckCircle2, Circle, Clock, Tag, AlertCircle } from "lucide-react";
import { vibrate } from "../lib/db";

// Mock data following your JEE subject requirements
const INITIAL_TASKS = [
  { id: "1", title: "Solve HCV Kinematics Ex 1-10", subject: "Physics", priority: "High", status: "todo" },
  { id: "2", title: "Inorganic Chemistry: P-Block Notes", subject: "Chemistry", priority: "Medium", status: "doing" },
  { id: "3", title: "Practice Integration PYQs", subject: "Maths", priority: "Low", status: "done" },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleComplete = (id: string) => {
    vibrate(20); // Haptic feedback on completion
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 pb-24"
    >
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-monk-textMain tracking-tight">Tasks</h1>
          <p className="text-sm text-monk-muted font-medium">Structure your day.</p>
        </div>
        <button 
          onClick={() => vibrate(40)}
          className="matte-btn p-3 shadow-matte"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Task List - Grouped by Status */}
      <div className="space-y-8">
        {["todo", "doing", "done"].map((group) => (
          <section key={group} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <span className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em]">
                {group}
              </span>
              <div className="h-[1px] flex-1 bg-monk-sand/50" />
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.status === group).map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  className={`matte-card p-4 flex items-center gap-4 transition-opacity ${task.status === 'done' ? 'opacity-60' : 'opacity-100'}`}
                >
                  <button onClick={() => toggleComplete(task.id)} className="flex-shrink-0">
                    {task.status === "done" ? (
                      <CheckCircle2 className="text-monk-olive" size={24} />
                    ) : (
                      <Circle className="text-monk-sand" size={24} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-monk-textMain truncate ${task.status === 'done' ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 bg-monk-bg px-2 py-0.5 rounded-full">
                        <Tag size={10} className="text-monk-muted" />
                        <span className="text-[10px] font-bold text-monk-dark">{task.subject}</span>
                      </div>
                      {task.priority === "High" && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle size={10} />
                          <span className="text-[10px] font-bold uppercase">High</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
                        }

