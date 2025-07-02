# vue

Vue 3 in Vite.

## Components
**Change link in index.html**

### Score2

Risk assessment calculation

### DANPSS


### Color code
Psyk sky
Symptom score teal
Infektion orange



## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Release

### Testing

```sh
npm run test
```

### Staging

```sh
npm run staging
```

### Production

```sh
npm run production
```

## Copy to webapp

Components are being built in dist folder. Copy to assets
```sh
gulp vue
```