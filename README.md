# Asga tech

### project structure:

- this project is a monorepo, i.e. hosts multiple apps and packages
- the main top-level folders are:

  - apps: where our apps are reside
  - packages: for general-purpose framework agnostic libraries that are intended to be hosted in a registry such as npm. and can work with other apps.
  - services: for micro services

  to learn more about each app, read it's own README.

# store App

### Demo

[Watch video](./apps/store-ui/src/assets/demo.webm)

### usage guide

1- install the dependencies (pnpm is recommended as it is a monorepo)

`npm install`

2- open the terminal and go to the store app's location

```
cd apps/store-ui
```

start the app

```
npm run start
```

navigate to `http://localhost:4200` in your browser

## technologies used

- Angular v18
- RxJs
- Material design
- Tailwind Css
- PrimeNg
- Docker container
- jest for unit testing

## to do:

- List: pagination
- update the inventory when a user purchase items from a product.
- login / register
