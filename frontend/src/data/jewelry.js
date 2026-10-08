export const JEWELRY_TYPES = [
  {
    id: "pendant",
    label: "Medál",
    detail: "Nyaklánccal",
    sizeLabel: "Lánchossz",
    charmLabel: "Függőként",
    charmHint: "A kő külön függőként lóg a láncon, a medál mellett.",
    defaultSize: "45",
    sizes: [
      { id: "40", label: "40 cm", hint: "16″" },
      { id: "45", label: "45 cm", hint: "18″" },
      { id: "50", label: "50 cm", hint: "20″" },
      { id: "55", label: "55 cm", hint: "22″" },
    ],
  },
  {
    id: "bracelet",
    label: "Karkötő",
    detail: "Finom lánccal",
    sizeLabel: "Csuklóméret",
    charmLabel: "A láncon",
    charmHint: "A kő külön elemként kerül a karkötő láncára.",
    defaultSize: "M",
    sizes: [
      { id: "S", label: "S", hint: "16 cm" },
      { id: "M", label: "M", hint: "17,5 cm" },
      { id: "L", label: "L", hint: "19 cm" },
    ],
  },
  {
    id: "ring",
    label: "Gyűrű",
    detail: "Pecsétgyűrű",
    sizeLabel: "Gyűrűméret",
    charmLabel: "A sínen",
    charmHint: "A kő a gyűrűsínbe kerül, a térkép mellé foglalva.",
    defaultSize: "7",
    sizes: [
      { id: "5", label: "US 5", hint: "EU 49 · Ø 15,7 mm" },
      { id: "6", label: "US 6", hint: "EU 52 · Ø 16,5 mm" },
      { id: "7", label: "US 7", hint: "EU 54 · Ø 17,3 mm" },
      { id: "8", label: "US 8", hint: "EU 57 · Ø 18,1 mm" },
      { id: "9", label: "US 9", hint: "EU 59 · Ø 18,9 mm" },
      { id: "10", label: "US 10", hint: "EU 62 · Ø 19,8 mm" },
    ],
  },
  {
    id: "earrings",
    label: "Fülbevaló",
    detail: "Függő pár",
    sizeLabel: null,
    charmLabel: "Alá függesztve",
    charmHint: "A kő kis függőként lóg a fülbevaló alatt.",
    defaultSize: null,
    sizes: [],
  },
];

export const METALS = [
  {
    id: "silver-925",
    label: "925 ezüst",
    tones: { light: "#f5f6f8", base: "#c8ccd3", dark: "#878d97" },
  },
  {
    id: "yellow-gold-14k",
    label: "14K sárga arany",
    tones: { light: "#f8e7b0", base: "#d6b062", dark: "#9a782f" },
  },
  {
    id: "white-gold-14k",
    label: "14K fehér arany",
    tones: { light: "#f7f5ef", base: "#d9d5ca", dark: "#9b978b" },
  },
  {
    id: "rose-gold-14k",
    label: "14K rozéarany",
    tones: { light: "#f7d8cb", base: "#d89c86", dark: "#9f604e" },
  },
  {
    id: "yellow-gold-18k",
    label: "18K sárga arany",
    tones: { light: "#fbe49c", base: "#e0b04a", dark: "#a5781d" },
  },
  {
    id: "platinum-950",
    label: "950 platina",
    tones: { light: "#f2f3f3", base: "#bec2c3", dark: "#7b8183" },
  },
];

export const STONES = [
  { id: "diamond", name: "Gyémánt", color: "#eef3f8", isSelectable: true },
  {
    id: "white-sapphire",
    name: "Fehér zafír",
    color: "#e2e9f2",
    isSelectable: true,
  },
  { id: "aquamarine", name: "Akvamarin", color: "#8fd3e0", isSelectable: true },
  { id: "sapphire", name: "Zafír", color: "#1f4fa3", isSelectable: true },
  { id: "emerald", name: "Smaragd", color: "#1f8a5b", isSelectable: true },
  { id: "peridot", name: "Krizolit", color: "#a3c43a", isSelectable: true },
  {
    id: "yellow-sapphire",
    name: "Sárga zafír",
    color: "#f2cf4a",
    isSelectable: true,
  },
  { id: "citrine", name: "Citrin", color: "#e8a93a", isSelectable: true },
  { id: "topaz", name: "Topáz", color: "#e39a52", isSelectable: true },
  { id: "garnet", name: "Gránát", color: "#7a1626", isSelectable: true },
  { id: "ruby", name: "Rubin", color: "#b0123a", isSelectable: true },
  { id: "amethyst", name: "Ametiszt", color: "#8a5cc2", isSelectable: true },
  { id: "moonstone", name: "Holdkő", color: "#dfe4ee", isSelectable: true },
  { id: "opal", name: "Opál", color: "#e6eef0", isSelectable: true },
  {
    id: "rock-crystal",
    name: "Hegyikristály",
    color: "#f4f7fa",
    isSelectable: false,
  },
  { id: "beryl", name: "Berill", color: "#9fd8c5", isSelectable: false },
  { id: "agate", name: "Achát", color: "#b5785a", isSelectable: false },
  { id: "magnetite", name: "Magnetit", color: "#3a3b3f", isSelectable: false },
  { id: "onyx", name: "Ónix", color: "#1b1c1f", isSelectable: false },
  { id: "jasper", name: "Jáspis", color: "#a4432e", isSelectable: false },
  { id: "chalcedony", name: "Kalcedon", color: "#b9c7d6", isSelectable: false },
];

export const SELECTABLE_STONES = STONES.filter((stone) => stone.isSelectable);

export const DEFAULT_STONE = "Gyémánt";

export const PLACEMENTS = [
  {
    id: "map",
    label: "Térképen",
    hint: "A kő a csillag pontos helyére kerül a térképen.",
  },
  {
    id: "back",
    label: "Hátoldalon",
    hint: "A kő a hátoldalba kerül, a gravírozás mellé.",
  },
];

export const ENGRAVING_LIMIT = 24;

export const DEFAULT_JEWELRY = {
  type: "pendant",
  metal: "yellow-gold-14k",
  size: "45",
  stones: {},
  engraving: { hasText: false, text: "", hasDetails: false },
};
