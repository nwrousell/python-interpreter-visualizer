import { useState, useRef, useEffect } from 'preact/hooks';

export function Settings({ filterModules, setFilterModules }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-background-secondary border border-border transition-colors"
        title="Settings"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2.8 2.8-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-2.8-2.8-4.2-4.2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-background border border-border shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-text">Settings</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Filter modules setting */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filterModules}
                onChange={(e) => setFilterModules(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-text">Filter modules</div>
                <div className="text-xs text-text-secondary mt-1">
                  Hide imported modules from variable display
                </div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
