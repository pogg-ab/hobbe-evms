import React from 'react';
import StreamController from './StreamController';
import { CssBaseline, Container } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <StreamController />
      </Container>
    </>
  );
}

export default App;