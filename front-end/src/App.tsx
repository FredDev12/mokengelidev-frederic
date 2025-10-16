import { useEffect, useState } from 'react';
import './App.css';
import TaskList from './views/tasklist';
import Users from './views/users';

type Page = 'tasklist' | 'users';

function App() {
  const [page, setPage] = useState<Page>(() => {
    
    const saved = localStorage.getItem('page');
    return (saved as Page) || 'tasklist';
  });

  useEffect(() => {
    localStorage.setItem('page', page);
  }, [page]);

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: '#1976d2',
          color: 'white',
          fontSize: '1.1rem',
        }}
      >
        <nav aria-label="Navigation principale" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            aria-current={page === 'tasklist' ? 'page' : undefined}
            style={{
              padding: '0.5rem 1rem',
              background: page === 'tasklist' ? '#1565c0' : 'white',
              color: page === 'tasklist' ? 'white' : '#1976d2',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() => setPage('tasklist')}
          >
            Task List
          </button>
          <button
            aria-current={page === 'users' ? 'page' : undefined}
            style={{
              padding: '0.5rem 1rem',
              background: page === 'users' ? '#1565c0' : 'white',
              color: page === 'users' ? 'white' : '#1976d2',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() => setPage('users')}
          >
            Users
          </button>
        </nav>
      </header>

      <main style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
        {page === 'tasklist' ? <TaskList /> : <Users />}
      </main>
    </div>
  );
}

export default App;
