import React, { useState, useEffect, useMemo } from 'react';
import { Bounce, toast } from 'react-toastify';
import type { Task } from '../types/task';
import api from '../services/api';
import TaskForm from './taskform';
import '../App.css';

type Filter = 'all' | 'done' | 'todo';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<Filter>(() => (localStorage.getItem('task_filter') as Filter) || 'all');
  const [q, setQ] = useState(''); // recherche

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
        console.error('Echec de chargement des taches:', err);
        setError(err instanceof Error ? err.message : 'Erreur réseau');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem('task_filter', filter);
  }, [filter]);

  const handleDeleteTask = async (taskId?: string | number) => {
    if (taskId == null) {
      toast.error("Impossible de supprimer : id manquant.", { position: 'top-center', transition: Bounce });
      return;
    }

    const ok = confirm('Supprimer cette tâche ?');
    if (!ok) return;

    const snapshot = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.status === 200 || res.status === 204) {
        toast.success('Tâche supprimée.', { position: 'top-center', transition: Bounce });
      } else {
        toast.error(`Suppression: statut inattendu ${res.status}`, { position: 'top-center', transition: Bounce });
        throw new Error(`Suppression: statut inattendu ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Suppression échouée. Restauration de la liste.", { position: 'top-center', transition: Bounce });
      setTasks(snapshot);
    }
  };

  const handleEditTask = (taskId?: string | number) => {
    if (taskId == null) {

      toast.error("Impossible de modifier : id manquant.", { position: 'top-center', transition: Bounce });
      return;
    }
    const current = tasks.find(t => t.id === taskId);
    if (!current) return;
    setEditingTask(current);
    setShowForm(true);
  };

  const toggleDone = async (task: Task) => {
    if (task.id == null) {
      toast.error("Action impossible : id manquant.", { position: 'top-center', transition: Bounce });
      return;
    }
    const nextDone = !task.done;
    const snapshot = tasks;
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, done: nextDone } : t)));

    try {
      const res = await api.patch(`/tasks/${task.id}`, { done: nextDone });
      if (res.status === 200 || res.status === 204) {
        toast.success("État mis à jour.", { position: "top-center", transition: Bounce });
      } else {
        toast.warn(`Mise à jour: statut inattendu ${res.status}. Restauration.`, { position: "top-center", transition: Bounce });
        throw new Error(`PATCH: statut inattendu ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Mise à jour échouée. Restauration.", { position: "top-center", transition: Bounce });
      setTasks(snapshot);
    }
  };

  const handleFormSaved = (saved: Task) => {
    const savedNorm = { ...saved, done: saved.done ?? false };
    if (editingTask) {
      setTasks(prev => prev.map(t => (t.id === savedNorm.id ? savedNorm : t)));
      setEditingTask(null);
      toast.success('Tâche mise à jour.', { position: 'top-center', transition: Bounce });
    } else {
      setTasks(prev => [savedNorm, ...prev]);
      toast.success('Tâche ajoutée.', { position: 'top-center', transition: Bounce });
    }
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  // comptages utiles
  const counts = useMemo(() => {
    const total = tasks.length;
    const done  = tasks.filter(t => t.done).length;
    const todo  = total - done;
    return { total, done, todo };
  }, [tasks]);

  // filtre + recherche
  const filtered = useMemo(() => {
    const base = filter === 'done' ? tasks.filter(t => t.done)
               : filter === 'todo' ? tasks.filter(t => !t.done)
               : tasks;

    const query = q.trim().toLowerCase();
    if (!query) return base;

    return base.filter(t =>
      (t.nom?.toLowerCase() || '').includes(query) ||
      (t.description?.toLowerCase() || '').includes(query)
    );
  }, [tasks, filter, q]);

  return (
    <div>
      <h2>Liste des Tâches</h2>

      <div className='body-list' >
        <button onClick={openCreate}>Ajouter une tâche</button>

        <select
          className='filter'
          value={filter}
          onChange={e => setFilter(e.target.value as Filter)}
          aria-label="Filtrer les tâches"
        >
          <option value="all">Toutes ({counts.total})</option>
          <option value="done">Faite ({counts.done})</option>
          <option value="todo">Non faite ({counts.todo})</option>
        </select>

        <input
          className='search'
          placeholder="Rechercher..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Rechercher par nom ou description"
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' }}
        />
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
            <label className="task-label">
              <input
                type="checkbox"
                checked={!!task.done}
                onChange={() => toggleDone(task)}
                aria-label={task.done ? 'Marquer non faite' : 'Marquer faite'}
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
