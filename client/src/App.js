import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const socket = io('http://localhost:5000');

function App() {
  const videoRef = useRef();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    const peer = new SimplePeer({ initiator: true, trickle: false });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Display local video
        videoRef.current.srcObject = stream;

        // Send the local stream to the peer
        peer.addStream(stream);

        // Listen for data from the peer
        peer.on('data', (data) => {
          console.log('Received data:', data);
        });

        // Connect to the peer
        peer.on('signal', (data) => {
          socket.emit('signal', data);
        });

        // Listen for incoming signals
        socket.on('signal', (data) => {
          peer.signal(data);
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });

    return () => {
      socket.disconnect();
      peer.destroy();
    };
  }, []);

  return (
    <div className="App">
      <h1>Video Calling App</h1>
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
}

export default App;

