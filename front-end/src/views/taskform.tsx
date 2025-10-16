import React, { useEffect, useState } from 'react';
import {Bounce, toast } from 'react-toastify';
import type { Task } from '../types/task';
import api from '../services/api';
import '../App.css';

interface TaskFormProps {
  onClose: () => void;
  onSaved?: (saved: Task) => void;
  initialTask?: Task;
}

const emptyTask: Task = { nom: '', description: '' };

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSaved, initialTask }) => {
  const [task, setTask] = useState<Task>(initialTask ?? emptyTask);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTask(initialTask ?? emptyTask);
  }, [initialTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nom = task.nom?.trim();
    const description = task.description?.trim();
    if (!nom || !description) {
      toast.error('Veuillez remplir le nom et la description.');
      
      return;
    }

    setLoading(true);
    try {
      let res;
      if (initialTask?.id != null) {
        
        res = await api.put<Task>(`/tasks/${initialTask.id}`, { nom, description });
      } else {
        
        res = await api.post<Task>('/tasks', { nom, description });
      }

      const saved = res.data;
      onSaved?.(saved);
      setTask(emptyTask);
      toast.success('Tâche enregistrée avec succès', {
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
       
       onClose();
    } catch (err: unknown) {
      console.error(err);
      let msg = 'Erreur lors de la soumission';

      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      if (typeof err === 'object' && err !== null) {
        const apiErr = err as ApiError;
        if (apiErr.response && apiErr.response.data) {
          msg = apiErr.response.data.message || apiErr.message || msg;
        } else if (apiErr.message) {
          msg = apiErr.message || msg;
        }
      }
      alert('Erreur: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = initialTask?.id != null;

  return (
    <div className='body-form'>
      <h3>{isEdit ? 'Modifier la tâche' : 'Ajouter une tâche'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nom">Nom:</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={task.nom}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className='footer'>
            <button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            
            <button onClick={onClose} disabled={loading}>Fermer</button>

        </div>
      </form>

    </div>
  );
};

export default TaskForm;
