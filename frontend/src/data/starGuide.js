/**
 * A "Mi a szerencsecsillagom?" varázsló tartalma.
 *
 * A behéni csillagok köve és növénye a hagyományt követi (Agrippa:
 * De Occulta Philosophia, II. könyv), a mitológiai szövegek a görög-római
 * mondákra épülnek. Ezek hagyományok, nem tudományos állítások - a
 * szövegek is így fogalmaznak.
 *
 * A `star` mezők a csillagkatalógus neveit használják, hogy a választás
 * közvetlenül kijelölhető legyen a térképen.
 */

export const PATHS = [
  {
    id: "date",
    title: "Dátum alapján",
    summary:
      "Megkeressük, melyik állócsillaggal járt együtt a Nap és a Hold a megadott napon.",
    description:
      "Ha a születésnapodhoz vagy egy fontos naphoz (esküvő, egy gyermek érkezése) tartozó csillagot keresed. Klasszikus csillagászati számítás: a Nap ekliptikai helyzetéhez legközelebb álló fényes csillagot adja vissza.",
    recommended: "Bárkinek, aki egy konkrét naphoz köti az ékszerét.",
  },
  {
    id: "mythology",
    title: "Mítoszok és jelentés",
    summary:
      "Görög-római mondák és jelképes jelentések alapján választunk csillagot.",
    description:
      "Ókori görög és római történetek, legendák és jelképek szerint (például a Sarkcsillag az iránymutatás, az Arcturus a vezetés csillaga).",
    recommended:
      "Ha történetet és jelentést keresel, asztrológia és mágia nélkül.",
  },
  {
    id: "behenian",
    title: "Védő erő – a 15 behéni csillag",
    summary:
      "Középkori és reneszánsz hermetikus hagyomány, csillagonként kötött kővel.",
    description:
      "A hagyomány szerint a tizenöt behéni állócsillag mindegyike más-más védő és jótékony erőt hordoz. Ezen az úton a csillag mellé kizárólag a hozzá tartozó hagyományos kő kerülhet.",
    recommended:
      "Ha védelmet, hagyományos kőpárosítást és amulett-jelleget keresel.",
    note: "Ezen az úton a kő kötött: mindig a csillag hagyományos köve.",
  },
];

/** A 15 behéni csillag a hagyomány szerinti kövével és növényével. */
export const BEHENIAN_STARS = [
  {
    star: "Algol",
    latin: "Caput Algol",
    constellation: "Perszeusz",
    gem: "Gyémánt",
    herb: "Fekete hunyor",
    effect: "protection",
    meaning:
      "A hagyomány a legerősebb védő talizmánként tartja számon: elhárítja az ártó szándékot, és bátorságot ad a szembenézéshez.",
  },
  {
    star: "Alcyone",
    latin: "Pleiades",
    constellation: "Bika (Fiastyúk)",
    gem: "Hegyikristály",
    herb: "Édeskömény",
    effect: "insight",
    meaning:
      "A Fiastyúk a tisztánlátás csillaghalmaza: a hagyomány szerint felfedi a rejtett dolgokat és élesíti a látást.",
  },
  {
    star: "Aldebaran",
    latin: "Oculus Tauri",
    constellation: "Bika",
    gem: "Rubin",
    herb: "Máriatövis",
    effect: "wealth",
    meaning:
      "A Bika vörös szeme a bőség és a megbecsülés csillaga, a hagyomány gazdagságot és tekintélyt társít hozzá.",
  },
  {
    star: "Capella",
    latin: "Hircus",
    constellation: "Szekeres",
    gem: "Zafír",
    herb: "Kakukkfű",
    effect: "success",
    meaning:
      "Amalthea kecskéjének csillaga: a hagyomány szerint jóindulatot és támogatást hoz a nálunk nagyobb hatalmúaktól.",
  },
  {
    star: "Szíriusz",
    latin: "Sirius",
    constellation: "Nagy Kutya",
    gem: "Berill",
    herb: "Boróka",
    effect: "success",
    meaning:
      "Az égbolt legfényesebb csillaga. A hagyomány jóakaratot, hírnevet és a veszélytől való oltalmat tulajdonít neki.",
  },
  {
    star: "Procyon",
    latin: "Canis Minor",
    constellation: "Kis Kutya",
    gem: "Achát",
    herb: "Csombormenta",
    effect: "insight",
    meaning:
      "A kutyacsillagok kisebbike: a hagyomány szerint segítséget és éber figyelmet ad a döntésekhez.",
  },
  {
    star: "Regulus",
    latin: "Cor Leonis",
    constellation: "Oroszlán",
    gem: "Gránát",
    herb: "Vérehulló fecskefű",
    effect: "courage",
    meaning:
      "Az Oroszlán szíve, a „kis király”. A hagyomány bátorságot, tartást és a hatalmasok kegyét társítja hozzá.",
  },
  {
    star: "Alkaid",
    latin: "Benetnash",
    constellation: "Nagy Medve",
    gem: "Magnetit",
    herb: "Katángkóró",
    effect: "protection",
    meaning:
      "A Göncölszekér rúdjának vége. A hagyomány szerint eltávolítja az ártó szándékot és lezárja, ami már nem szolgál minket.",
  },
  {
    star: "Algorab",
    latin: "Corvus",
    constellation: "Holló",
    gem: "Ónix",
    herb: "Bojtorján",
    effect: "protection",
    meaning:
      "A Holló csillaga: a hagyomány elszántságot ad vele, és elűzi a rosszindulatot.",
  },
  {
    star: "Spica",
    latin: "Spica Virginis",
    constellation: "Szűz",
    gem: "Smaragd",
    herb: "Zsálya",
    effect: "wealth",
    meaning:
      "A búzakalász csillaga: a hagyomány bőséget, összhangot és szelíd szerencsét társít hozzá.",
  },
  {
    star: "Arcturus",
    latin: "Alchameth",
    constellation: "Ökörhajcsár",
    gem: "Jáspis",
    herb: "Útifű",
    effect: "success",
    meaning:
      "Az északi égbolt legfényesebb csillaga. A hagyomány szerint kitartást és gyarapodást ad a saját úton.",
  },
  {
    star: "Alphecca",
    latin: "Elpheia",
    constellation: "Északi Korona",
    gem: "Topáz",
    herb: "Rozmaring",
    effect: "love",
    meaning:
      "Ariadné koronájának ékköve: a hagyomány szerelmet, barátságot és megbecsülést társít hozzá.",
  },
  {
    star: "Antares",
    latin: "Cor Scorpii",
    constellation: "Skorpió",
    gem: "Ametiszt",
    herb: "Sáfrány",
    effect: "courage",
    meaning:
      "A Skorpió szíve, a Marssal vetélkedő vörös csillag. A hagyomány szerint bátorságot ad a nehéz helyzetekben.",
  },
  {
    star: "Vega",
    latin: "Vultur Cadens",
    constellation: "Lant",
    gem: "Krizolit",
    herb: "Borsikafű",
    effect: "charm",
    meaning:
      "Orpheusz lantjának csillaga: a hagyomány szerint vonzerőt ad, és feloldja a félelmet.",
  },
  {
    star: "Deneb Algedi",
    latin: "Deneb Algedi",
    constellation: "Bak",
    gem: "Kalcedon",
    herb: "Majoránna",
    effect: "peace",
    meaning:
      "A Bak farkcsillaga: a hagyomány békét, igazságosságot és megnyugvást társít hozzá.",
  },
];

