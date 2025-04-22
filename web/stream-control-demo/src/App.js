import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Viewer from './Viewer';
import { CssBaseline, Container } from '@mui/material';
import Streamer from './Streamer';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="md">
        <Routes>
          <Route path="/streamer" element={<Streamer />} />
          <Route path="/viewer" element={<Viewer />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
