# Python Interpreter Visualizer

An educational web-based Python interpreter with visual state tracking.

## Features

- **Code Editor**: Write Python code with syntax highlighting (powered by CodeMirror)
- **Interpreter State**: Visualize variable states during execution (coming soon)
- **Terminal Output**: See print statements and execution results
- **Step Execution**: Debug and step through code (coming soon)

## Tech Stack

- **Pyodide**: Run Python in the browser via WebAssembly
- **Preact**: Lightweight React alternative for the UI
- **CodeMirror 6**: Modern code editor with Python syntax highlighting
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically http://localhost:5173)

## Usage

1. Write Python code in the left pane
2. Click "Run" to execute the code
3. See output in the right pane
4. Interpreter state visualization (coming soon) will appear in the middle pane

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

The application uses a simple three-pane layout:
- Left (1/3): Code editor with Python syntax highlighting
- Middle (1/3): Interpreter state visualization (placeholder)
- Right (1/3): Terminal output

Pyodide loads on initial page load and executes Python code entirely in the browser.
