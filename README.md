# hoopx-instagram
HoopX Instagram automation: daily NBA recaps, built with Remotion + GitHub Actions.

## Layout
- `reel/` – Remotion project (Reel + carousel templates)
- `.github/workflows/` – fetch data, render and post (added in later steps)

## Secrets (GitHub → Settings → Secrets → Actions)
- `IG_TOKEN` – Instagram system-user token (never expires)
- `IG_USER_ID` – Instagram account ID
