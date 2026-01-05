export function Output({ output }) {
  return (
    <div className="h-full bg-background">
      <pre className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-words">
        {output || 'Output will appear here...'}
      </pre>
    </div>
  );
}
