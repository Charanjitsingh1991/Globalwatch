export default function MapSkeleton() {
  return (
    <div className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="text-center z-10">
        <div className="text-accent font-mono text-sm animate-pulse">
          ◉ LOADING MAP SYSTEMS...
        </div>
        <div className="text-text-muted font-mono text-xs mt-2">
          Initializing cartographic engine
        </div>
      </div>
    </div>
  )
}
