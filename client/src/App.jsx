import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import JudgeDashboard from './pages/JudgeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      {/* Header is outside Routes to show on all pages (or conditionally render) */}
      <div className="min-h-screen bg-uaGray">
        <Header />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/judge" element={<JudgeDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;