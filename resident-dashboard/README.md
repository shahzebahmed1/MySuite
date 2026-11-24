# Resident home dashboard

Standalone MySuite resident dashboard for tracking condominium updates — packages, maintenance, bookings, payments, and announcements. Required scripts, shared styles, fonts, images, and demo data are included. Original source files remain in `../newfiles`.

Open a terminal in this folder and run:

```powershell
npm start
```

The server opens the home dashboard automatically at http://127.0.0.1:5174/resident/ . No install step or external packages are needed; Node.js 18 or newer is required. `npm run dev` also works. Stop with Ctrl+C.

Only the home dashboard is included. Links to other portal pages return to Home. Existing dashboard dialogs and local demo data remain available. Browser preferences and demo edits use localStorage on this server's address, so settings from another port are separate.

To use another port in PowerShell:

```powershell
$env:PORT = '5175'
npm start
```

To start without opening the browser, run `npm start -- --no-open`.

`resident/` contains the page and its scripts/styles, `shared/` contains its common dependencies, and `assets/` contains only referenced assets and the carrier icons used by package rows. Keep these folders together when copying this project elsewhere.
