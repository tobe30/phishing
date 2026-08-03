# PhishGuard

PhishGuard is a basic phishing-awareness simulation web application built as a
final-year project.

An administrator can:

- Add employees.
- Create email templates.
- Send a simulated phishing campaign to authorized test users.
- Track opens, clicks, form submissions, reports, and training completion.
- View campaign results, employee risk scores, and reports.

> **Important:** Use this project only with test accounts or people who have
> clearly agreed to participate. Never collect or store real passwords.

## Technologies Used

### Frontend

- React and Vite
- Tailwind CSS and DaisyUI
- TanStack Query
- Axios
- React Router
- Recharts

### Backend

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Token authentication
- Nodemailer with Brevo SMTP

## Project Structure

```text
phishing/
├── backend/       Backend API, database models and email service
├── frontend/      React user interface
├── docs/          Documentation support files
├── README.docx    Detailed student guide
└── README.md      Quick setup guide
```

## Requirements

Install the following before starting:

- Node.js 22 or newer
- npm
- MongoDB Atlas or a local MongoDB server
- A Brevo SMTP account and verified sender email

## 1. Configure the Backend

Open a terminal and move into the backend folder:

```bash
cd backend
npm install
```

Create or update `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=use_a_long_random_secret

SENDER_EMAIL=your_verified_sender@example.com
SMTP_USER=your_brevo_smtp_username
SMTP_PASS=your_brevo_smtp_key

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

ADMIN_FULL_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose_at_least_8_characters
ORGANIZATION_NAME=Your Organization
ORGANIZATION_INDUSTRY=Education
```

Do not share or commit the real `.env` values.

## 2. Create the Administrator

The application has one administrator and no public signup page.

Run:

```bash
npm run seed:admin
```

Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values to log in.

## 3. Start the Backend

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

## 4. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create or update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the address displayed by Vite, normally:

```text
http://localhost:5173
```

## How to Use the Application

1. Log in with the seeded administrator account.
2. Open **Employees** and add an authorized test employee.
3. Open **Templates** and create a safe simulation email.
4. Check **Settings** and choose the tracking options.
5. Open **Campaigns** and create a campaign.
6. Select the template and target group.
7. Create and send the campaign.
8. Open the received test email.
9. Test the simulation link, report button, and training page.
10. Review the Dashboard, Campaign Result, Training, and Reports pages.
11. Mark the campaign as completed when the test is finished.

## Tracking and Risk Score

Each campaign recipient receives a unique tracking token. The token connects
their actions to the correct campaign record.

The basic risk score works like this:

| Action | Score change |
|---|---:|
| Click simulation link | +20 |
| Submit simulated form | +30 |
| Report the email | -10 |
| Complete training | -20 |

The score is kept between `0` and `100`. An employee with a score of `50` or
higher is counted as **At Risk** on the dashboard.

The fake login form does not send or save the values typed into it. It sends
only the tracking token needed to record the simulation event.

## Useful Commands

### Backend

```bash
npm run dev
npm start
npm run seed:admin
npm run sync:training
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Common Problems

### `JsonWebTokenError: invalid signature`

Make sure login and protected routes use the same `JWT_SECRET_KEY`. Restart the
backend, clear the old browser cookie, and log in again.

### MongoDB authentication failed

Check the database username, password, Network Access settings, and connection
string. Special characters in the password may need URL encoding.

### Email was not received

Check `SENDER_EMAIL`, `SMTP_USER`, and `SMTP_PASS`. The sender must be verified
in Brevo. Also check the spam folder and Brevo email logs.

### Frontend cannot connect to the backend

Confirm that both servers are running and that `VITE_API_URL` is:

```text
http://localhost:5000/api
```

Restart Vite after changing its `.env` file.

## Main Pages

- `/login` — administrator login
- `/dashboard` — application statistics
- `/campaigns` — campaign list
- `/campaigns/new` — create and send a campaign
- `/templates` — manage email templates
- `/employees` — manage employees
- `/training` — view training progress
- `/reports` — view overall results
- `/settings` — edit profile, organization, sender, and tracking settings

## Project Scope

This is a basic academic MVP. It does not include multi-tenant organizations,
automatic campaign expiry, SSO, AI-generated emails, advanced queues, or
enterprise email-provider integrations.

For the complete explanation, testing examples, API reference, troubleshooting,
and defense guide, open `README.docx`.

