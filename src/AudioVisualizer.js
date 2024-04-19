import React, { useState, useEffect, useRef } from 'react';

const AudioVisualizer = () => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);
  const [analyserNode, setAnalyserNode] = useState(null);
  const [beatDetected, setBeatDetected] = useState(false);
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
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();

      setSourceNode(source);
      setAnalyserNode(analyser);
      setIsPlaying(true);
    }
  };

  const drawVisualizer = () => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      const drawVisuals = requestAnimationFrame(draw);

      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const detectBeat = () => {
    if (!analyserNode) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const beatDetection = () => {
      const beatData = requestAnimationFrame(beatDetection);

      analyserNode.getByteTimeDomainData(dataArray);
      const average = getAverageVolume(dataArray);

      if (average > 180) {
        setBeatDetected(true);
      } else {
        setBeatDetected(false);
      }
    };

    beatDetection();
  };

  const getAverageVolume = (dataArray) => {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    return sum / dataArray.length;
  };

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
      detectBeat();
    }
  }, [isPlaying, audioBuffer]);

  return (
    <div>
      <input type="file" accept="audio/mp3" onChange={handleFileChange} />
      <button onClick={togglePlayback}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <canvas ref={canvasRef} width={800} height={300} />
      {beatDetected}
    </div>
  );
};

export default AudioVisualizer;
