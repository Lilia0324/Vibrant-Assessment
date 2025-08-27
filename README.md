# Vibrant LMS — Assessment by Lilia

## Notes from Lilia
I deployed this assessment to a domain that I own: https://lilia.study/vibrant, please try my solutions directly.

I created separated PRs for each problem:

- 1) Inventory table (React + TypeScript + Ant Design Table)
[PR1](https://github.com/Lilia0324/Vibrant-Assessment/pull/1)

- 2) Test results hooks (TanStack Query)
[PR2](https://github.com/Lilia0324/Vibrant-Assessment/pull/2)

- 3) Maintenance API (Express + Knex)
[PR3](https://github.com/Lilia0324/Vibrant-Assessment/pull/3)

- 4) Sample submission form (React + Ant Design Form)
[PR4](https://github.com/Lilia0324/Vibrant-Assessment/pull/4)

- 5) Status badge (Tailwind + accessibility)
[PR5](https://github.com/Lilia0324/Vibrant-Assessment/pull/5)

Please check each PR for detailed descriptions, screenshots and notes from me. 


## What’s here
- `web/` — React + TypeScript + Vite + TanStack Query + Tailwind (blank components & hooks)
- `api/` — Node/Express + Knex (sqlite3 dev-ready) with route stubs

## How to run
### API
```bash
cd api
npm i
npm start
```
- Starts on **http://localhost:4000**

### Web
```bash
cd web
npm i
npm run dev
```
- Starts on **http://localhost:5173**
- Proxies `/api` → `http://localhost:4000`