/** A behéni úton feltett kérdés válaszlehetőségei. */
export const PROTECTIVE_EFFECTS = [
  { id: "protection", label: "Védelem az ártó szándéktól" },
  { id: "wealth", label: "Bőség és gyarapodás" },
  { id: "peace", label: "Béke és megnyugvás" },
  { id: "courage", label: "Bátorság és tartás" },
  { id: "love", label: "Szeretet és barátság" },
  { id: "insight", label: "Tisztánlátás" },
  { id: "success", label: "Elismerés és siker" },
  { id: "charm", label: "Vonzerő" },
];

export const MYTHOLOGY_STORIES = [
  {
    id: "arkasz",
    star: "Sarkcsillag",
    figure: "Arkasz és Kallisztó",
    constellation: "Kis Medve",
    gem: "Holdkő",
    trait: "Iránymutatás",
    story:
      "A Sarkcsillag az egyetlen csillag, amely nem mozdul: körülötte fordul az egész égbolt. A görögök szerint Kallisztó fiát, Arkaszt emelte Zeusz az égre, hogy örökre az anyja mellett maradjon.",
  },
  {
    id: "kynosoura",
    star: "Sarkcsillag",
    figure: "Künoszúra, a nimfa",
    constellation: "Kis Medve",
    gem: "Holdkő",
    story:
      "Egy másik hagyomány szerint Künoszúra, a nimfa dajkálta a csecsemő Zeuszt Kréta barlangjában, és hálából került az égre. A föníciai hajósok róla tájékozódtak, a görögök ezért nevezték a csillagképet Künoszúrának.",
  },
  {
    id: "nemea",
    star: "Regulus",
    figure: "A nemeai oroszlán",
    constellation: "Oroszlán",
    gem: "Gránát",
    trait: "Bátorság",
    story:
      "Az Oroszlán szíve a nemeai oroszláné, amelyet Héraklész puszta kézzel győzött le első munkájaként. A rómaiak Reguluszként, kis királyként emlegették.",
  },
  {
    id: "ariadne",
    star: "Alphecca",
    figure: "Ariadné koronája",
    constellation: "Északi Korona",
    gem: "Topáz",
    trait: "Örök szerelem",
    story:
      "Az Északi Korona Ariadné nászi koronája, amelyet Dionüszosz emelt az égre, hogy a szerelmük emléke soha ne halványuljon el. Az Alphecca ennek a koronának a legfényesebb köve.",
  },
  {
    id: "lailapsz",
    star: "Szíriusz",
    figure: "Lailapsz, a kutya",
    constellation: "Nagy Kutya",
    gem: "Fehér zafír",
    trait: "Hűség",
    story:
      "A Szíriusz Lailapsz, a kutya, amely soha nem tévesztette el a zsákmányát. Zeusz az égre emelte, és azóta is hűségesen követi Oriont a vadászatban.",
  },
  {
    id: "kanikula",
    star: "Szíriusz",
    figure: "A kánikula csillaga",
    constellation: "Nagy Kutya",
    gem: "Fehér zafír",
    story:
      "A rómaiak a Szíriusz hajnali felkeltétől számították az év legforróbb heteit: innen ered a kánikula szó, a canicula, azaz kiskutya nevéből.",
  },
  {
    id: "arktophylax",
    star: "Arcturus",
    figure: "Arktophülax, a medveőrző",
    constellation: "Ökörhajcsár",
    gem: "Sárga zafír",
    trait: "Vezetés",
    story:
      "Az Arcturus neve annyit tesz: a medve őrzője. Az Ökörhajcsár az, aki nyugodt kézzel tereli a Nagy Medvét az égbolton.",
  },
  {
    id: "orpheusz",
    star: "Vega",
    figure: "Orpheusz lantja",
    constellation: "Lant",
    gem: "Akvamarin",
    trait: "Művészet és zene",
    story:
      "A Lant Orpheusz hangszere, amelynek zenéjére a folyók is megálltak. Halála után a múzsák kérésére került az égre.",
  },
  {
    id: "amalthea",
    star: "Capella",
    figure: "Amalthea kecskéje",
    constellation: "Szekeres",
    gem: "Opál",
    trait: "Gondoskodás",
    story:
      "A Capella Amalthea kecskéje, amely a csecsemő Zeuszt táplálta, miközben apja elől rejtegették. Neve kis kecskét jelent.",
  },
  {
    id: "bornemissza",
    star: "Capella",
    figure: "A bőségszaru",
    constellation: "Szekeres",
    gem: "Opál",
    story:
      "Amalthea letört szarvából lett a bőségszaru, a cornucopia, amely mindig megtelt azzal, amire a birtokosának szüksége volt.",
  },
  {
    id: "asztraia",
    star: "Spica",
    figure: "Asztraia búzakalásza",
    constellation: "Szűz",
    gem: "Smaragd",
    trait: "Igazság",
    story:
      "A Spica a búzakalász a Szűz kezében, akit Asztraiával, az igazság istennőjével azonosítottak. Ő hagyta el utolsóként a földet, amikor az emberek elfordultak az igazságtól.",
  },
  {
    id: "orion",
    star: "Betelgeuze",
    figure: "Orion, a vadász",
    constellation: "Orion",
    gem: "Gránát",
    story:
      "Orion a legnagyobb vadász volt, akit egy skorpió csípése ölt meg. Az égen ezért menekül a Skorpió elől: amikor az felkel keleten, Orion már lenyugodott nyugaton.",
  },
  {
    id: "skorpio",
    star: "Antares",
    figure: "A skorpió, amely Oriont megölte",
    constellation: "Skorpió",
    gem: "Ametiszt",
    story:
      "Az Antares a Skorpió szíve, azé az állaté, amelyet Gaia küldött Orion ellen. Neve azt jelenti: a Mars ellenfele, mert vörös fénye a bolygóéval vetekszik.",
  },
  {
    id: "hattyu",
    star: "Deneb",
    figure: "Zeusz hattyúalakja",
    constellation: "Hattyú",
    gem: "Fehér zafír",
    story:
      "A Hattyú Zeusz alakja, amelyben Lédához közeledett. A csillagkép a Tejút mentén tárja szét a szárnyait.",
  },
  {
    id: "sas",
    star: "Altair",
    figure: "Zeusz sasa",
    constellation: "Sas",
    gem: "Citrin",
    story:
      "A Sas Zeusz madara, amely Ganümédészt az Olümposzra ragadta. Az Altair neve a repülő sast jelenti arabul.",
  },
  {
    id: "ikrek",
    star: "Pollux",
    figure: "Kasztór és Polüdeukész",
    constellation: "Ikrek",
    gem: "Akvamarin",
    story:
      "A halhatatlan Polüdeukész megosztotta halhatatlanságát halandó testvérével, Kasztórral, hogy soha ne kelljen elválniuk. Zeusz ezért emelte mindkettőjüket az égre.",
  },
];

export const MYTHOLOGY_TRAITS = MYTHOLOGY_STORIES.filter(
  (story) => story.trait,
).map((story) => ({
  id: story.id,
  label: story.trait,
  star: story.star,
  constellation: story.constellation,
  gem: story.gem,
  story: story.story,
}));

/** A csillag színéhez illő kő, ha nem a behéni hagyomány köti meg. */
export const GEM_BY_COLOUR = [
  { limit: 0.0, gem: "Fehér zafír", tone: "kékesfehér" },
  { limit: 0.3, gem: "Akvamarin", tone: "fehér" },
  { limit: 0.6, gem: "Sárga zafír", tone: "sárgásfehér" },
  { limit: 1.0, gem: "Citrin", tone: "aranysárga" },
  { limit: 1.5, gem: "Gránát", tone: "narancs" },
  { limit: 9.9, gem: "Rubin", tone: "vörös" },
];
