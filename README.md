# Fili-QuizMo

Fili-QuizMo is a responsive quiz platform website built with Next.js, React, and Tailwind CSS. Admin and teacher authentication use separate Supabase roles; admin access also requires TOTP multi-factor authentication. Dashboard summary cards and charts remain demo data; dashboard lists and search read Supabase tables by default, with deterministic mock rows available only when `SEARCH_DATA_SOURCE=mock`.

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
| `/signup`            | Account sign-up with school ID                       |
| `/teacher-login`     | Teacher login                                        |
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

The Supabase anon/publishable key is intended for browser use and does not bypass Row Level Security. Never expose a Supabase service-role/secret key in a `NEXT_PUBLIC_*` variable or client-side code.

## Dashboard search and filters

The reusable dashboard search UI calls `GET /api/search`. The server derives the user's role and teacher ID from the authenticated Supabase session and membership tables; callers cannot select a role or teacher scope.

Example:

```http
GET /api/search?entity=participants&q=maria&session=SESS-1042&from=2026-09-01&to=2026-10-01&sort=date&dir=desc&page=1&pageSize=20
```

Supported query fields are `entity` (`quizzes`, `participants`, or admin-only `teachers`), `q`, teacher username, admin-only `accountStatus`, participant `quiz` and `session`, `from`, `to`, `sort` (`name`, `date`, `status`), `dir`, `page`, and `pageSize` (capped at 100). The response contains `items`, server-side `pagination`, and role/scope metadata. Errors use `{ "error": { "code": "...", "message": "..." } }`. Search/filter/sort/page state is reflected in the dashboard URL. Passwords are never searched or returned.

Example success response:

```json
{
  "items": [
    {
      "entity": "participants",
      "id": "participant-id",
      "username": "maria.santos",
      "status": "completed",
      "score": 92,
      "quizTitle": "Science Fundamentals",
      "sessionId": "session-id",
      "sessionCode": "SESS-SCI-2081",
      "teacherId": "teacher-uuid",
      "teacherUsername": "msantos",
      "joinedAt": "2026-09-10T09:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 },
  "meta": {
    "entity": "participants",
    "role": "teacher",
    "scope": "own-records",
    "dataSource": "supabase",
    "filters": {
      "q": "maria",
      "accountStatus": null,
      "teacher": "",
      "quiz": "",
      "session": "SESS-1042",
      "from": "2026-09-01",
      "to": "2026-10-01"
    },
    "sort": "date",
    "dir": "desc",
    "searchableFields": [
      "Participant username",
      "Participant status",
      "Quiz title",
      "School ID",
      "Email"
    ]
  }
}
```

Set `SEARCH_DATA_SOURCE=mock` to use deterministic mock rows; the default is `supabase`. Apply `supabase/migrations/202610290001_search_views_and_indexes.sql` to add indexes for the current `quizzes`, `quiz_results`, `teachers`, and `quiz_questions` tables. The migration does not create views or modify RLS policies, grants, publications, or replica identity. Existing table grants and RLS policies must allow teachers only their own rows and admins only their permitted rows (including the existing AAL2 requirement). The API also applies a trusted teacher scope before all user filters: `quizzes.teacher_id` is matched against the numeric `teachers.id` resolved from `teachers.user_id`, while `quiz_results.teacher_id` is matched against the authenticated user's UUID.

The migration adds B-tree indexes for teacher/status/date/session columns and `pg_trgm` GIN indexes for substring-matched text columns. Trigram indexes support the `%term%` `ILIKE` searches without requiring a separate full-text search language configuration. Password columns are intentionally absent from indexes.

To add a filter field, add its key to `SearchFilterKey`, define role/entity visibility in `FILTER_DEFINITIONS`, expose the field in the corresponding `entityConfigs` select/filter configuration, parse and validate it in `validation.ts`, apply it in `query-builder.ts`, then add its control/chip in `SearchFilter` and any required index changes to a migration. Add query-builder and role-scope tests for the new field.

## Dashboard Realtime updates

The admin and teacher dashboards open one Realtime channel and refresh server-rendered data after relevant changes:

- Admin: `quizzes`, `quiz_results`, and `teachers`.
- Teacher: `quizzes` filtered by the numeric `teacher_id`, and `quiz_results` filtered by the authenticated teacher UUID.

Events are debounced for 250 ms before a server refresh. The search hook refetches only when the active entity's table changes. Counts, averages, and score distributions stay in the server data path; the browser does not duplicate that logic.

Apply `supabase/migrations/202610310001_realtime_dashboard.sql` to add those tables to the `supabase_realtime` publication and set `REPLICA IDENTITY FULL` on `quizzes` and `quiz_results`. Realtime `postgres_changes` honors the existing SELECT policies, so no RLS changes are required. If the publication is not enabled, the dashboards still load normally but do not receive live updates.

## Notes

- Both login forms use Supabase Auth. Account registration remains a mock implementation; dashboard stats, lists, and search read Supabase data by default. Provision roles in trusted `app_metadata` before the account can enter its role's dashboard.
- The Android package is available at `public/assets/Fili-QuizMo-1.0.0.apk`.
- The app favicon is generated from `Fili-QuizMo Logo.png`.
