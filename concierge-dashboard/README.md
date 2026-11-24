# Concierge home dashboard

Standalone copy of the existing concierge home dashboard, including its required scripts, shared styles, fonts, images, and demo data. Original source files remain in `../newfiles`.

Open a terminal in this folder and run:

```powershell
npm start
```

The server opens the home dashboard automatically at http://127.0.0.1:5174/concierge/ . No install step or external packages are needed; Node.js 18 or newer is required. `npm run dev` also works. Stop with Ctrl+C.

Only the home dashboard is included. Links to other portal pages return to Home. Existing dashboard dialogs and local demo data remain available. Browser preferences and demo edits use localStorage on this server's address, so settings from another port are separate.

To use another port in PowerShell:

```powershell
$env:PORT = '5175'
npm start
```

To start without opening the browser, run `npm start -- --no-open`.

`concierge/` contains the page and its scripts/styles, `shared/` contains its common dependencies, and `assets/` contains only referenced assets and the carrier icons used by package rows. Keep these folders together when copying this project elsewhere.
