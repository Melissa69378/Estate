# Lafor-t-Immobilier
LaForêt Immobilier public property experience, administration dashboard, and PostgreSQL API.

## Railway deployment

1. Create a Railway project from this repository.
2. Add a PostgreSQL service and connect it to the web service. Railway will provide `DATABASE_URL`.
3. Deploy the repository. Railway uses `npm start` and the `PORT` value automatically.
4. Confirm the deployment health check at `/api/health`.

If Railway reports that the database is missing, add a PostgreSQL service in the same project and link it to the web service. The web service must have `DATABASE_URL` set to the PostgreSQL service's `DATABASE_URL` reference, for example `${{Postgres.DATABASE_URL}}`, then redeploy.

The first application start creates the `properties`, `site_content`, and `inquiries` tables and imports the 12 properties currently shown in the public catalog. Existing rows are never overwritten on subsequent deploys.

Public site: `/`

Admin dashboard: `/admin.html`

The admin dashboard now reads and writes properties and homepage content through the API. `localStorage` is used only as a temporary offline fallback. Reservation checkout creates an inquiry record; it does not charge a card. Connect a payment provider before accepting real payments, and add authentication in front of the admin write endpoints before handling sensitive production data.

For local development, copy `.env.example` to `.env`, provide a PostgreSQL `DATABASE_URL`, then run:

```sh
npm install
npm start
```
