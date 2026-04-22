# Art Gallery Security and Deployment Notes

This repo is now structured for:

- `frontend/` on Netlify
- `backend/` on Render
- Supabase PostgreSQL as the database
- Cloudinary for image storage
- Spring Boot JWT auth with rotating refresh tokens

Key setup files:

- `backend/.env.local.example`
- `backend/.env.render.example`
- `frontend/.env.local.example`
- `frontend/.env.netlify.example`
- `render.yaml`
- `frontend/netlify.toml`
- `supabase/migrations/20260421_add_refresh_tokens_and_security_constraints.sql`
- `supabase/rls_policies.sql`

Important security choices:

- Access tokens are short-lived bearer tokens
- Refresh tokens are stored only in an `HttpOnly` cookie
- Refresh token rotation is backed by the `refresh_tokens` table
- Admin writes are enforced on the backend
- CORS uses explicit origins only
- Uploads are validated server-side before Cloudinary upload
- Error responses returned to users are generic

Before production deploy:

1. Apply the SQL in `schema.sql` or the migration files in Supabase.
2. Create a dedicated admin account in the `users` table with a bcrypt password hash and role `ADMIN`.
3. Set the Render environment variables from `backend/.env.render.example`.
4. Set the Netlify environment variables from `frontend/.env.netlify.example`.
5. Use `APP_AUTH_COOKIE_SECURE=true` and `APP_AUTH_COOKIE_SAME_SITE=None` in production.
