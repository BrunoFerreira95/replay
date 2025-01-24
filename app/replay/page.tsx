'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import Replayer from '../components/Replayer';
import 'rrweb-player/dist/style.css';
import './player.css';

import React from 'react';

const Replay = (): React.ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [styleRules, setStyleRules] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/session-replay');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch replay events: ${response.status} ${response.statusText}, ${errorData.error}`
        );
      }
      const data = await response.json();
      console.log('Data from API:', data);
      if (data && Array.isArray(data)) {
        setSessions(data);
      } else {
        console.error('Invalid sessions format');
        setError('Invalid sessions format received from the server.');
        setSessions([]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message || 'Failed to fetch replay events.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchEvents = async (sessionId: any) => {
    setEventsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/session-replay?id=${sessionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch replay events: ${response.status} ${response.statusText}, ${errorData.error}`
        );
      }
      const data = await response.json();
      console.log('Data from API:', data);
      if (data.events && Array.isArray(data.events)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validatedEvents = data.events.filter((event: any) => {
          if (!event || typeof event !== 'object' || !('type' in event)) {
            console.error('Invalid event format:', event);
            return false;
          }
          return true;
        });
        console.log('Validated events:', validatedEvents);
        setEvents(validatedEvents);
      } else {
        console.error('Invalid events format');
        setError('Invalid events format received from the server.');
        setEvents([]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Failed to fetch replay events.');
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    setStyleRules(
      Array.from(document.styleSheets).reduce((acc, sheet) => {
        try {
          if (sheet.href?.includes('globals.css'))
            for (const rule of sheet.cssRules) acc.push(rule.cssText);
          return acc;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          return acc;
        }
      }, [] as string[])
    );
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
    fetchEvents(session.id);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSetReplayer = (ref: any) => {
    playerRef.current = ref;
  };

  const mainReplayer = useMemo(() => {
       console.log(
        'Replay Component: rendering mainReplayer with events:',
        events,
        'styleRules:',
        styleRules,
        'selectedSession:',
        selectedSession
      );
    return events.length > 0 ? (
      <Replayer
        events={events}
         height={ selectedSession === null ? 300 : 800}
        insertStyleRules={styleRules}
        ref={handleSetReplayer}
      />
    ) : null;
  }, [events, styleRules, selectedSession]);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          border: '1px solid gray',
          padding: '10px',
          flex: '1',
          overflowY: 'auto',
        }}
      >
        <h1>Session Replay</h1>
        {loading ? (
          <p>Loading sessions...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : sessions.length > 0 ? (
          <>
            <ul style={{ maxHeight: '400px', overflowY: 'scroll' }}>
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sessions.map((session: any, index: any) => (
                  <li
                    key={`${session.id}-${index}`}
                    onClick={() => handleSessionClick(session)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedSession === session ? 'lightgray' : 'white',
                      padding: '8px',
                    }}
                  >
                    Session id: {session.id}
                  </li>
                ))
              }
            </ul>
            {selectedSession && <p>Selected Session: {selectedSession.id}</p>}
          </>
        ) : (
          <p>No sessions to display.</p>
        )}
      </div>
      <div
        style={{
          border: '1px solid gray',
          padding: '10px',
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column',
          flex: '2',
        }}
      >
          <div style={{ flex: 1 ,  border: '1px solid black', width: '100%'}}>
            {eventsLoading ? (
                <p>Loading Preview...</p>
            ) : ( mainReplayer ? (
                mainReplayer
            ) :  selectedSession === null ? <p>Select a session</p> : <p>No Preview</p>
            )}
                </div>
      </div>
    </div>
  );
};

export default Replay;