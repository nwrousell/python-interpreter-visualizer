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

  return { pyodide, loading, error, runCode };
}
