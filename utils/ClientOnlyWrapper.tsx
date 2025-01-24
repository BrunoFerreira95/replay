// ClientOnlyWrapper.tsx
'use client'; // Garantindo que este componente só será executado no cliente

import useSessionRecorder from '@/app/hooks/useSessionRecorder';

const ClientOnlyWrapper = ({ children }: { children: React.ReactNode }) => {
  useSessionRecorder(); // Usando o hook que depende do cliente

  return <>{children}</>;
};

export default ClientOnlyWrapper;
