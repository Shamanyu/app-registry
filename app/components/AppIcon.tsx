export function AppIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <rect
        width="32"
        height="32"
        rx="10"
        fill="currentColor"
        className="text-blue-500"
      />
      <path
        d="M8 8h6v6H8V8zm10 0h6v6h-6V8zM8 18h6v6H8v-6zm10 0h6v6h-6v-6z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}
