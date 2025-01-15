'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import Replayer from '../components/Replayer';
import 'rrweb-player/dist/style.css';
import './player.css';
import { be } from "@/utils/rrweb-types"

interface ReplayProps {
    height?: number;
}

const Replay: React.FC<ReplayProps> = ({ height = 500 }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [styleRules, setStyleRules] = useState<string[]>([]);
    const playerRef = useRef<any>(null);
    const previewRef = useRef<any>(null);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/session-replay');
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`Failed to fetch replay events: ${response.status} ${response.statusText}, ${errorData.error}`);
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
        } catch (err: any) {
            console.error('Failed to fetch sessions:', err);
            setError(err.message || 'Failed to fetch replay events.');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async (sessionId: any) => {
        setEventsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/session-replay?id=${sessionId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch replay events: ${response.status} ${response.statusText}, ${errorData.error}`);
            }
            const data = await response.json();
            console.log('Data from API:', data);
            if (data.events && Array.isArray(data.events)) {
                const validatedEvents = data.events.filter(event => {
                    if (!event || typeof event !== 'object' || !('type' in event)) {
                        console.error("Invalid event format:", event);
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
                        for (const rule of sheet.cssRules)
                            acc.push(rule.cssText);
                    return acc;
                } catch (e) {
                    return acc;
                }
            }, [] as string[])
        );
    }, []);

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSessionClick = (session: any) => {
        setSelectedSession(session);
        fetchEvents(session.id);
    };

    const handleSetReplayer = (ref: any) => {
        playerRef.current = ref;
    };

    const handleSetPreview = (ref: any) => {
        previewRef.current = ref;
    };

     const previewReplayer = useMemo(() => {
        console.log('Replay Component: rendering previewReplayer with events:', events, 'styleRules:', styleRules, 'selectedSession:', selectedSession)
        return events.length > 0 ? <Replayer events={events} height={300} insertStyleRules={styleRules} ref={handleSetPreview} /> : null;
    }, [events, styleRules, selectedSession]);

    const mainReplayer = useMemo(() => {
         console.log('Replay Component: rendering mainReplayer with events:', events, 'styleRules:', styleRules, 'height:', height, 'selectedSession:', selectedSession);
        return events.length > 0 ? <Replayer events={events} height={height} insertStyleRules={styleRules} ref={handleSetReplayer} /> : null;
    }, [events, height, styleRules, selectedSession]);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column' }}>
            <div style={{ border: '1px solid gray', padding: '10px', flex: '1', overflowY: 'auto' }}>
                <h1>Session Replay</h1>
                {loading ? (
                    <p>Loading sessions...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : sessions.length > 0 ? (
                    <>
                        <ul style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                            {sessions.map((session: any, index: any) => (
                                <li
                                    key={`${session.id}-${index}`}
                                    onClick={() => handleSessionClick(session)}
                                    style={{ cursor: "pointer", backgroundColor: selectedSession === session ? 'lightgray' : 'white', padding: '8px' }}
                                >
                                    Session id: {session.id}
                                </li>
                            ))}
                        </ul>
                        {selectedSession && <p>Selected Session: {selectedSession.id}</p>}
                    </>
                ) : (
                    <p>No sessions to display.</p>
                )}
            </div>
            <div style={{ border: '1px solid gray', padding: '10px', display: "flex", gap: "1rem", flexDirection: "column", flex: "2" }}>
                <div style={{ height: "300px", border: "1px solid black", width: '100%' }}>
                    {eventsLoading ? (
                        <p>Loading Preview...</p>
                    ) : previewReplayer ? (
                        previewReplayer
                    ) : (
                        selectedSession === null ? <p>Select a session</p> : <p>No Preview</p>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    {eventsLoading ? (
                        null
                    ) : mainReplayer ? (
                        mainReplayer
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Replay;