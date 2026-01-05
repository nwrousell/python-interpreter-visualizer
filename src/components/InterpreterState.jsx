// Color palette for different types
const TYPE_COLORS = {
  int: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  float: { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-800' },
  str: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
  bool: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
  list: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
  dict: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
  tuple: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' },
  set: { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800' },
  NoneType: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' },
  default: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-800' },
};

function getTypeColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.default;
}

export function InterpreterState({ variables = {}, mode = 'editing' }) {
  const variableNames = Object.keys(variables);

  if (mode === 'editing') {
    return (
      <div className="p-4">
        <div className="text-sm text-text-secondary">
          <p>Run your code to see variables here!</p>
          <p className="mt-2">Press the Run button or use Ctrl-S / F5 to start.</p>
        </div>
      </div>
    );
  }

  if (variableNames.length === 0) {
    return (
      <div className="p-4">
        <div className="text-sm text-text-secondary">
          <p>No variables yet.</p>
          <p className="mt-2">Variables will appear as you step through the code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-3">
        {variableNames.map((name) => {
          const variable = variables[name];
          const colors = getTypeColor(variable.type);

          return (
            <div
              key={name}
              className="border border-border p-3 bg-background-secondary"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Variable name and type */}
                <div className="flex-shrink-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-text">{name}</span>
                    <span className="text-xs text-text-secondary">
                      : {variable.type}
                    </span>
                  </div>
                </div>

                {/* Value box */}
                <div
                  className={`flex-grow min-w-0 px-2 py-1 border ${colors.border} ${colors.bg} ${colors.text}`}
                >
                  <code className="text-sm font-mono break-words">
                    {variable.value}
                  </code>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
