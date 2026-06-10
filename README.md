# AXO Service Website

Static animated website for AXO Service.

## Files

- `index.html`
- `services.html`
- `pricing.html`
- `about.html`
- `contact.html`
- `styles.css`
- `script.js`
- `assets/axo.png`

## Host On GitHub Pages

1. Create a new GitHub repository, for example `axo-service`.
2. Upload all files from this folder into the repository root.
3. Go to the repository on GitHub.
4. Open `Settings`.
5. Open `Pages`.
6. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
7. Click `Save`.
8. Wait 1-3 minutes.
9. Your website will be live at:

```text
https://YOUR-USERNAME.github.io/axo-service/
```

Replace `YOUR-USERNAME` with your GitHub username.

## Important

The site includes a currency switcher for INR, USD, and PKR. It fetches live rates from `open.er-api.com` when available and uses fallback rates if the request fails.
