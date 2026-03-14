type Props = {
  value: string | undefined;
  fallback?: string;
};

export default function SettingsText({ value, fallback = '' }: Props) {
  const lines = (value ?? fallback).split('\n');

  if (lines.length === 1) return <>{lines[0]}</>;

  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
