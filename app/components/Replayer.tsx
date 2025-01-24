import React, { useImperativeHandle, useRef, forwardRef, useEffect, memo, useState } from 'react';
import rrwebPlayer from 'rrweb-player'; // Import the Svelte component
import type { RrwebEvent } from 'rrweb';
interface ReplayerProps {
    events: RrwebEvent[];
    height: number;
    insertStyleRules?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReplayerComponent = memo(forwardRef<any, ReplayerProps>(({ events, height, insertStyleRules }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const replayerRef = useRef<any | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    console.log('Replayer Component: Received events:', events);

    useImperativeHandle(ref, () => ({
        replayer: replayerRef.current,
        play: () => replayerRef.current?.play(),
        pause: () => replayerRef.current?.pause(),
        goto: (time: number) => replayerRef.current?.goto(time),
    }));

    useEffect(() => {
        console.log('Replayer Component: useEffect triggered, containerRef.current', containerRef.current);
        if (!containerRef.current) {
            console.error('Replayer Component: containerRef.current is null.');
            return;
        }
        if (!events) {
            console.error('Replayer Component: No events');
            return;
        }
        if (replayerRef.current) {
            try {
               if(typeof replayerRef.current.destroy === 'function') {
                  replayerRef.current.destroy();
               }
               replayerRef.current = null;
            } catch (e) {
                console.error('Replayer Component: Error destroying replayer', e);
            }
        }
        try {
            const replayer = new rrwebPlayer({
                target: containerRef.current,
                props: {
                    events: events,
                    width: containerRef.current.offsetWidth,
                    height,
                    insertStyleRules: insertStyleRules,
                },
            });
            replayerRef.current = replayer;
            setIsInitialized(true);
            console.log('Replayer Component: Svelte Player initialized');
        } catch (error) {
            console.error('Replayer Component: Error initializing Svelte player', error);
        }
        return () => {
            if (replayerRef.current && typeof replayerRef.current.destroy === 'function') {
                try {
                    replayerRef.current.destroy();
                } catch (e) {
                    console.error('Replayer Component: Error destroying replayer', e);
                }
                replayerRef.current = null;
            }
            setIsInitialized(false);
            console.log('Replayer Component: useEffect cleanup');
        };
    }, [events, height, insertStyleRules]);

    useEffect(() => {
        if (replayerRef.current && isInitialized)
            replayerRef.current.play();
        console.log('Replayer Component: useEffect play triggered');
    }, [replayerRef, isInitialized]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', overflow: 'auto', border: '1px solid black' }}
        />
    );
}));

ReplayerComponent.displayName = 'Replayer';
export default ReplayerComponent;