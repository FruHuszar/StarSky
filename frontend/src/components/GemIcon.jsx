function GemIcon({ color }) {
  return (
    <svg
      className="gem-icon"
      viewBox="0 0 24 24"
      style={{ "--stone": color }}
      aria-hidden="true"
    >
      <path className="gem-body" d="M7 3h10l5 6-10 12L2 9z" />
      <path className="gem-crown" d="M7 3h10l5 6H2z" />
      <path
        className="gem-facets"
        d="M2 9h20M7 3l2.5 6L12 3l2.5 6L17 3M9.5 9 12 21l2.5-12"
      />
    </svg>
  );
}

export default GemIcon;
