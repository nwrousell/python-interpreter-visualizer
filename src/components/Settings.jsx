import { useState, useRef, useEffect } from 'preact/hooks';

export function Settings({ filterModules, setFilterModules, theme, setTheme }) {
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
        className="px-3 py-1.5 text-sm text-text hover:bg-background-secondary border border-border transition-colors"
        title="Settings"
      >
        settings
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-background border border-border shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-text">Settings</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Theme setting */}
            <div>
              <div className="text-sm font-medium text-text mb-2">Theme</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'auto'}
                    onChange={() => setTheme('auto')}
                  />
                  <span className="text-sm text-text">Auto (follow system)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  <span className="text-sm text-text">Light</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  <span className="text-sm text-text">Dark</span>
                </label>
              </div>
            </div>

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
