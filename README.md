# Bug Tracker

A web-based bug tracking and team collaboration application designed to help development teams report, manage, track, and resolve software bugs.

The application provides a central place for teams to manage projects, bugs, team members, messages, notifications, reports, and project activity.

---

## Features

### Authentication

* Sign up
* Login
* Logout
* Password reset
* Protected pages
* User roles and permissions

### User Roles

The application supports four roles:

* **Admin** - manages the company, team, projects, and settings
* **Manager** - manages projects, team members, and bugs
* **Developer** - works on bugs and communicates with the team
* **Tester** - reports and tests bugs

---

## Dashboard

The dashboard gives users an overview of their team's bug activity.

It includes:

* Total bugs
* Critical bugs
* Open bugs
* Bugs in progress
* Bugs under review
* Resolved bugs
* Bugs by priority
* Bugs by status
* Bugs created over time
* Created vs resolved bugs
* Project health
* Recent critical bugs

Users can customize the dashboard by adding, removing, and rearranging widgets.

---

## Projects

Users can create and manage projects.

Each project includes:

* Project name
* Description
* Status
* Custom color
* Team members
* Bugs
* Project statistics
* Project reports
* Kanban board

Projects can be archived and restored.

---

## Bug Management

The application uses one bug system throughout the application.

Users can:

* Report bugs
* Edit bugs
* Assign bugs
* Change bug status
* Set priority
* Set severity
* Add labels
* Add due dates
* Add environment information
* Upload screenshots
* Add comments
* View bug activity
* Archive bugs
* Restore archived bugs

### Bug Statuses

Bugs can have the following statuses:

* Open
* In Progress
* Under Review
* Resolved
* Closed
* Reopened

Bugs can be moved backwards when additional work is required.

---

## Bug Information

Each bug can contain:

* Title
* Description
* Steps to reproduce
* Expected behavior
* Actual behavior
* Priority
* Severity
* Assignee
* Reporter
* Due date
* Device
* Operating system
* Browser
* Version
* Labels
* Screenshot

---

## Kanban Board

Projects have a Kanban board for managing bugs visually.

The board contains columns for:

* Open
* In Progress
* Under Review
* Resolved
* Closed
* Reopened

Users can drag bugs between columns to change their status.

Users can also filter the board by:

* Assignee
* Priority
* Severity

---

## Team Management

Team members can be managed from the Team page.

Admins and managers can:

* Invite team members
* Change member roles
* Remove members
* View member activity
* View assigned bugs
* View completed bugs
* View workload

The application also displays whether team members are online, offline, or away.

---

## Messaging

The application includes team messaging.

Users can communicate through:

* Team channels
* Project channels
* Direct messages

Messaging supports:

* Sending messages
* Real-time messages
* File attachments
* @mentions
* Channel members
* Creating channels

---

## Notifications

Users receive notifications when important actions happen.

Examples include:

* A bug is assigned to them
* Someone comments on their bug
* A bug's status changes
* Someone mentions them
* A bug becomes overdue

Users can:

* View notifications
* Filter unread notifications
* Mark notifications as read
* Mark all notifications as read

---

## Reports

The Reports page provides information about the team's bug activity.

Reports include:

* Average resolution time
* Bug reopen rate
* Critical bug rate
* Overdue bugs
* Bugs by severity
* Bugs created and resolved
* Team workload
* Reopened bugs
* Project performance

Reports can be exported as:

* CSV
* PDF

---

## Settings

The application includes settings for:

### Company

* Company name
* Company description
* Company logo
* Industry

### Members

* View team members
* Change roles
* Invite members
* Remove members

### Projects

* Project settings
* Default project settings
* Automatic archive settings

### Roles & Permissions

View what each user role is allowed to do.

### Notifications

Users can choose which notifications they want to receive.

### Security

* Change password
* Two-factor authentication
* Session settings
* Active sessions

### Audit Logs

Admins can view important actions performed within the company.

---

## Archive

Archived bugs and projects are kept separately from active items.

Users can:

* View archived bugs
* View archived projects
* Search archived items
* Restore archived items

---

## File Uploads

Users can upload files to bugs, comments, and messages.

Supported files include:

* PNG
* JPG
* JPEG
* GIF
* WebP
* PDF
* CSV
* TXT
* ZIP

The maximum file size is **10 MB**.

---

## Technology

The application is built with:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Recharts
* Lucide Icons
* Supabase

Supabase is used for:

* User authentication
* Database
* File storage
* Real-time updates

---

## Data

Application data is stored in Supabase.

The main data includes:

* Companies
* Users
* Projects
* Project members
* Bugs
* Bug comments
* Bug activity
* Channels
* Messages
* Notifications
* Audit logs
* Settings

Each company has its own data, keeping different teams separated.

---

## Getting Started

### Requirements

You need:

* Node.js
* npm
* A Supabase account

### Install the application

After downloading or cloning the project, open the project folder in your terminal and run:

```bash
npm install
```

### Start the application

Run:

```bash
npm run dev
```

The application will then open in your browser.

---

## Supabase Setup

The application uses Supabase as its backend.

To connect the application to Supabase, you will need the Supabase project information provided when creating your Supabase project.

The application setup will guide you through connecting the project to Supabase.

The database, authentication, file storage, and real-time features are all handled through Supabase.

---

## Security

The application uses:

* Supabase Authentication
* User roles
* Database security policies
* Company-level data separation
* Protected application pages

Users should only be able to access information belonging to their company and according to their permissions.

---

## Error Handling

The application handles common problems such as:

* Invalid forms
* Network errors
* Missing data
* Unauthorized actions
* Invalid pages
* File upload errors
* Large files
* Empty pages

The application also provides loading states and error messages when data is being loaded or an action fails.

---

## Responsive Design

The application is designed to work on:

* Desktop
* Laptop
* Tablet
* Mobile devices

---

## Project Goal

The goal of Bug Tracker is to provide a simple but complete workspace where software teams can:

1. Create projects
2. Report bugs
3. Assign bugs
4. Track bug progress
5. Communicate with team members
6. Monitor project health
7. Analyze bug activity
8. Manage their team
9. Keep a history of important actions

The application is intended to replace a collection of separate bug tracking, messaging, reporting, and team management tools with one system.
