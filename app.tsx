// LICENSE : MIT

import React, { useState, useEffect } from "https://cdn.skypack.dev/react@18.2.0?dts";
import ReactDOM from "https://cdn.skypack.dev/react-dom@18.2.0?dts";
import { useWindowSize } from './components/useWindowSize.ts';
import { useDeviceOrientation } from './components/useDeviceOrientation.ts';

const limit90 = (angle: number) => Math.min(Math.max(angle, -90), 90);

function App() {
  const [width, height] = useWindowSize();
  const { orientation, requestAccess } = useDeviceOrientation();
  const top = orientation ? (limit90(orientation.beta) / 90 + 1) * height / 2 : height;
  const left = orientation ? (limit90(orientation.gamma) / 90 + 1) * width / 2 : width;

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioCtx1, setAudioCtx1] = useState();
  const [panNode1, setPanNode1] = useState();
  const [gainNode1, setGainNode1] = useState();
  const [audioCtx2, setAudioCtx2] = useState();
  const [panNode2, setPanNode2] = useState();
  const [gainNode2, setGainNode2] = useState();
  const [clock, setClock] = useState(Math.random);
  useEffect(() => {
    const _audioCtx1 = new window.AudioContext();
    const request1 = new XMLHttpRequest();
    request1.open('GET', 'vibration1.wav', true);
    request1.responseType = 'arraybuffer';
    request1.onload = () => {
      const audioData = request1.response;
      const source = _audioCtx1.createBufferSource();
      _audioCtx1.decodeAudioData(audioData).then((decodedData) => {
        source.buffer = decodedData;
        source.loop = true;
        const _gainNode = _audioCtx1.createGain();
        source.connect(_gainNode);
        _gainNode.connect(_audioCtx1.destination);
        const _panNode = _audioCtx1.createStereoPanner();
        source.connect(_panNode);
        _panNode.connect(_gainNode);
        source.start();
        _audioCtx1.suspend();
        setAudioCtx1(_audioCtx1);
        setPanNode1(_panNode);
        setGainNode1(_gainNode);
      });
    };
    const _audioCtx2 = new window.AudioContext();
    const request2 = new XMLHttpRequest();
    request2.open('GET', 'vibration2.wav', true);
    request2.responseType = 'arraybuffer';
    request2.onload = () => {
      const audioData = request2.response;
      const source = _audioCtx2.createBufferSource();
      _audioCtx2.decodeAudioData(audioData).then((decodedData) => {
        source.buffer = decodedData;
        source.loop = true;
        const _gainNode = _audioCtx2.createGain();
        source.connect(_gainNode);
        _gainNode.connect(_audioCtx2.destination);
        const _panNode = _audioCtx2.createStereoPanner();
        source.connect(_panNode);
        _panNode.connect(_gainNode);
        source.start();
        _audioCtx2.suspend();
        setAudioCtx2(_audioCtx2);
        setPanNode2(_panNode);
        setGainNode2(_gainNode);
      });
    };
    request2.send();
    const intervalId = setInterval(() => { setClock(Math.random()); }, 50);
    return () => { clearInterval(intervalId); };
  }, []);

  useEffect(() => {
    if(!panNode1 || !panNode2) return;
    const angle = limit90(orientation ? orientation.beta : 0);
    gainNode1.gain.value = Math.max(0, angle);
    gainNode2.gain.value = Math.max(0, angle);
  }, [clock]);

  return (
    <div id="app">
      <div class="nav">
        <h1>Pulling</h1>
      </div>
      <h1>↑</h1>
      {!orientation &&
        <button onClick={requestAccess}>
          Enable orientation sensor
        </button>
      }
      {!audioEnabled &&
        <button onClick={ () => { audioCtx1.resume(); audioCtx2.resume(); setAudioEnabled(true); } }>
          Start sound
        </button>
      }
      <div className="orientation-mark" style={{ top, left }}></div>
      <div className="notice">
        <ul>
          <li>This page requires device orientation sensors of smartphones.</li>
          <li>For the best experience, please lock the screen orientation.</li>
        </ul>
      </div>
      {/* debug */}
      {/* <ul>
        <li>ɑ: {orientation && orientation.alpha}</li>
        <li>β: {orientation && orientation.beta}</li>
        <li>γ: {orientation && orientation.gamma}</li>
        <li>top: {orientation && top}px</li>
        <li>left: {orientation && left}px</li>
      </ul> */}
      <h1 style={{ position: 'absolute', bottom: '10px' }}>↓</h1>
    </div>
  );
}

addEventListener("DOMContentLoaded", () => ReactDOM.render(<App />, document.querySelector("#main")));
