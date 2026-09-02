# Turboism Thanks

The public acknowledgements site canonically served at [turboism.dev/thanks](https://turboism.dev/thanks). The legacy `thanks.turboism.dev` hostname redirects to the canonical path while this app remains independently deployed.

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
