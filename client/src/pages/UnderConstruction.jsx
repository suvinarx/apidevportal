"use client"

export default function UnderConstruction() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 text-center">
      <div>
        <h1 className="text-4xl font-bold text-green-700 mb-4">🚧 Under Construction</h1>
        <p className="text-gray-600 text-lg">
          This page is currently being built. Please check back later!
        </p>
      </div>
    </div>
  );
}
