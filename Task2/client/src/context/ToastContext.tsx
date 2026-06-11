import { createContext, useContext, useCallback, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ success: () => {}, error: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const success = useCallback((message: string) => {
    toast.success(message, {
      style: { fontSize: '14px', borderRadius: '8px' },
    });
  }, []);

  const error = useCallback((message: string) => {
    toast.error(message, {
      style: { fontSize: '14px', borderRadius: '8px' },
    });
  }, []);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#171717', color: '#fafafa' },
        }}
      />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
