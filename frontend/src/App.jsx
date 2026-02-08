import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import AddAgent from './pages/AddAgent';
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/add-agent" element={<AddAgent />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
