import { useState, useEffect } from 'preact/hooks';

export function usePyodide() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPyodideInstance() {
      try {
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
        });

        // Redirect Python stdout to capture print statements
        pyodideInstance.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
        `);

        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadPyodideInstance();
  }, []);

  const runCode = async (code) => {
    if (!pyodide) return 'Pyodide not loaded';

    try {
      // Clear previous output
      pyodide.runPython(`
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      // Run the user's code
      pyodide.runPython(code);

      // Get the output
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      const stderr = pyodide.runPython('sys.stderr.getvalue()');

      let output = '';
      if (stdout) output += stdout;
      if (stderr) output += 'Errors:\n' + stderr;

      return output || 'Code executed successfully (no output)';
    } catch (err) {
      return `Error: ${err.message}`;
    }
  };

  const runCodeWithTrace = async (code) => {
    if (!pyodide) return { error: 'Pyodide not loaded', traces: [], output: '' };

    try {
      // Clear previous output
      pyodide.runPython(`
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      // Set up trace collection
      pyodide.runPython(`
import sys
import json

# Storage for trace data
_trace_data = []
_builtins = set(dir(__builtins__))

def _trace_function(frame, event, arg):
    if event == 'line':
        # Get line number (adjusted for 0-indexing in editor)
        line_no = frame.f_lineno

        # Capture local and global variables (filter out builtins and internals)
        variables = {}

        # Get local variables
        for name, value in frame.f_locals.items():
            if not name.startswith('_'):
                variables[name] = {
                    'type': type(value).__name__,
                    'value': repr(value)[:100]  # Limit length
                }

        # Get global variables (only user-defined ones)
        for name, value in frame.f_globals.items():
            if (not name.startswith('_') and
                name not in _builtins and
                name not in variables and
                name != '_trace_function'):
                variables[name] = {
                    'type': type(value).__name__,
                    'value': repr(value)[:100]
                }

        _trace_data.append({
            'line': line_no,
            'variables': variables
        })

    return _trace_function

# Clear previous trace data
_trace_data = []
      `);

      // Run user code with tracing
      pyodide.runPython(`
sys.settrace(_trace_function)
try:
    exec("""${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}""")
finally:
    sys.settrace(None)
      `);

      // Get trace data
      const traceDataJson = pyodide.runPython('json.dumps(_trace_data)');
      const traces = JSON.parse(traceDataJson);

      // Get output
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      const stderr = pyodide.runPython('sys.stderr.getvalue()');

      let output = '';
      if (stdout) output += stdout;
      if (stderr) output += 'Errors:\n' + stderr;

      return {
        traces,
        output: output || 'Code executed successfully',
        error: null
      };
    } catch (err) {
      return {
        traces: [],
        output: '',
        error: err.message
      };
    }
  };

  return { pyodide, loading, error, runCode, runCodeWithTrace };
}
