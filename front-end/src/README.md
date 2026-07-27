# 🎓 SIGEA — Integrated Academic Management System

**SIGEA** (*Sistema Integrado de Gestão Académica*) is a full-stack enterprise web application designed to manage, streamline, and automate core academic and administrative workflows.

---

## 🛠️ Architecture & Tech Stack

The system follows a decoupled, full-stack architecture separated into front-end and back-end modules:

### **Backend (Node.js & Express)**
* **Core Stack:** Node.js, Express.js, MySQL
* **Design Pattern:** Layered Architecture (`Controllers` ➔ `Services` ➔ `Repositories` ➔ `Models`)
* **Security & Utilities:** Middleware authentication, hashed credential processing, structured routing, and environment config management.

### **Frontend (Angular 16)**
* **Core Stack:** Angular 16, TypeScript, SCSS
* **Project Structure:** Modular design separating domain functionality (`core`, `features`, `layouts`, `shared`)
* **State & Networking:** RxJS, Angular HttpClient (REST API consumption)

---

## 📁 Project Structure

```text
SIGEA/
├── back-end/
│   ├── src/
│   │   ├── config/          # Database and app configurations
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── middleware/      # Auth & request verification
│   │   ├── models/          # Data schemas and entities
│   │   ├── repositories/    # Database query abstraction
│   │   ├── routes/          # API endpoint routes
│   │   ├── services/        # Core business logic layer
│   │   ├── simulator/       # Testing & simulation utilities
│   │   └── utils/           # Helper functions & hash tools
│   └── server.js            # Express application entry point
│
└── front-end/
    └── src/
        └── app/
            ├── core/        # Singleton services & global guards
            ├── features/    # Core functional modules (pages)
            ├── layouts/     # Reusable layout wrappers
            └── shared/      # Shared components, pipes, & directives



🚀 Getting Started
Prerequisites
*Node.js (v16+ recommended)
*MySQL Database
*npm

1. Backend Setup
1.1. Navigate to the backend directory:
cd back-end

1.2. Install dependencies:
npm install

1.3. Create a .env file based on .env.example and set up your MySQL credentials.

1.4. Start the backend server:
npm start



2. Frontend Setup
2.1. Open a new terminal and navigate to the frontend directory:
cd front-end

