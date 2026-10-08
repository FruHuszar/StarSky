import LocationField from "./LocationField";
import MaskedPickerField from "./MaskedPickerField";

function Controls({ values, bias, onChange, onPick, onSubmit }) {
  return (
    <div className="controls">
      <div className="control-field control-field-city">
        <LocationField
          value={values.city}
          bias={bias}
          onChange={(next) => onChange("city", next)}
          onPick={onPick}
        />
      </div>

      <div className="control-field control-field-date">
        <MaskedPickerField
          type="date"
          value={values.date}
          ariaLabel="Dátum"
          onChange={(next) => onChange("date", next)}
        />
      </div>

      <button type="button" onClick={onSubmit}>
        Generálás
      </button>
    </div>
  );
}

export default Controls;
