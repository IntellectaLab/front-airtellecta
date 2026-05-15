type ErrorBannerProps = {
  message:     string
  actionLabel?: string
  onAction?:   () => void
}

export function ErrorBanner({ message, actionLabel, onAction }: ErrorBannerProps) {
  return (
    <div
      className="w-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/25 rounded-[10px] px-4 py-3 flex justify-between items-center gap-3"
      role="alert"
      data-testid="error-banner"
    >
      <span className="text-[14px] font-semibold">{message}</span>
      {actionLabel && (
        <button
          className="bg-transparent border-none text-red-700 dark:text-red-400 font-bold text-[14px] cursor-pointer hover:underline"
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
