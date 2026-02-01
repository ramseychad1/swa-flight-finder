export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      <p className="mt-4 text-white text-lg">Searching for flights...</p>
    </div>
  );
}
