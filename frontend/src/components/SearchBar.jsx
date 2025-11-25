import React, { useState, useRef, useEffect } from 'react';

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) setSupported(true);
  }, []);

  useEffect(() => {
    if (!supported) console.info('SpeechRecognition not available in this browser');
  }, [supported]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?title=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      onSearch(q, data.Search || []);
    } catch (err) {
      console.error('Search error', err);
      onSearch(q, []);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) finalTranscript += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setQ(interim.trim());
      if (finalTranscript) {
        setQ(finalTranscript.trim());
        setTimeout(() => submit(), 50);
      }
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition error', err);
      if (err && err.error === 'not-allowed') console.warn('Microphone permission denied.');
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); } catch (err) { console.warn('Could not start speech recognition', err); }
  };

  const stopListening = () => { const r = recognitionRef.current; if (r) { try { r.stop(); } catch (err) { console.warn('Error stopping recognition', err); } } setListening(false); };
  const toggleListening = () => { if (!supported) return; if (listening) stopListening(); else startListening(); };

  const onInputKeyDown = (e) => { if (e.key === 'Enter') return; };

  return (
    <form className="search" onSubmit={submit}>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={onInputKeyDown}
        placeholder="Search movies by title..."
        aria-label="Search movies"
      />
      
      <button type="button" className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleListening} title={supported ? (listening ? 'Stop listening' : 'Search by voice') : 'Voice search not supported'}>
        {listening ? '●' : '🎤'}
      </button>
      <button type="submit" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
