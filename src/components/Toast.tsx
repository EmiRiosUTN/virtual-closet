import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    textColor: 'text-green-900',
    iconColor: 'text-green-500',
    borderColor: 'border-green-200',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-900',
    iconColor: 'text-red-500',
    borderColor: 'border-red-200',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-200',
  },
  info: {
    icon: AlertCircle,
    bgColor: 'bg-zinc-900/10',
    textColor: 'text-zinc-900',
    iconColor: 'text-zinc-900',
    borderColor: 'border-zinc-900/20',
  },
};

export const ToastItem = ({ toast, onClose }: ToastProps) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md`}
    >
      <Icon className={`${config.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
      <p className={`${config.textColor} text-sm flex-1 leading-relaxed`}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className={`${config.textColor} opacity-50 hover:opacity-100 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};
