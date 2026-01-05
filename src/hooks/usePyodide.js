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

  const runCodeWithTrace = async (code, filterModules = true) => {
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
import types

# Storage for trace data
_trace_data = []
_builtins = set(dir(__builtins__))
_filter_modules = ${filterModules ? 'True' : 'False'}

def _trace_function(frame, event, arg):
    if event == 'line':
        # Get line number
        line_no = frame.f_lineno

        # Build call stack with variables for each frame
        call_stack = []
        current_frame = frame
        while current_frame is not None:
            func_name = current_frame.f_code.co_name

            # Filter out internal frames
            if func_name in ['<module>', '_trace_function', 'eval_code', 'run']:
                current_frame = current_frame.f_back
                continue

            # Get function arguments
            args_info = []
            arg_names = current_frame.f_code.co_varnames[:current_frame.f_code.co_argcount]
            for arg_name in arg_names:
                if arg_name in current_frame.f_locals:
                    arg_value = current_frame.f_locals[arg_name]
                    args_info.append(f"{arg_name}={repr(arg_value)[:30]}")

            # Get local variables for this frame
            frame_variables = {}
            for name, value in current_frame.f_locals.items():
                if not name.startswith('_'):
                    # Filter modules if enabled
                    if _filter_modules and isinstance(value, types.ModuleType):
                        continue
                    frame_variables[name] = {
                        'type': type(value).__name__,
                        'value': repr(value)[:100]
                    }

            call_stack.insert(0, {
                'name': func_name,
                'args': ', '.join(args_info),
                'variables': frame_variables
            })

            current_frame = current_frame.f_back

        # Get global variables
        global_variables = {}
        for name, value in frame.f_globals.items():
            if (not name.startswith('_') and
                name not in _builtins):
                # Filter modules if enabled
                if _filter_modules and isinstance(value, types.ModuleType):
                    continue
                global_variables[name] = {
                    'type': type(value).__name__,
                    'value': repr(value)[:100]
                }

        # Capture any print output up to this point
        current_output = sys.stdout.getvalue()

        _trace_data.append({
            'line': line_no,
            'globalVariables': global_variables,
            'callStack': call_stack,
            'output': current_output
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
