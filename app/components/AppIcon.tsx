export function AppIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="app-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#app-icon-grad)" />
      <path
        d="M8 10h5v5H8v-5zm11 0h5v5h-5v-5zm-5.5 11h5v5h-5v-5z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  );
}
