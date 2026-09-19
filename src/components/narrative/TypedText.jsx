export default function TypedText({ text, count }) {
  const visibleText = text.slice(0, count);
  const withEffectHighlight = (value) => value.split(/(다시 시도한다면[^.]*판정 난이도가 낮아진다\.?|(?:HP|SAN|STR|DEX|INT|WILL|LUK)\s*[+-]\s*\d+|DC\s*\d+\s*→\s*\d+)/gi).map((part, index) => {
    if (/^다시 시도한다면[^.]*판정 난이도가 낮아진다\.?$/i.test(part)) {
      return <span className="typed-important" key={index}>{part}</span>;
    }
    if (/^(?:HP|SAN|STR|DEX|INT|WILL|LUK)\s*-\s*\d+$/i.test(part)) {
      return <span className="typed-damage" key={index}>{part}</span>;
    }
    if (/^(?:HP|SAN|STR|DEX|INT|WILL|LUK)\s*\+\s*\d+$/i.test(part)) {
      return <span className="typed-benefit" key={index}>{part}</span>;
    }
    if (/^DC\s*\d+\s*→\s*\d+$/i.test(part)) {
      const [, before, after] = part.match(/DC\s*(\d+)\s*→\s*(\d+)/i) ?? [];
      const className = Number(after) < Number(before) ? 'typed-benefit' : 'typed-damage';
      return <span className={className} key={index}>{part}</span>;
    }
    return part;
  });
  return (
    <span className="typed-text" aria-label={text}>
      <span className="typed-reserve" aria-hidden="true">{text}</span>
      <span className="typed-visible" aria-hidden="true">{withEffectHighlight(visibleText)}{count < text.length && <span className="typing-cursor">▌</span>}</span>
    </span>
  );
}
