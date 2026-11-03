# Authentication app

This React app provides a simple login and signup form through the GraphQL API. After login, it shows a basic signed-in page. It does not store bearer tokens in browser storage: the API sets an HttpOnly session cookie, and Apollo sends it with each request.

## Run locally

1. Start the backend with `MONGO_URI` and a long random `JWT_SECRET` configured.
2. Set the backend `ALLOWED_ORIGIN` to the Vite origin, usually `http://localhost:5173`.
3. Start this app with `npm run dev`. By default it connects to `http://localhost:4000/graphql`.

To use a different GraphQL URL, set `VITE_GRAPHQL_URL` in a local `.env` file, for example:

```env
VITE_GRAPHQL_URL=https://api.example.com/graphql
```

Public signup creates a `STAFF` account. `ADMIN` accounts must still be created by an existing administrator. The backend cookie is HttpOnly, SameSite=Lax, and Secure in production; deploy the app and API on the same site so the browser can send the cookie.
