import React from 'react';
import { HashRouter  as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { DefectsPage } from './pages/DefectsPage';
import { DefectDetailPage } from './pages/DefectDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="defects" element={<DefectsPage />} />
          <Route path="defects/:id" element={<DefectDetailPage />} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings Page</h1><p>Settings functionality coming soon...</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;