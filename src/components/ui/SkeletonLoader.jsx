/** Skeleton loader — used during AI processing only (allowed motion context #1) */
export function SkeletonBlock({ height = 20, width = '100%', borderRadius }) {
  return (
    <div
      className="skeleton"
      style={{ height, width, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonScanResult() {
  return (
    <div role="status" aria-label="Analysing image…">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SkeletonBlock height={320} borderRadius={12} />
          <SkeletonBlock height={24} width="60%" />
          <SkeletonBlock height={16} width="40%" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SkeletonBlock height={80} />
          <SkeletonBlock height={120} />
          <SkeletonBlock height={60} />
          <SkeletonBlock height={60} />
        </div>
      </div>
    </div>
  );
}
