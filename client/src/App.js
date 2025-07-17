import React from 'react';
import { useSelector } from 'react-redux';
import RoleSelection from './components/RoleSelection';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import KickedScreen from './components/KickedScreen';
import StudentNameEntry from './components/StudentNameEntry';

function App() {
  const { role, kicked, name } = useSelector(state => state.user);

  if (kicked) return <KickedScreen />;
  if (!role) return <RoleSelection />;
  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'student') {
    if (!name) return <StudentNameEntry />;
    return <StudentDashboard />;
  }
  return null;
}

export default App;
