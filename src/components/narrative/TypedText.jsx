export default function TypedText({ text, count }) {
  return (
    <span className="typed-text" aria-label={text}>
      <span className="typed-reserve" aria-hidden="true">{text}</span>
      <span className="typed-visible" aria-hidden="true">{text.slice(0, count)}{count < text.length && <span className="typing-cursor">▌</span>}</span>
    </span>
  );
}
