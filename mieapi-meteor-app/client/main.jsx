import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginForm from '../client/components/LoginForm.jsx';
import HomePage from '../client/components/HomePage.jsx';
import AuthCallback from '../client/components/AuthCallback.jsx';
import LoginFormNew from '../client/components/LoginFormNew.jsx';
import WelcomePage from '../client/components/WelcomePage.jsx';
import HomePageNew from '../client/components/HomePageNew.jsx';
import IntegrationsPage from '../client/components/IntegrationsPage.jsx';
import DashboardPage from '../client/components/DashboardPage.jsx'



Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);

  root.render(
    <Router>
      <Routes>
        <Route path="/loginold" element={<LoginForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/callback" element={<AuthCallback />} /> 
        <Route path="/loginNew" element={<LoginFormNew />} /> 
        <Route path="/" element={<WelcomePage />} /> 
        <Route path="/homenew" element={<HomePageNew />} /> 
        <Route path="/integration" element={<IntegrationsPage />} /> 
        <Route path='/dashboard' element ={<DashboardPage/>} /> 
      </Routes>
    </Router>
  );
});
