# Turboism Thanks

The public acknowledgements site is available at [turboism.dev/thanks](https://turboism.dev/thanks). The app is independently deployed to Vercel at `thanks.turboism.dev`; the Turboism apex site serves it at `/thanks` without changing the browser URL. Pushes to `main` auto-deploy through the Vercel Git integration.

## Development

```bash
npm install
npm run dev
```

## Updating the list

Edit `public/contributors.json`. Adding a contributor requires only a `name`; `profileUrl` is optional. The page loads this list at runtime, so no component changes are needed.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```
