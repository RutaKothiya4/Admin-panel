# Admin-Panel 
# Fullstack RBAC Authentication System

A full-stack Role-Based Access Control (RBAC) system built with **React** (client) and **Node.js + Express + MongoDB** (server).

---

## 🛠️ Features

- Register a **Super Admin** user with full permissions.
- Create and manage **Roles**: Super Admin, Manager, User.
- Create and assign **Permissions**: view, create, update, delete.
- Dynamic homepages and feature access based on role permissions.
- Secure backend with JWT access/refresh token authentication.
- Role and permission management with full CRUD operations.

---

## 📋 Functional Specification

### 1. Register Super Admin
The first registered user will be the **Super Admin** and will have full access to roles and permissions.

### 2. Create Roles
After logging in as Super Admin, navigate to **Role Management** and create:

- Super Admin  
- Manager  
- User  

### 3. Add Permissions
From the **Permission Management** section, create the following permissions:

- `view`
- `create`
- `update`
- `delete`

### 4. Assign Permissions to Roles

| Role        | Permissions                |
|-------------|----------------------------|
| Super Admin | view, create, update, delete |
| Manager     | view, create, update         |
| User        | view                         |

### 5. Homepage Functionality Based on Permissions

| Permission | Functionality              |
|------------|----------------------------|
| `view`     | View quotes                |
| `create`   | Create new quotes          |
| `update`   | Edit existing quotes       |
| `delete`   | Delete quotes              |

Users will be redirected to their homepage based on their role, and allowed only the actions they have permission for.

---

## ⚙️ Deployment Instructions & Environment Setup

### 🧾 Prerequisites
Ensure you have **Node.js** and **npm** installed:

```bash
node -v
npm -v
```

---

### 📁 Project Folder Structure

```
fullstack-rbac/
├── client/        # React frontend
├── server/        # Node.js + Express + MongoDB backend
├── .env           # Environment variables
├── package.json   # Project scripts
```

---

### 🚀 Setup Instructions

1. **Open the project** in Visual Studio Code:
   - `File > Open Folder... > Select fullstack-rbac`

2. **Open a terminal** in VS Code:
   - Shortcut: `Ctrl + \`` (backtick)
   - OR `Terminal > New Terminal`

3. **Install root dependencies**:
   ```bash
   npm install
   ```

4. **Install frontend dependencies**:
   ```bash
   cd ./client
   npm install
   ```

5. **Install backend dependencies**:
   ```bash
   cd ../server
   npm install
   ```

6. **Return to root folder**:
   ```bash
   cd ..
   ```

7. **Start the full-stack development server**:
   ```bash
   npm run dev
   ```

---

### 🌐 Local Development URLs

- **Frontend**: [http://localhost:5173](http://localhost:5173)  
- **Backend API**: [http://localhost:5000](http://localhost:5000)

--
