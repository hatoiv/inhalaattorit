# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

inhalaattorit.fi is a live, bilingual (Finnish/Swedish) searchable and filterable catalogue of inhalers, with about 100-200 users a week. It began as a school group project and now has one maintainer, who updates it when needed.

## Working rules

- **Leave working code alone:** this is a student project and some decisions are questionable, but the site works and that is good enough. Make small, targeted changes, and don't refactor, clean up or suggest fixes for things outside the task.
- **Backend changes:** solve things in `frontend/` when that's enough. Backend changes are fine when a task needs them, but be careful, because production data lives in the backend: say what will change first.
- **Git:** Claude's work goes on the `claude_dev` branch (the maintainer's own branch is `dev1`). Commit only when asked, and never push or merge. The maintainer pushes and merges to `main`, and merging to `main` deploys to production on Railway.
- **Medical content:** inhaler data, dosages, age limits and usage instructions change only as explicitly instructed. Don't reword, infer or "correct" medical facts. If something looks wrong, flag it and ask.
- **Swedish:** when Finnish text changes, draft the Swedish version too and list it in your summary so the maintainer can check it.

## Commands

Run all of these from `backend/`. There is no frontend build, and no linter is configured.

```bash
npm install
npm run dev                                                # node --watch, serves the whole site at http://localhost:3000
npm test                                                   # mocha with an in-memory database
npx cross-env NODE_ENV=test mocha tests/drugClass.test.js  # single test file
npm test -- --grep "should return all inhalers"            # tests matching a name
npm run add_admin username=NAME password=PASS              # or generate=LENGTH; also change_password, delete_admin
npm run populate_db -- path/to/file.xlsx                   # the xlsx is not public; column indices are in scripts/populate_db/xlsxIndices.js
```

Without a `test` admin, `npm test` reports one failure: `authModel: should return an admin for a known username`. CI creates that admin first with `npm run add_admin username=test password=test`. Doing the same locally writes to `data/admindata/admins.json`, which is tracked by git, so don't commit that change.

## Architecture

One Express 5 process (`backend/server.js`, `backend/app.js`) serves the API and also serves `frontend/` as static files. Startup order matters: `src/bootstrap` creates the data folders and JWT key before `app.js` is required, because requiring the app opens the database and reads `admins.json`.

### Backend

CommonJS, layered as routes → controllers → models, with SQL written directly in the models using better-sqlite3 (synchronous).

- **Routes:** `/api/inhalers` is public, `/api/admin/login` has a stricter rate limit, and everything else under `/api/admin` requires a JWT. Unknown routes redirect to `/`.
- **Errors:** throw or pass `BackendError(status, message)`, and `errorMiddleware` turns it into a JSON response.
- **Database:** `src/db/schema.sql` and `seed.sql` run only when the database has no tables, so editing them does not change the production database. Tables added later go in `src/db/guides.sql`, which runs on every startup and must stay safe to rerun (`CREATE TABLE IF NOT EXISTS` only).
- **Translations in data:** translatable values live in `*_translation` tables keyed by language. `?lang=` selects `fi` or `sv`, and anything else falls back to `fi`.
- **Admin auth:** admins are stored as bcrypt hashes in `data/admindata/admins.json`, not in the database. Tokens are RS256, last 1 hour, and are all invalidated when the key rotates at 03:00 every night (`src/jobs/`).
- **Images:** an upload is saved to `data/uploads/tmp`, and a forked `src/workers/imageWorker.js` writes `full/{id}.jpeg` and `thumb/{id}.jpeg`. The API returns 201 before the worker finishes. Images are served from `/uploads/...`.
- **Patient guides:** printable PDFs managed in the admin panel's "Potilasohjeet (PDF)" section. Each guide has a Finnish and a Swedish name, an optional PDF per language stored as `data/guides/{id}-{lang}.pdf` (served from `/guides/...`), and an optional group for the usage page. `medicine_guide` connects guides to inhalers; unlike the other relations, an empty `guides` array on save removes them all. Group keys are listed in both `src/models/admin/guides.js` and `frontend/js/guides.js`.
- **Tests:** `NODE_ENV=test` makes `src/db/database.js` use an in-memory database seeded with test medicines. Tests call the backend modules directly, with no HTTP layer.

### Frontend

Plain HTML, CSS and JavaScript with no framework or bundler. API calls go through `js/api.js`. The catalogue page is `index.html` with `js/main.js`, `render.js`, `filter.js` and `search.js`. The admin panel is `admin.html` with `js/admin.js`. On `inhalaattorien-kaytto.html`, the guide buttons of each inhaler type are loaded by `js/inhaler-use.js` into the `data-guide-category` placeholders.

Swedish text lives in one of three places, depending on the kind of text:

- **Short UI strings:** `data-i18n` and `data-i18n-placeholder` attributes, with translations in `js/lang.js`. Finnish stays in the HTML.
- **Long page content:** two parallel blocks, `.lang-fi` and `.lang-sv`, shown or hidden by CSS based on `<html lang>`. Both blocks must be edited.
- **API messages:** the `apiTexts` table in `js/api.js`, keyed by the Finnish text.

## Production

- Railway builds the root `Dockerfile` from `main`.
- A persistent volume is mounted at `/backend/data`, so the database, images, guide PDFs, `admins.json` and `metaDate.json` survive deploys.
- The versions of `admins.json` and `metaDate.json` tracked in git are hidden by the volume in production, so editing them in the repo has no effect there.
- Production data is managed through the admin panel, which can also download a database backup (`/api/admin/backup/download`). The backup contains only the database, not images or guide PDFs. The local `data/db/inhalers.db` is only a local copy.

## Gotchas

- Run the backend from `backend/`, because `jwtPrivateKey.pem` and the admin scripts' `./data/...` paths are relative to the working directory.
- `src/db/database.js` requires `tests/test_script/insert_test_medicines.js` even in production, so that file can't be moved or removed without changing `database.js`.
- `backend/package-lock.json` is gitignored, so each Docker build can resolve newer dependency versions within the `^` ranges.
- Node versions differ: Docker uses 20, CI uses 22.19, and the local machine has 24. Be careful with newer Node features.
- CI runs on pushes to `main` and `dev` and on PRs to them, but not on pushes to `dev1`, so run `npm test` before committing.
- `backend/README.md` is an API reference but is out of date in places. For example, it lists images under `/api/uploads`. Trust the route files.
- `npm run test_db` is broken: it points to `scripts/test_script/`, but the script is in `tests/test_script/`.
