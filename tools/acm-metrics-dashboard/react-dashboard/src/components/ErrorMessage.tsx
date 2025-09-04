/* Copyright Contributors to the Open Cluster Management project */

interface ErrorMessageProps {
  error: Error
  onRetry?: () => void
}

const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  return (
    <div className="error">
      <h3>❌ Error Loading Metrics</h3>
      <p>{error.message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          🔄 Retry
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
