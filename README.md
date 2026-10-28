# Fili-QuizMo

Fili-QuizMo is a responsive quiz platform website built with Next.js, React, and Tailwind CSS. It includes public information pages, mock authentication flows, and separate teacher and admin dashboards.

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

## Notes

- Authentication and dashboard data are mocked; the UI is ready for backend integration.
- The Android package is available at `public/assets/Fili-QuizMo-1.0.0.apk`.
- The app favicon is generated from `Fili-QuizMo Logo.png`.
