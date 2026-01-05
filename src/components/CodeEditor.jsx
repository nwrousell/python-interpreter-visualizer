import { useEffect, useRef } from 'preact/hooks';
import { EditorView, basicSetup } from 'codemirror';
import { Decoration } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { EditorState, StateField, StateEffect } from '@codemirror/state';

// Effect to update the highlighted line
const setHighlightedLine = StateEffect.define();

// Field to track which line is highlighted
const highlightedLineField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setHighlightedLine)) {
        if (effect.value === null) {
          return Decoration.none;
        }
        const line = tr.state.doc.line(effect.value);
        const decoration = Decoration.line({
          attributes: { class: 'cm-highlighted-line' },
        });
        return Decoration.set([decoration.range(line.from)]);
      }
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightLineTheme = EditorView.theme({
  '.cm-highlighted-line': {
    backgroundColor: '#fff3cd',
    borderLeft: '3px solid #ffc107',
  },
});

export function CodeEditor({ value, onChange, currentLine = null, readOnly = false }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        python(),
        highlightedLineField,
        highlightLineTheme,
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !readOnly) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          },
          '.cm-content': {
            padding: '8px 0',
          },
          '.cm-line': {
            padding: '0 8px',
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Update highlighted line when currentLine changes
  useEffect(() => {
    if (!viewRef.current) return;

    const doc = viewRef.current.state.doc;
    const totalLines = doc.lines;

    // Only set highlight if line is within document
    const lineToHighlight = currentLine !== null && currentLine <= totalLines ? currentLine : null;

    viewRef.current.dispatch({
      effects: setHighlightedLine.of(lineToHighlight),
    });

    // Scroll to the highlighted line (or last line if past the end)
    if (currentLine !== null) {
      const lineNumber = Math.min(currentLine, totalLines);
      const line = viewRef.current.state.doc.line(lineNumber);
      viewRef.current.dispatch({
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      });
    }
  }, [currentLine]);

  // Update read-only state
  useEffect(() => {
    if (!viewRef.current) return;

    viewRef.current.dispatch({
      effects: StateEffect.reconfigure.of([
        basicSetup,
        python(),
        highlightedLineField,
        highlightLineTheme,
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !readOnly) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          },
          '.cm-content': {
            padding: '8px 0',
          },
          '.cm-line': {
            padding: '0 8px',
          },
        }),
      ]),
    });
  }, [readOnly]);

  return <div ref={editorRef} className="h-full w-full" />;
}
