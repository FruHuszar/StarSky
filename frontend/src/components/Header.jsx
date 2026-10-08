import charm from "../assets/charm.png";

function Header() {
  return (
    <header className="header">
      <span className="header-ghost" aria-hidden="true">
        Custom
      </span>

      <h1>StarSky</h1>

      <p>
        Add meg a városod és a dátumot, mi pedig kirajzoljuk az égboltot,
        ahogyan azon az éjszakán ragyogott. A saját csillagtérképedből így
        születik egyedi ékszer: egy pillanat, amit viselni lehet.
      </p>

      <img className="header-charm" src={charm} alt="" draggable="false" />
    </header>
  );
}

export default Header;
