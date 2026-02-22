"use client";
export default function Analysis() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="p-6 bg-white rounded-[32px] shadow-matte">
        <h2 className="text-xl font-bold text-monk-dark">Progress Graph</h2>
        <p className="text-xs text-monk-muted mt-2">Visualization engine loading...</p>
      </div>
    </div>
  );
}

