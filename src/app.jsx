import { useState, useEffect } from 'preact/hooks';
import { CodeEditor } from './components/CodeEditor';
import { InterpreterState } from './components/InterpreterState';
import { Output } from './components/Output';
import { Settings } from './components/Settings';
import { usePyodide } from './hooks/usePyodide';
import { useStickyState } from './hooks/useStickyState';

const DEFAULT_CODE = `# Welcome to Python Interpreter Visualizer
# Write your Python code here and click Run

def greet(name, age):
    message = f"Hello, {name}!"
    print(message)
    return message

x = 42
y = "World"
result = greet(y, 25)
print(f"The answer is {x}")
`;

export function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('editing'); // 'editing' or 'running'
  const [traces, setTraces] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [prevVariables, setPrevVariables] = useState({});

  // Settings
  const [filterModules, setFilterModules] = useStickyState(true, 'filterModules');

  const { pyodide, loading, error, runCode, runCodeWithTrace } = usePyodide();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl-S or Cmd-S or F5
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (mode === 'running') {
          handleReset();
        } else {
          handleRun();
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (mode === 'running') {
          handleReset();
        } else {
          handleRun();
        }
      } else if (mode === 'running' && e.key === 'Enter') {
        // Enter to step when in running mode
        e.preventDefault();
        handleStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, pyodide, mode, currentStep, traces]);

  const handleRun = async () => {
    if (!pyodide) return;

    setMode('running');
    setOutput('Running...\n');
    setCurrentStep(0);
    setPrevVariables({});
    setTraces([]); // Clear old traces immediately

    const result = await runCodeWithTrace(code, filterModules);

    if (result.error) {
      setOutput(`Error: ${result.error}`);
      setTraces([]);
      setMode('editing');
    } else {
      setTraces(result.traces);
      setOutput(result.output);
      // Start at first step if traces exist
      if (result.traces.length > 0) {
        setCurrentStep(0);
      } else {
        setMode('editing');
      }
    }
  };

  const handleStep = () => {
    if (currentStep < traces.length - 1) {
      // Save current variables for comparison
      const currentTrace = traces[currentStep];
      if (currentTrace) {
        setPrevVariables({
          globalVariables: currentTrace.globalVariables,
          callStack: currentTrace.callStack,
        });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setMode('editing');
    setTraces([]);
    setCurrentStep(0);
    setOutput('');
    setPrevVariables({});
  };

  const currentTrace = traces[currentStep];
  const currentLine = currentTrace ? currentTrace.line : null;
  const currentGlobalVariables = currentTrace ? currentTrace.globalVariables : {};
  const currentCallStack = currentTrace ? currentTrace.callStack : [];
  const currentOutput = currentTrace ? currentTrace.output : '';

  const prevGlobalVariables = prevVariables.globalVariables || {};
  const prevCallStack = prevVariables.callStack || [];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-4">
        <h1 className="text-lg font-semibold text-text">Python Interpreter Visualizer</h1>

        {/* Mode indicator */}
        <div className="ml-4">
          {mode === 'editing' ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium border border-green-300">
              EDITING
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-300">
              RUNNING
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {loading && (
            <span className="text-sm text-text-secondary">Loading Python runtime...</span>
          )}
          {error && (
            <span className="text-sm text-red-600">Error: {error}</span>
          )}

          {mode === 'running' && traces.length > 0 && (
            <>
              <span className="text-sm text-text-secondary">
                Step {currentStep + 1} of {traces.length}
              </span>
              <button
                onClick={handleStep}
                disabled={currentStep >= traces.length - 1}
                className="px-4 py-1.5 bg-primary text-white text-sm border border-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
              >
                Step
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-secondary text-white text-sm border border-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
              >
                Reset
              </button>
            </>
          )}

          {mode === 'editing' && (
            <button
              onClick={handleRun}
              disabled={loading || !pyodide}
              className="px-4 py-1.5 bg-primary text-white text-sm border border-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              Run (Ctrl-S / F5)
            </button>
          )}

          <Settings
            filterModules={filterModules}
            setFilterModules={setFilterModules}
          />
        </div>
      </header>

      {/* Main content - three panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor (1/3) */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-3 bg-background-secondary">
            <span className="text-sm font-medium text-text-secondary">Editor</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              currentLine={currentLine}
              readOnly={mode === 'running'}
            />
          </div>
        </div>

        {/* Middle: Interpreter State (1/3) */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-3 bg-background-secondary">
            <span className="text-sm font-medium text-text-secondary">Interpreter State</span>
          </div>
          <div className="flex-1 overflow-auto">
            <InterpreterState
              globalVariables={currentGlobalVariables}
              prevGlobalVariables={prevGlobalVariables}
              callStack={currentCallStack}
              prevCallStack={prevCallStack}
              mode={mode}
            />
          </div>
        </div>

        {/* Right: Output (1/3) */}
        <div className="w-1/3 flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-3 bg-background-secondary">
            <span className="text-sm font-medium text-text-secondary">Output</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Output output={mode === 'running' ? currentOutput : output} />
          </div>
        </div>
      </div>
    </div>
  );
}
