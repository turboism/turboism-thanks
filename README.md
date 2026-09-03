# Turboism Thanks

# Turboism Thanks

The public acknowledgements site served at [thanks.turboism.dev](https://thanks.turboism.dev). `turboism.dev/thanks` issues a permanent redirect to `thanks.turboism.dev/thanks`; the star link in the Turboism site header points to the subdomain directly. The app is deployed to Vercel from `github.com/turboism/turboism-thanks` via Git integration (push to `main` auto-deploys).

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
