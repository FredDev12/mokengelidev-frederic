// index.js (Express)
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,               
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());


const tasks = [
    { id: 1, nom: 'Task 1', description: 'Desc 1' , done: false},
    { id: 2, nom: 'Task 2', description: 'Desc 2' , done: false},
    { id: 3, nom: 'Task 3', description: 'Desc 3' , done: true},
  ];

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.post('/api/tasks', (req, res) => {
  console.log(req.body);
  const task = req.body ?? {};
  task.id = tasks.length + 1;
  task.done = task.done ?? false;
  tasks.push(task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  
  const { id } = req.params;
  const task = tasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({ message: 'Task non trouvé' });
  }
  task.done = !task.done;
  res.status(200).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task non trouvé' });
  }
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

app.get('/api/tasks', (_, res) => {
  res.json(tasks);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task non trouvé' });
  }
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
