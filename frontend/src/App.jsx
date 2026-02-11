import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from '@/components/Layout';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import AddAgent from './pages/AddAgent';
import AgentProfile from './pages/AgentProfile';
import ScrollGame from './pages/ScrollGame';
import Leaderboards from './pages/Leaderboards';
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/add-agent" element={<AddAgent />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/agent/:id" element={<AgentProfile />} />
          <Route path="/scroll/:agentId" element={<ScrollGame />} />
        </Routes>
      </Layout>
      <Analytics beforeSend={(event) => {
        if (event.url.includes('localhost') || event.url.includes('127.0.0.1')) {
          return null;
        }
        return event;
      }} />
    </Router>
  );
}

export default App;
