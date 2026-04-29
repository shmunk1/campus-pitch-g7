export default function SlotsRow({ count, max }: { count: number; max: number }) {
  return (
    <div className="cp-slots">
      <span className="cp-slots-num">
        {count}<span>/{max}</span>
      </span>
      <div className="cp-slots-dots">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={"cp-slot " + (i < count ? "is-on" : "")} />
        ))}
      </div>
    </div>
  );
}
