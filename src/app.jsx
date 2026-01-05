import { useState, useEffect } from 'preact/hooks';
import { CodeEditor } from './components/CodeEditor';
import { InterpreterState } from './components/InterpreterState';
import { Output } from './components/Output';
import { usePyodide } from './hooks/usePyodide';

const DEFAULT_CODE = `# Welcome to Python Interpreter Visualizer
# Write your Python code here and click Run

x = 42
y = "Hello, World!"
print(f"{y} The answer is {x}")

numbers = [1, 2, 3, 4, 5]
print(f"Sum: {sum(numbers)}")
`;

export function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const { pyodide, loading, error, runCode } = usePyodide();

  const handleRun = async () => {
    if (!pyodide) return;

    setOutput('Running...\n');
    const result = await runCode(code);
    setOutput(result);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-4">
        <h1 className="text-lg font-semibold text-text">Python Interpreter Visualizer</h1>
        <div className="ml-auto flex items-center gap-4">
          {loading && (
            <span className="text-sm text-text-secondary">Loading Python runtime...</span>
          )}
          {error && (
            <span className="text-sm text-red-600">Error: {error}</span>
          )}
          <button
            onClick={handleRun}
            disabled={loading || !pyodide}
            className="px-4 py-1.5 bg-primary text-white text-sm border border-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            Run
          </button>
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
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        {/* Middle: Interpreter State (1/3) */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-3 bg-background-secondary">
            <span className="text-sm font-medium text-text-secondary">Interpreter State</span>
          </div>
          <div className="flex-1 overflow-auto">
            <InterpreterState />
          </div>
        </div>

        {/* Right: Output (1/3) */}
        <div className="w-1/3 flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-3 bg-background-secondary">
            <span className="text-sm font-medium text-text-secondary">Output</span>
          </div>
          <div className="flex-1 overflow-auto">
            <Output output={output} />
          </div>
        </div>
      </div>
    </div>
  );
}
