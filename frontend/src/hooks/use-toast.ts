import { useState } from 'react';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props]);
    // In a real app we'd trigger the UI, but for now we'll just log it or alert
    console.log('Toast:', props.title, props.description);
  };

  return { toast, toasts };
}
