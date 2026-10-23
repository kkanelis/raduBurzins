# Radu Burziņš: Frontend

React 19 + Vite vienas lapas lietotne. Tā izmanto Laravel API autentifikācijai un datiem, kā arī Laravel Reverb ģimenes čata reāllaika notikumiem.

## Prasības

- Node.js 18 vai jaunāks un npm.
- Darbojošs Laravel backend ar MySQL/MariaDB; tā pilna uzstādīšana aprakstīta [backend README](../raduBurzins_back/README.md).
- Reverb vajadzīgs čata reāllaika funkcijām; pārējās API sadaļas darbojas arī bez WebSocket servera.

## Instalēšana

1. Atver frontend mapi:

   ```powershell
   cd raduBurzins_front
   ```

2. Izveido lokālo vides failu:

   ```powershell
   Copy-Item .env.example .env
   ```

   Bash vai macOS/Linux vidē izmanto `cp .env.example .env`.

3. Pārbaudi [vides mainīgos](#vides-mainigie-un-api-proxy). Lokālā Vite režīmā `VITE_API_BASE_URL` var atstāt tukšu, jo `/api` un `/broadcasting/auth` pieprasījumus pārsūta Vite proxy.

4. Instalē atkarības:

   ```powershell
   npm install
   ```

## Palaišana

Vispirms palaid backend API `http://127.0.0.1:8000` un Reverb `127.0.0.1:8080` atsevišķos termināļos. Tad frontend mapē palaid:

```powershell
npm run dev
```

Vite izvada precīzu lokālo adresi; pēc noklusējuma tā ir `http://127.0.0.1:5173`.

## Vides mainīgie un API proxy

Frontend `.env.example` paraugs:

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_REVERB_APP_KEY=local-reverb-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

`VITE_API_BASE_URL` lokālā Vite režīmā atstāj tukšu, lai API klients izmantotu relatīvos `/api/...` URL un Vite pārsūtītu tos uz `VITE_API_PROXY_TARGET`. Tas pats proxy apkalpo `/broadcasting/auth`. Ja frontend nav palaists caur Vite proxy, iestati `VITE_API_BASE_URL=http://127.0.0.1:8000`.

Reverb klienta atslēgai `VITE_REVERB_APP_KEY` jāsakrīt ar backend `.env` `REVERB_APP_KEY`. `VITE_REVERB_HOST`, `VITE_REVERB_PORT` un `VITE_REVERB_SCHEME` jāatbilst backend Reverb iestatījumiem. Vides mainīgie tiek nolasīti būvēšanas/palaišanas laikā; pēc `.env` maiņas Vite serveri pārstartē.

Vite proxy darbojas tikai izstrādes serverī. Produkcijā konfigurē `VITE_API_BASE_URL` ar publisko Laravel API adresi un `VITE_REVERB_*` ar sasniedzamo WebSocket adresi pirms `npm run build`.

## Būve, tests un lint

```powershell
npm run build
npm run test
npm run lint
```
