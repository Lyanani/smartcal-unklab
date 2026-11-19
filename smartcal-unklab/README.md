# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## AI schedule assistant

AI-specific source code and setup instructions are grouped in the [ai/ folder](./ai/README.md).

## Login and local data

- Enable Email/Password in Firebase Authentication and create student accounts in Firebase Console.
- Admin login is local. Copy `.env.example` to `.env.local` and set `VITE_ADMIN_EMAILS` to a comma-separated list of admin email addresses.
- Firestore is not used. Calendars, personal schedules, reminders, and checklist data are stored in the current browser only. Admin calendar edits are not shared with other browsers.
- The local admin email check is only a development convenience, not secure authorization for sensitive or shared data.
