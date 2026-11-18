# ben-vault ("הכספת של בן")

Ben's points-based chores/rewards app. Static `index.html` + Netlify Function
`netlify/functions/vault.mjs` (Netlify Blobs store `ben-vault`). Live target:
`https://ben.dreamtube.life`. DNS for `dreamtube.life` is at name.com.
Never commit the family code; only its SHA-256 (`CODE_HASH`) lives in the repo.
Do not refactor the source files without Ron asking.

## Working with Ron (same standing rules as the DreamTube repos)
- Ron works online only (GitHub + Netlify + phone). Reply in Hebrew, short and plain.
- **Bold every line Ron actually needs to read**: the bottom line, each finding, each action.
- When Ron must do something, give a FULL numbered click-by-click process:
  where to start (exact URL), what to click, what to type/paste (exact values),
  what he should see if it worked, and what to send back. Never a one-line
  "go add X in settings".
- Never give vendor UI paths (Netlify, name.com, GitHub) from memory: verify
  against current docs first, and say a label may differ slightly if unsure.
- Verify state at source (curl/git) before claiming anything is live or works;
  after deploy, prove it with a real check.
- When you find a bug, fix it; still ask before money/irreversible actions.
- "Always" from Ron = standing rule; record it here.
