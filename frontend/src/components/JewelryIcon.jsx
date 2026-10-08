const SHAPES = {
  pendant: (
    <>
      <path d="M8 4 Q20 22 32 4" />
      <circle cx="20" cy="17" r="1.6" />
      <circle cx="20" cy="27" r="8" />
    </>
  ),
  bracelet: (
    <>
      <ellipse cx="20" cy="17" rx="15" ry="8" strokeDasharray="2.4 1.6" />
      <circle cx="20" cy="27" r="6.5" />
    </>
  ),
  ring: (
    <>
      <ellipse cx="20" cy="25" rx="10" ry="11" />
      <circle cx="20" cy="13" r="7.5" />
    </>
  ),
  earrings: (
    <>
      <path d="M9 5 q4 0 4 5 v6" />
      <path d="M23 5 q4 0 4 5 v6" />
      <circle cx="13" cy="22" r="6" />
      <circle cx="27" cy="22" r="6" />
    </>
  ),
};

function JewelryIcon({ type }) {
  return (
    <svg
      className="jewelry-icon"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden="true"
    >
      {SHAPES[type]}
    </svg>
  );
}

export default JewelryIcon;
