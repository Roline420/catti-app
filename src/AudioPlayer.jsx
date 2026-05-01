import React, { useRef } from 'react';

const AudioPlayer = ({ src, startTime, endTime, label = "听原音" }) => {
  const audioRef = useRef(null);

  const playSegment = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startTime;
    audio.play();
    const onTimeUpdate = () => {
      if (audio.currentTime >= endTime) {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
  };

  return (
    <span className="inline-flex items-center ml-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={playSegment}
        style={{
          padding: '2px 8px',
          backgroundColor: '#6366f1',
          color: 'white',
          fontSize: '11px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          lineHeight: '1.2'
        }}
      >
        <span>▶</span> {label}
      </button>
    </span>
  );
};

export default AudioPlayer;