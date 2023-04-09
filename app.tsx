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
  const [audioCtx, setAudioCtx] = useState();
  const [gainNode, setGainNode] = useState();
  const [sound1, setSound1] = useState();
  const [sound2, setSound2] = useState();
  const [isAnglePositive, setIsAnglePositive] = useState(true);
  const [clock, setClock] = useState(Math.random);

  const switchSound = (id: Number) => {
    const source = audioCtx.createBufferSource();
    source.buffer = (id === 1) ? sound1 : sound2;
    source.loop = true;
    source.connect(gainNode);
  }

  useEffect(() => {
    const _audioCtx = new window.AudioContext();
    setAudioCtx(_audioCtx);
    const source = _audioCtx.createBufferSource();
    const request1 = new XMLHttpRequest();

    request1.open('GET', 'vibration1.wav', true);
    request1.responseType = 'arraybuffer';
    request1.onload = () => {
      const audioData = request1.response;
      _audioCtx.decodeAudioData(audioData).then((decodedData) => {
        source.buffer = decodedData;
        setSound1(decodedData);
        source.loop = true;
        const _gainNode = _audioCtx.createGain();
        source.connect(_gainNode);
        _gainNode.connect(_audioCtx.destination);
        source.start();
        _audioCtx.suspend();
        setGainNode(_gainNode);
      });
    };
    request1.send();
    const request2 = new XMLHttpRequest();
    request2.open('GET', 'vibration2.wav', true);
    request2.responseType = 'arraybuffer';
    request2.onload = () => {
      const audioData = request2.response;
      _audioCtx.decodeAudioData(audioData).then((decodedData) => {
        setSound2(decodedData);
      });
    };
    request2.send();
    const intervalId = setInterval(() => { setClock(Math.random()); }, 50);
    return () => { clearInterval(intervalId); };
  }, []);

  useEffect(() => {
    if(!gainNode) return;
    const angle = limit90(orientation ? orientation.beta : 0);
    if((angle > 0) !== isAnglePositive) {
      switchSound((angle > 0) ? 1 : 2);
      setIsAnglePositive(angle > 0);
    }
    gainNode.gain.value = Math.max(0, Math.abs(angle));
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
        <button onClick={ () => { audioCtx.resume(); setAudioEnabled(true); } }>
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
