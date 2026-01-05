import { useEffect, useState } from 'preact/hooks';
import { useBoop } from '../hooks/useBoop';

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

function Variable({ name, variable, prevValue }) {
  const colors = getTypeColor(variable.type);
  const { style, trigger } = useBoop({ scale: 1.15, timing: 200 });

  useEffect(() => {
    if (prevValue !== undefined && prevValue !== variable.value) {
      trigger();
    }
  }, [variable.value, prevValue]);

  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      {/* Variable name and type */}
      <div className="flex items-baseline gap-2 flex-shrink-0">
        <span className="font-semibold text-text text-sm">{name}</span>
        <span className="text-xs text-text-secondary">: {variable.type}</span>
      </div>

      {/* Value box */}
      <div
        style={style}
        className={`px-2 py-0.5 border ${colors.border} ${colors.bg} ${colors.text} flex-shrink-0`}
      >
        <code className="text-xs font-mono whitespace-nowrap">{variable.value}</code>
      </div>
    </div>
  );
}

function CallStackFrame({ frame, isNew, isRemoving }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animationClass = isRemoving
    ? 'translate-x-full opacity-0'
    : isNew && !mounted
    ? 'translate-x-full opacity-0'
    : 'translate-x-0 opacity-100';

  return (
    <div
      className={`border border-border bg-background-secondary p-2 transition-all duration-300 ${animationClass}`}
    >
      <div className="font-semibold text-sm text-text">{frame.name}</div>
      {frame.args && (
        <div className="text-xs text-text-secondary font-mono mt-1">{frame.args}</div>
      )}
    </div>
  );
}

export function InterpreterState({
  variables = {},
  prevVariables = {},
  callStack = [],
  prevCallStack = [],
  mode = 'editing',
  showCallStack = false,
}) {
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

  return (
    <div className="p-4 space-y-4">
      {/* Variables Section */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">
          Variables
        </h3>
        {variableNames.length === 0 ? (
          <div className="text-sm text-text-secondary">No variables yet.</div>
        ) : (
          <div>
            {variableNames.map((name) => (
              <Variable
                key={name}
                name={name}
                variable={variables[name]}
                prevValue={prevVariables[name]?.value}
              />
            ))}
          </div>
        )}
      </div>

      {/* Call Stack Section */}
      {showCallStack && (
        <>
          <div className="border-t border-border"></div>
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">
              Call Stack
            </h3>
            {callStack.length === 0 ? (
              <div className="text-sm text-text-secondary">No function calls.</div>
            ) : (
              <div className="space-y-2">
                {callStack.map((frame, index) => {
                  const isNew =
                    !prevCallStack[index] ||
                    prevCallStack[index].name !== frame.name ||
                    prevCallStack[index].args !== frame.args;
                  return (
                    <CallStackFrame key={`${index}-${frame.name}`} frame={frame} isNew={isNew} />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
