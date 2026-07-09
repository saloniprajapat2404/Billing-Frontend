# 🧾 BillFlow - Production-Ready Billing Management System

BillFlow is a fully functional, enterprise-grade, and responsive Billing Management System built using a modern full-stack architecture (**React, Spring Boot, and MySQL**). It includes secure JWT authentication, profile lookups, dashboard aggregates, a billing item customizer, invoice creation, print-ready document previews, and analytical reports.

---

## 🏗️ Project Architecture & Structure

```
billing-management-system/
├── database/
│   └── schema.sql                  # MySQL database initialization script
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/billing/
│   │   │   │   ├── controller/      # REST API Endpoint Controllers
│   │   │   │   ├── service/         # Service layer interfaces
│   │   │   │   │   └── impl/        # Service business logic implementation
│   │   │   │   ├── repository/      # Spring Data JPA Repository query layers
│   │   │   │   ├── entity/          # Hibernate Entity models
│   │   │   │   ├── dto/             # Data Transfer Objects (Request/Response validation)
│   │   │   │   ├── security/        # JWT utilities and Spring Security 6 configurations
│   │   │   │   ├── exception/       # Global Rest Controllers exception handling
│   │   │   │   └── BillingApplication.java  # Core application starter
│   │   │   └── resources/
│   │   │       └── application.properties   # Environment configurations & database connection strings
│   │   └── test/
│   └── pom.xml                      # Maven Build Configuration
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/              # Global UI layout components (Navbar, Sidebar, ProtectedRoute)
│   │   ├── context/                 # React Context for login states (AuthContext)
│   │   ├── pages/                   # Route-level view folders (Login, Signup, Dashboard, Billing, Reports, Profile)
│   │   ├── services/                # Axios instance configuration (api.js)
│   │   ├── index.css                # Global Tailwind CSS styles and fonts
│   │   ├── main.jsx                 # React DOM bootstrapping
│   │   └── App.jsx                  # Main router definitions
│   ├── package.json                 # Node package configuration
│   ├── vite.config.js               # Vite bundler properties and backend proxy mappings
│   ├── tailwind.config.js           # Design system tokens configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── index.html                   # HTML template entry point
├── postman_collection.json          # Postman Collection JSON payload
└── README.md                        # Documentation
```

---

## 🛠️ Tech Stack & Key Features

### Backend (Spring Boot 3 + Java 21)
- **Spring Security 6 & JWT Token Filter**: Secures REST endpoints; generates token on `/api/auth/login` and parses token on protected paths.
- **Spring Data JPA**: Seamless data operations mapping entities to MySQL tables with cascade constraints.
- **BCrypt Hashing**: Encrypts and matches user credentials.
- **Global Error Handling**: Validates request parameters and translates internal exceptions into structured JSON formats.
- **Lombok & Jakarta Validation**: Keeps code clean, reusable, and robust.

### Frontend (React + Vite + Tailwind CSS)
- **React Router v6**: Manages UI state flow across login, dashboard, billing, and profile.
- **Axios HTTP Client**: Centralized requests with request interceptors to dynamically inject token headers.
- **Tailwind Design System**: Curated color schemas (slate gradients) matching top SaaS products.
- **Responsive Navigation**: Retractable side drawer and navbar for tablets, notebooks, and mobile phones.
- **Interactive Invoice Builder**: Real-time pricing calculations, invoice generator, search logs, delete triggers, edit values, and native system print preview hooks.

---

## 🚀 Local Run Instructions

### 1. Database Setup
1. Open your MySQL client (e.g. MySQL Workbench or Terminal).
2. Execute the queries inside [database/schema.sql](file:///C:/Users/praja/.gemini/antigravity/scratch/billing-management-system/database/schema.sql) to create database `billing_db` and tables `users`, `bills`, and `bill_items`.

### 2. Backend Startup
1. Open the `/backend` folder in your IDE (IntelliJ IDEA is recommended).
2. Update the MySQL configurations in [application.properties](file:///C:/Users/praja/.gemini/antigravity/scratch/billing-management-system/backend/src/main/resources/application.properties) if your local MySQL database has a different username, password, or port:
   ```properties
   spring.datasource.username=YOUR_MYSQL_USER
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the application from your IDE, or compile and run using Maven in a terminal:
   ```bash
   mvn spring-boot:run
   ```
   *The server will start on port `8080`.*

### 3. Frontend Startup
1. Open a terminal in the `/frontend` folder.
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:5173`.*

---

## 🧪 Testing REST Endpoints (Postman)
1. Import [postman_collection.json](file:///C:/Users/praja/.gemini/antigravity/scratch/billing-management-system/postman_collection.json) into Postman.
2. Run **Register User** first.
3. Run **Login User** to obtain token (the test script in postman will automatically set the `{{jwt_token}}` variable).
4. Run subsequent requests (Get Profile, Create Invoice, Reports, etc.) to verify API routing.

---

## ☁️ Deployment Guide

### Database (MySQL)
- Deploy to a cloud relational hosting provider like **Railway**, **Aiven**, or **Render (External MySQL database)**.
- Collect connection URL parameters (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) for environment setup.

### Backend (Spring Boot)
- Build a production JAR: `mvn clean package -DskipTests` inside `/backend`.
- Host on **Render**, **Railway**, or **Heroku**.
- Provide these environment variables in your deployment portal:
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (set to your cloud database parameters).
  - `JWT_SECRET` (generate a unique 64-char key).

### Frontend (React)
- Deploy the frontend directory using **Vercel** or **Netlify**.
- Since Vite serves requests locally using proxies, create a `vercel.json` or configure redirection rules so that all client requests pointing to `/api/*` are forwarded directly to your hosted backend URL.
  *(e.g., set up rewrite rules in `vercel.json` or update your Axios base URL to point directly to your cloud backend production link)*.
