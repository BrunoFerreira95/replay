// hooks/useSessionRecorder.ts
'use client'
import { useEffect } from 'react';
import SessionRecorder from '@/utils/sessionRecorder';  // Importa a classe do SessionRecorder

interface CustomWindow extends Window {
  __isRecorderInitialized?: boolean;
}

export default function useSessionRecorder() {
  useEffect(() => {
    const recorder = new SessionRecorder();
    
    if (typeof window !== 'undefined') {
      const customWindow = window as CustomWindow;
      
      if (!customWindow.__isRecorderInitialized) {
        console.log('Iniciando o recorder...');
        
        try {
          recorder.startRecording();

          // Configura o event listener para o `beforeunload`
          customWindow.addEventListener('beforeunload', () => {
            recorder.stopRecording();
          });

          console.log('Recorder iniciado com sucesso.');
          customWindow.__isRecorderInitialized = true;  // Marca como iniciado
        } catch (err) {
          console.error('Erro ao inicializar o recorder:', err);
        }
      }
    }
  }, []);
}
