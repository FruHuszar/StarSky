const STEPS = [
  { key: "sky", label: "Égbolt" },
  { key: "jewelry", label: "Ékszer" },
];

function ConfiguratorSteps({ active, onSelect }) {
  return (
    <nav aria-label="Lépések">
      <ol className="config-steps">
        {STEPS.map((step, index) => (
          <li key={step.key}>
            <button
              className={
                step.key === active ? "config-step active" : "config-step"
              }
              type="button"
              aria-current={step.key === active ? "step" : undefined}
              onClick={() => onSelect(step.key)}
            >
              <span aria-hidden="true">{index + 1}</span>
              {step.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default ConfiguratorSteps;
