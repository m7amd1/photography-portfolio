"use client";

interface ToastProps {
  message: string
  show: boolean
  type: "success" | "error"
  onClose: () => void
}

export function Toast({ message, show, type, onClose }: ToastProps) {
  if (!show) return null

  const icon =
    type === "success" ? (
      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ) : (
      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 1112 1C7.029 1 3 5.029 3 10a9 9 0 019 9z"
          />
        </svg>
      </div>
    )

  const title = type === "success" ? "Success!" : "Error!"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Toast content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start space-x-4">
          {icon}

          {/* Message content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
