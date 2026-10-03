import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { removeToast } from '../../store/uiSlice'

const icons = { success: FiCheckCircle, info: FiInfo, error: FiAlertCircle }
const colors = { success: 'var(--sage)', info: 'var(--gold)', error: 'var(--coral)' }

interface ToastItemProps {
  toast: { id: number; message: string; type: 'success' | 'info' | 'error' }
  onClose: () => void
}

// ============================================
// EK TOAST — 3 second baad khud-ba-khud band ho jaye
// ============================================
const ToastItem = ({ toast, onClose }: ToastItemProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [])

  const Icon = icons[toast.type]
  const color = colors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className="bg-white rounded-xl shadow-[0_8px_30px_color-mix(in_srgb,_var(--ink)_15%,_transparent)] border border-sand p-4 flex items-center gap-3"
    >
      <Icon size={18} color={color} className="shrink-0" />
      <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.8rem] text-ink flex-1">
        {toast.message}
      </p>
      <button onClick={onClose} className="text-umber hover:text-ink shrink-0">
        <FiX size={14} />
      </button>
    </motion.div>
  )
}

const ToastContainer = () => {
  const toasts = useAppSelector((state) => state.ui.toasts)
  const dispatch = useAppDispatch()

  return (
    <div className="fixed top-20 right-4 z-[300] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[320px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(removeToast(toast.id))} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer