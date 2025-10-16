import React, { useState, useEffect, useMemo } from 'react';
import {Bounce, toast } from 'react-toastify';
import type { Task } from '../types/task';
import api from '../services/api';
import TaskForm from './taskform';
import '../App.css';

type Filter = 'all' | 'done' | 'todo';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<Task[]>('/tasks');
        const data = res.data;

        const normalized = (Array.isArray(data) ? data : []).map(t => ({
          ...t,
          done: t.done ?? false,
        }));
        setTasks(normalized);
      } catch (err: unknown) {
        console.error('Failed to fetch tasks:', err);
        setError(err instanceof Error ? err.message : 'Erreur réseau');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDeleteTask = async (taskId?: string | number) => {
    if (taskId == null) {
      alert("Impossible de supprimer : id manquant.");
      return;
    }
    const snapshot = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error(err);
      alert("Suppression échouée. Restauration de la liste.");
      setTasks(snapshot);
    }
  };

  const handleEditTask = (taskId?: string | number) => {
    if (taskId == null) {
      alert("Impossible de modifier : id manquant.");
      return;
    }
    const current = tasks.find(t => t.id === taskId);
    if (!current) return;
    setEditingTask(current);
    setShowForm(true);
  };

  const toggleDone = async (task: Task) => {
    if (task.id == null) {
      alert("Action impossible : id manquant.");
      return;
    }
    const nextDone = !task.done;
    const snapshot = tasks;
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, done: nextDone } : t)));

    try {
      const res = await api.patch(`/tasks/${task.id}`, { done: nextDone });
        if (res.status == 200) {
            toast.success("État mis à jour avec succès.", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            });
        }
    } catch (err) {
      console.error(err);
      toast.warn("Mise à jour de l'état échouée. Restauration.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        });
      setTasks(snapshot);
    }
  };

  const handleFormSaved = (saved: Task) => {
    const savedNorm = { ...saved, done: saved.done ?? false };
    if (editingTask) {
      setTasks(prev => prev.map(t => (t.id === savedNorm.id ? savedNorm : t)));
      setEditingTask(null);
    } else {
      setTasks(prev => [savedNorm, ...prev]);
    }
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const filtered = useMemo(() => {
    switch (filter) {
      case 'done': return tasks.filter(t => t.done === true);
      case 'todo': return tasks.filter(t => !t.done);
      default: return tasks;
    }
  }, [tasks, filter]);

  return (
    <div>
      <h2>Liste des Tâches</h2>

      <div className='body-list'>
        <button onClick={openCreate}>Ajouter une tâche</button>

        {}
        <select
            className='filter'
          value={filter}
          onChange={e => setFilter(e.target.value as Filter)}
          aria-label="Filtrer les tâches"
        >
          <option value="all">Toutes</option>
          <option value="done">Faite</option>
          <option value="todo">Non faite</option>
        </select>
      </div>

      {showForm && (
        <TaskForm
          initialTask={editingTask ?? undefined}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          onSaved={handleFormSaved}
        />
      )}

      {loading && <p>Chargement…</p>}
      {error && <p style={{ color: 'crimson' }}>Erreur : {error}</p>}
      {!loading && tasks.length === 0 && <p>Aucune tâche disponible.</p>}

      <ul>
        {filtered.map((task) => (
          <li key={task.id ?? `${task.nom}-${task.description}`}>
            {}
            <label className="task-label">
              <input
                type="checkbox"
                checked={!!task.done}
                onChange={() => toggleDone(task)}
              />
              <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                <strong>{task.nom}</strong>: {task.description}
              </span>
            </label>

            {' '}
            <button onClick={() => handleEditTask(task.id)}>Modifier</button>
            {' '}
            <button onClick={() => handleDeleteTask(task.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
