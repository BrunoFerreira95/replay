'use client';
import { record, type eventWithTime, RecordOptions } from 'rrweb';
import { v4 as uuidv4 } from 'uuid';

declare global {
    interface RrwebEvent {
        type: number;
        timestamp: number;
        data: any;
        session_id?: string;
    }
}

interface SessionRecorderOptions {
    uploadInterval?: number;
    apiEndpoint?: string;
    recordOptions?: RecordOptions<RrwebEvent>
}

class SessionRecorder {
    private static instance: SessionRecorder | null = null;
    private events: RrwebEvent[] = [];
    private isRecording: boolean = false;
    private stop: (() => void) | null = null;
    private uploadInterval: NodeJS.Timeout | null = null;
    private apiEndpoint: string;
    private recordOptions: RecordOptions<RrwebEvent>
    private uploadFrequency: number;
    private sessionId: string;


    constructor(options?: SessionRecorderOptions) {
        if (!SessionRecorder.instance) {
            this.apiEndpoint = options?.apiEndpoint || '/api/session-replay';
            this.uploadFrequency = options?.uploadInterval || 5000;
            this.recordOptions = options?.recordOptions || {}
            this.sessionId = uuidv4()
            this.startRecording();
            this.setupUnloadHandler();
             SessionRecorder.instance = this;
        }

         return SessionRecorder.instance;
    }

    startRecording() {
        if (this.isRecording) return;

        this.stop = record({
            emit: (event) => {
                console.log('rrweb event:', event)
                 event.session_id = this.sessionId
              this.events.push(event);
            },
           ...this.recordOptions,
           inlineStylesheet: true,
           inlineImages: true,
          // checkoutEveryNth: 1  // Forçar snapshot inicial
        });
        this.isRecording = true;
       if(this.stop)
          record.takeFullSnapshot();


        // Envia os eventos periodicamente
        this.uploadInterval = setInterval(() => {
            if (this.events.length > 0) {
                this.uploadEvents();
            }
        }, this.uploadFrequency);
    }

    async uploadEvents() {
        if (this.events.length > 0) {
            console.log('Uploading events:', this.events);
            try {
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: this.events }),
                });

                if (!response.ok) {
                    throw new Error('Failed to upload events');
                }

                this.events = []; // Limpa os eventos enviados
            } catch (error) {
                console.error('Failed to upload events:', error);
            }
        }
    }

    setupUnloadHandler() {
      const handleUnload = async () => {
        if (this.events.length > 0) {
            try {
                await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: this.events }),
                    keepalive: true
                });
            } catch (error) {
                console.error('Failed to upload events before unload:', error);
            }
        }
      };

        // Listener para antes de descarregar
        window.addEventListener('beforeunload', handleUnload);

        // Listener para mudanças de visibilidade (ex.: quando o usuário troca de aba)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                handleUnload();
            }
        });
    }



    stopRecording() {
        if (this.stop) {
            this.stop();
            if (this.uploadInterval)
              clearInterval(this.uploadInterval);
            this.isRecording = false;
        }
    }
}



export default SessionRecorder;