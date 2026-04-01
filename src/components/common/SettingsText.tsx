type Props = {
  value: string | undefined;
  fallback?: string;
  lineClassNames?: Record<number, string>;
};

export default function SettingsText({ value, fallback = '', lineClassNames }: Props) {
  const lines = (value ?? fallback).split('\n');

  if (lines.length === 1 && !lineClassNames) return <>{lines[0]}</>;

  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={lineClassNames?.[i]} style={{ display: 'block' }}>
          {line}
        </span>
      ))}
    </>
  );
}
