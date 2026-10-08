# StarSky

Csillagtérkép generáló: megadsz egy várost és egy dátumot, az alkalmazás pedig kirajzolja az akkori égboltot, amit el is menthetsz.

React + Vite frontend, Laravel API backend, canvas alapú rajzolás d3-geo vetítéssel.

## Funkciók

- Városkeresés koordinátákkal (OpenStreetMap Nominatim)
- Csillagtérkép rajzolása HTML5 canvasra, sztereografikus vetülettel
- Elmentett térképek listázása, betöltése, módosítása és törlése
- Demó mód: ha az API nem érhető el, az alkalmazás mock adatokkal működik tovább

## Telepítés

Előfeltételek: Node.js 22+, PHP 8.3+, Composer.

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve
```

Az API a `http://localhost:8000` címen fut.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A felület a `http://localhost:5173` címen érhető el.

## API végpontok

| Metódus | Végpont | Leírás |
| --- | --- | --- |
| GET | `/api/starmaps` | Elmentett térképek listája |
| POST | `/api/starmaps` | Új térkép mentése |
| PUT | `/api/starmaps/{id}` | Térkép módosítása |
| DELETE | `/api/starmaps/{id}` | Térkép törlése |

## Projektstruktúra

```
frontend/src
├── api/          API hívások
├── components/   React komponensek
├── css/          root, layout, style, font, animation, mobile
├── data/         csillagadatok és mock adatok
└── hooks/        saját hookok

backend/app
├── Http/Controllers/Api/
├── Http/Requests/
└── Models/
```

## Tervezett fejlesztések

- Pontosabb csillagpozíciók: helyi csillagidő és napszak figyelembevétele
- Bővebb csillagkatalógus és több csillagkép
- Igényesebb canvas megjelenítés, éjszakai mód
- Three.js előnézet és a térkép letöltése képként
