import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Workshops from './pages/Workshops'
import AgentBuilds from './pages/AgentBuilds'
import WhatThingsAre from './pages/WhatThingsAre'
import GdprAiSafety from './pages/GdprAiSafety'
import AuthenticityAi from './pages/AuthenticityAi'
import EnvironmentalImpact from './pages/EnvironmentalImpact'
import TechStack from './pages/TechStack'
import PeopleToFollow from './pages/PeopleToFollow'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/agent-builds" element={<AgentBuilds />} />
          <Route path="/what-things-are" element={<WhatThingsAre />} />
          <Route path="/gdpr-ai-safety" element={<GdprAiSafety />} />
          <Route path="/authenticity-and-ai" element={<AuthenticityAi />} />
          <Route path="/environmental-impact" element={<EnvironmentalImpact />} />
          <Route path="/tech-stack" element={<TechStack />} />
          <Route path="/people-to-follow" element={<PeopleToFollow />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
