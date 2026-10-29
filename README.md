# Fili-QuizMo

Fili-QuizMo is a responsive quiz platform website built with Next.js, React, and Tailwind CSS. Admin and teacher authentication use separate Supabase roles; admin access also requires TOTP multi-factor authentication. Dashboard data remains mocked.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

The project is built with Webpack because the Turbopack native bindings are unavailable in the current Windows environment.

## Routes

| Route                | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `/`                  | Home page with app overview, carousel, and team      |
| `/about`             | About Us                                             |
| `/about-app`         | About the App with the APK download                  |
| `/signup`            | Account sign-up                                      |
| `/teacher-login`     | Teacher login with a link to the admin login         |
| `/admin-login`       | Admin login                                          |
| `/teacher-dashboard` | Teacher dashboard with quizzes, students, and scores |
| `/admin-dashboard`   | Admin dashboard for quizzes and teacher management   |

## Supabase authentication setup

1. Create a Supabase project and copy its project URL and publishable key into `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

2. Create admin and teacher users through Supabase Auth or another trusted provisioning process. Set each user's trusted `app_metadata.role` to exactly `admin` or `teacher`, respectively. The admin login rejects teacher accounts, and the teacher login rejects admin accounts. Role values in user-editable `user_metadata` are not used for authorization.
3. Do not allow public sign-up to assign roles. Only a trusted administrator or server-side process should set `app_metadata.role`; never expose a Supabase service-role/secret key in browser code.
4. On an admin's first password sign-in, the admin is prompted to enroll an authenticator app and verify its current TOTP code. Subsequent admin sign-ins require that code. The `/admin-dashboard` server route independently verifies the authenticated user, `admin` role, and AAL2 before rendering.
5. The `/teacher-dashboard` server route independently verifies the authenticated user and `teacher` role. Both dashboard routes enforce authorization on the server; the proxy refreshes Supabase cookies but is not the authorization boundary.
6. Keep database access protected with Row Level Security. Policies for admin-only data should validate trusted admin metadata and `auth.jwt()->>'aal' = 'aal2'`; teacher policies should validate the trusted teacher role. Route protection does not replace database authorization.

The Supabase publishable key is intended for browser use and does not bypass Row Level Security. Never expose a Supabase service-role/secret key in a `NEXT_PUBLIC_*` variable or client-side code.

## Notes

- Both login forms use Supabase Auth. Account registration and dashboard data remain mock implementations; provision roles in trusted `app_metadata` before the account can enter its role's dashboard.
- The Android package is available at `public/assets/Fili-QuizMo-1.0.0.apk`.
- The app favicon is generated from `Fili-QuizMo Logo.png`.
