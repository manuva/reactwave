import logo from './logo.svg';
import './App.css';
import React from 'react';
import AudioVisualizer from './AudioVisualizer'; // assuming AudioVisualizer is in a file named AudioVisualizer.js

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>MP3 Audio Visualizer</h1>
        <AudioVisualizer />
      </header>
      <main>
      </main>
    </div>
  );
}

export default App;

