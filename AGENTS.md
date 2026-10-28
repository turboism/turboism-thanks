# Agent Notes

This repository owns the independent Thanks service mounted at `turboism.dev/thanks`.

- Keep the site focused on public acknowledgements and gratitude.
- Contributor entries live in `public/contributors.json`; do not hard-code names in components. Adding a contributor should require editing only this JSON list.
- Maintain complete English, Simplified Chinese, and Japanese interface copy.
- Follow the approved Violet V4 brand via `brand/`: #6A5ACD primary, #EEE8AA highlight and #FCFBF7 background. Render contributors as floating solid-color polygonal stars and real-world flowers that reveal contributor names below on hover/focus and open `profileUrl` links in a new tab; do not replace them with product capability words or add OC artwork.
- When starting a local preview, also expose it through a public tunnel and share the tunnel URL.
