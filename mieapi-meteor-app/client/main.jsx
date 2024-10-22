import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginForm from '../client/components/LoginForm.jsx';
import HomePage from '../client/components/HomePage.jsx';
import AuthCallback from '../client/components/AuthCallback.jsx';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);

  root.render(
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/callback" element={<AuthCallback />} /> 
      </Routes>
    </Router>
  );
});
