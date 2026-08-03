const Loading = ({
  message = "Loading PhishGuard...",
  fullScreen = true,
}) => {
  return (
    <div
      className={`app-loader flex items-center justify-center px-4 ${
        fullScreen ? "min-h-screen" : "min-h-[calc(100vh-4rem)]"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="app-loader-spinner h-16 w-16 animate-spin rounded-full border-4 sm:h-20 sm:w-20"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loading;
