import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory data structures (swap for DB for prod)
let currentQuestion = null;
let pollResults = {};
let students = {}; // { socketId: { name, answered, joinedAt } }
let pollHistory = []; // [{ question, options, results, timestamp }]
let chatHistory = []; // [{ sender, message, timestamp }]
let pollTimer = 60; // seconds (default)
let pollTimeout = null;
let teacherSocketId = null;

function resetPollTimeout() {
  if (pollTimeout) clearTimeout(pollTimeout);
  pollTimeout = null;
}

io.on('connection', (socket) => {
  // Join event
  socket.on('join', ({ role, name }) => {
    socket.data.role = role;
    socket.data.name = name;
    if (role === 'teacher') {
      teacherSocketId = socket.id;
      socket.emit('history', pollHistory);
      // Send current students list to teacher
      socket.emit('students', Object.values(students));
    } else if (role === 'student') {
      students[socket.id] = { name, answered: false, joinedAt: Date.now() };
      io.emit('students', Object.values(students));
      socket.emit('history', pollHistory);
      if (currentQuestion) {
        socket.emit('new-question', currentQuestion);
      }
    }
    // Always emit students list after any join
    console.log('Emitting students list:', Object.values(students));
    io.emit('students', Object.values(students));
  });

  // Teacher asks a question
  socket.on('ask-question', ({ question, options, timer }) => {
    if (socket.data.role !== 'teacher') return;
    currentQuestion = { question, options, askedAt: Date.now(), timer: timer || pollTimer };
    pollResults = {};
    Object.keys(students).forEach(id => students[id].answered = false);
    io.emit('new-question', currentQuestion);
    resetPollTimeout();
    pollTimeout = setTimeout(() => {
      pollHistory.push({ ...currentQuestion, results: { ...pollResults }, timestamp: Date.now() });
      io.emit('poll-complete', pollResults);
      currentQuestion = null;
    }, (timer || pollTimer) * 1000);
  });

  // Student answers
  socket.on('answer', (answer) => {
    if (!currentQuestion || !students[socket.id] || students[socket.id].answered) return;
    pollResults[answer] = (pollResults[answer] || 0) + 1;
    students[socket.id].answered = true;
    io.emit('poll-results', pollResults);
    // Check if all students have answered
    if (Object.values(students).length > 0 && Object.values(students).every(s => s.answered)) {
      pollHistory.push({ ...currentQuestion, results: { ...pollResults }, timestamp: Date.now() });
      io.emit('poll-complete', pollResults);
      currentQuestion = null;
      resetPollTimeout();
    }
  });

  // Teacher can kick a student
  socket.on('kick-student', (name) => {
    if (socket.data.role !== 'teacher') return;
    const id = Object.keys(students).find(id => students[id].name === name);
    if (id) {
      io.to(id).emit('kicked');
      delete students[id];
      io.emit('students', Object.values(students));
    }
  });

  // Chat support
  socket.on('chat-message', (msg) => {
    const chatMsg = { sender: socket.data.name, message: msg, timestamp: Date.now() };
    chatHistory.push(chatMsg);
    io.emit('chat-message', chatMsg);
  });
  socket.on('get-chat-history', () => {
    socket.emit('chat-history', chatHistory);
  });

  // Teacher or student requests poll history
  socket.on('get-history', () => {
    socket.emit('history', pollHistory);
  });

  // Disconnect logic
  socket.on('disconnect', () => {
    if (socket.data.role === 'student') {
      delete students[socket.id];
      io.emit('students', Object.values(students));
    } else if (socket.data.role === 'teacher') {
      teacherSocketId = null;
      // Optionally: auto-end poll if teacher disconnects
      resetPollTimeout();
      currentQuestion = null;
      io.emit('poll-complete', pollResults);
    }
  });
});

// REST endpoint for poll history
app.get('/api/history', (req, res) => {
  res.json(pollHistory);
});

app.get('/', (req, res) => {
  res.send('Intervue Poll backend running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
