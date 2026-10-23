# Radu Burziņš: Backend

Laravel 12 API, autentifikācija, datubāze, privāto failu piegāde un Reverb notikumi.

## Prasības

- PHP 8.2 vai jaunāks ar Laravel vajadzīgajiem paplašinājumiem, tostarp `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `xml` un `ctype`.
- Composer 2.
- MySQL vai MariaDB un piekļuve datubāzes izveidei.
- Git, lai iegūtu projekta kodu.

Node.js šim API nav vajadzīgs; frontend atkarības un palaišana aprakstītas [frontend README](../raduBurzins_front/README.md).

## Instalēšana

1. Atver backend mapi:

   ```powershell
   cd raduBurzins_back
   ```

2. Izveido lokālo vides failu:

   ```powershell
   Copy-Item .env.example .env
   ```

   Bash vai macOS/Linux vidē izmanto `cp .env.example .env`.

3. Izveido datubāzi, piemēram, MySQL konsolē:

   ```sql
   CREATE DATABASE raduburzins CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Pārbaudi `.env` DB iestatījumus (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) un `APP_URL`. Pēc noklusējuma API adrese ir `http://127.0.0.1:8000`.

5. Instalē atkarības un sagatavo lietotni:

   ```powershell
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

   `storage:link` nodrošina publisko failu, piemēram, profila avatāru, piegādi. Albumu un čata attēli glabājas privāti.

6. Pēc izvēles ielādē lokālos demonstrācijas datus:

   ```powershell
   php artisan db:seed
   ```

   Seederis neizveido lietotājus vai administratorus un nepiešķir zināmas paroles. Tas ielādē kalendāra pamatdatus; demonstrācijas notikumi tiek izveidoti tikai tad, ja datubāzē jau ir atbilstošie lietotāji.

## Palaišana

Katru procesu palaid atsevišķā terminālī, atrodoties `raduBurzins_back` mapē.

Laravel API:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Reverb WebSocket serveris:

```powershell
php artisan reverb:start --host=127.0.0.1 --port=8080
```

Čata ziņojumu notikumi tiek sūtīti sinhroni, tāpēc Reverb darbībai atsevišķs queue worker nav vajadzīgs. Ja projektā vēlāk tiek izmantoti rindā sūtīti darbi, palaid arī `php artisan queue:work`.

## Vides mainīgie un Reverb

`.env.example` satur lokālu konfigurācijas paraugu. Aizstāj DB pieslēguma parametrus ar savējiem. `APP_KEY` ģenerē ar `php artisan key:generate`.

Reverb lokālajā konfigurācijā backend un frontend jāizmanto viena un tā pati `REVERB_APP_KEY`; `REVERB_APP_ID` un `REVERB_APP_SECRET` jābūt saskaņotiem backend pusē. `.env.example` vērtības ir paredzētas tikai lokālai izstrādei, ne produkcijai.

Frontend pieslēdzas WebSocket serverim tieši, bet API pieprasījumus lokālajā izstrādē Vite pārsūta uz Laravel. Skatīt [frontend konfigurāciju](../raduBurzins_front/README.md#vides-mainigie-un-api-proxy).

## Pārbaudes un noderīgas komandas

```powershell
php artisan test
php artisan route:list
php artisan config:clear
```

`php artisan migrate:fresh --seed` izdzēš visas tabulas un datus; lieto tikai lokālā vai testa datubāzē.
