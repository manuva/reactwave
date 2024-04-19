import React, { useState, useRef } from 'react';

const AudioVisualizer = () => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);
  const canvasRef = useRef(null);

  const handleFileChange = async (e) => {
    e.preventDefault(); // Prevent page reload

    const file = e.target.files[0];
    if (!file) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const audioData = event.target.result;
        const buffer = await audioContext.decodeAudioData(audioData);
        setAudioBuffer(buffer);
        setAudioContext(audioContext);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error decoding audio file:', error);
    }
  };

  const togglePlayback = () => {
    if (!audioBuffer || !audioContext) return;

    if (isPlaying) {
      sourceNode.stop();
      setIsPlaying(false);
    } else {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      setSourceNode(source);
      setIsPlaying(true);
    }
  };

  const drawWaveform = () => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();
  };

  // Automatically draw waveform when audioBuffer changes
  React.useEffect(() => {
    if (audioBuffer) {
      drawWaveform();
    }
  }, [audioBuffer]);

  return (
    <div>
      <input type="file" accept="audio/mp3" onChange={handleFileChange} />
      <canvas ref={canvasRef} width={800} height={300} />
      <button onClick={togglePlayback}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AudioVisualizer;
