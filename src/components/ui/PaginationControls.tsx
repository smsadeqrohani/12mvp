interface PaginationControlsProps {
  currentPage: number;
  isDone: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function PaginationControls({ 
  currentPage, 
  isDone, 
  onNext, 
  onPrev 
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/30 bg-gray-800/20">
      <div className="text-sm text-gray-400">
        صفحه {currentPage}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white disabled:text-gray-600 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          قبلی
        </button>
        <button
          onClick={onNext}
          disabled={isDone}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white disabled:text-gray-600 rounded-lg text-sm font-medium transition-all duration-200"
        >
          بعدی
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

