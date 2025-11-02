# API Developer Portal - Project Review & Setup Guide

## 📋 Project Overview

**API Developer Portal** is a full-stack web application for managing, browsing, and documenting APIs. It allows administrators to import OpenAPI specifications, organize APIs into catalogs, and provides a developer-friendly interface for exploring APIs.

---

## 🏗️ Architecture

### **Technology Stack**

#### Frontend (`client/`)
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript
- **UI Framework**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.4
- **UI Components**: Radix UI (comprehensive component library)
- **API Documentation**: Redoc, ReDocly
- **State Management**: React Hooks, React Hook Form
- **Authentication**: JWT tokens stored in localStorage

#### Backend (`server/`)
- **Runtime**: Node.js 18
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB 5 (via Docker)
- **ODM**: Mongoose 8.16.3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB running in container
- **Ports**:
  - Frontend: 3000
  - Backend: 5001 (external) → 5000 (internal)
  - MongoDB: 27017

---

## 📁 Project Structure

```
apidevportal/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js App Router
│   │   ├── (protected)/   # Protected routes (admin, user dashboard)
│   │   └── (public)/      # Public routes (login, register)
│   ├── components/        # React components
│   │   ├── ui/           # Radix UI components (50 files)
│   │   └── ...
│   ├── lib/              # Utilities (api.ts, auth.ts, utils.ts)
│   └── hooks/            # Custom React hooks
│
├── server/                # Express.js backend
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Catalog.js
│   │   ├── Api.js
│   │   ├── Category.js
│   │   ├── Region.js
│   │   └── BusinessType.js
│   ├── routes/           # API route handlers
│   │   ├── auth.js
│   │   ├── catalogRoutes.js
│   │   ├── apiRoutes.js
│   │   ├── categories.js
│   │   └── regionRoutes.js
│   ├── middleware/       # Express middleware
│   │   └── auth.js      # JWT verification
│   └── utils/           # Utilities
│       └── jwt.js       # JWT token generation
│
├── mongo-data/          # MongoDB persistent storage
├── docker-compose.yml   # Docker orchestration
└── README.md           # Basic project info
```

---

## 🔑 Key Features

### 1. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (admin/user)
- Admin registration requires signup code
- Protected routes for authenticated users

### 2. **API Catalog Management**
- Create, read, update, delete catalogs
- Organize APIs by categories
- Filter by regions
- Import OpenAPI/Swagger specifications
- Bulk import endpoints from OpenAPI specs

### 3. **API Management**
- Individual API endpoint management
- Support for multiple HTTP methods
- Tag-based organization
- Version tracking
- Mock testing endpoints

### 4. **Search Functionality**
- Full-text search across catalogs and APIs
- Search by name, description, tags

### 5. **Category & Region Management**
- Create and manage categories
- Region-based filtering

---

## 🚀 How to Start the Project

### **Prerequisites**
- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- Git (to clone the repository)

### **Option 1: Using Docker Compose (Recommended for Production)**

1. **Update Configuration**
   ```bash
   # Edit docker-compose.yml
   # Update NEXT_PUBLIC_API_URL to match your server URL
   # For local development: "http://localhost:5001/api"
   # For production: Your actual server URL
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Start MongoDB on port 27017
   - Build and start the backend server on port 5001
   - Build and start the frontend on port 3000

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api
   - MongoDB: localhost:27017

4. **Stop Services**
   ```bash
   docker-compose down
   ```

5. **Clean Everything (Removes volumes and images)**
   ```bash
   docker-compose down -v --rmi all --remove-orphans
   docker system prune -a --volumes -f
   ```

### **Option 2: Local Development (Without Docker)**

#### **Backend Setup**

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   MONGO_URL=mongodb://localhost:27017/apidevportal
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ADMIN_SIGNUP_CODE=admin123
   ```

4. **Start MongoDB** (if not running)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5
   ```

5. **Start the server**
   ```bash
   npm run dev
   # or
   npm start
   ```
   Server runs on: http://localhost:5000

#### **Frontend Setup**

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if you prefer pnpm
   pnpm install
   ```

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_REQUIRE_ADMIN_CODE=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

---

## 🔐 Default Configuration

### **Environment Variables**

**Backend (`server/.env`)**
```env
MONGO_URL=mongodb://mongo:27017/apidevportal
PORT=5000
JWT_SECRET=s3cr3
ADMIN_SIGNUP_CODE=admin123
```

**Frontend (`client/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_REQUIRE_ADMIN_CODE=true
```

⚠️ **Important**: Change these default values in production!

---

## 📝 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Catalogs**
- `GET /api/catalogs` - Get all catalogs (supports `?region=id` filter)
- `GET /api/catalogs/:catalogId` - Get single catalog
- `POST /api/catalogs` - Create catalog
- `PUT /api/catalogs/:catalogId` - Update catalog
- `DELETE /api/catalogs/:catalogId` - Delete catalog
- `POST /api/catalogs/import` - Import OpenAPI spec
- `GET /api/catalogs/search?q=query` - Search catalogs/APIs

### **APIs**
- `GET /api/apis/:apiId` - Get API details
- `PUT /api/apis/:apiId` - Update API
- `DELETE /api/apis/:apiId` - Delete API
- `POST /api/apis/:apiId/test` - Test API (mock)

### **Categories**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### **Regions**
- `GET /api/regions` - Get all regions

---

## 🐛 Issues & Recommendations

### **Critical Issues**

1. **CORS Configuration**
   - Current: Hardcoded to `http://44.204.68.110:3000`
   - Fix: Use environment variable or allow multiple origins
   ```javascript
   // server/index.js
   const corsOptions = {
     origin: process.env.CORS_ORIGIN || "http://localhost:3000",
     // ...
   };
   ```

2. **Server Dockerfile Port Mismatch**
   - Dockerfile exposes port 5005, but server runs on 5000
   - Fix: Align ports in Dockerfile with actual server port

3. **Hardcoded URLs in docker-compose.yml**
   - `NEXT_PUBLIC_API_URL` contains production IP
   - Fix: Use environment-specific configuration

### **Security Concerns**

1. **Weak JWT Secret**
   - Default: `s3cr3` - too weak for production
   - Recommendation: Use a strong, random secret (32+ characters)

2. **No Rate Limiting**
   - Add rate limiting to prevent abuse

3. **No Input Validation Middleware**
   - Consider adding express-validator or similar

### **Code Quality Improvements**

1. **Error Handling**
   - Inconsistent error responses
   - Add centralized error handling middleware

2. **TypeScript in Backend**
   - Consider migrating server to TypeScript

3. **Environment Variables**
   - Add `.env.example` files for both client and server
   - Document all required variables

4. **Database Models**
   - Some commented-out code (BusinessType)
   - Clean up or remove unused models

### **Missing Features**

1. **API Documentation**
   - Add comprehensive API documentation (Swagger/OpenAPI)
   - Document request/response schemas

2. **Testing**
   - No test files found
   - Add unit and integration tests

3. **Logging**
   - No structured logging system
   - Consider Winston or Pino

4. **Monitoring**
   - Add health check endpoints
   - Consider APM tools

---

## 📊 Database Schema

### **User**
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user')
}
```

### **Catalog**
```javascript
{
  name: String (required),
  description: String,
  color: String,
  category: ObjectId (ref: Category, required),
  visibility: String (enum: ['public', 'private']),
  status: String (enum: ['active', 'inactive']),
  accessRoles: [String],
  tags: [String],
  openapiSpec: Object,
  regions: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### **Api**
```javascript
{
  catalogId: ObjectId (ref: Catalog, required),
  name: String (required),
  endpoint: String (required),
  method: String (required),
  description: String,
  version: String,
  status: String,
  tags: [String],
  openapiSpec: Object
}
```

---

## 🎯 Quick Start Checklist

- [ ] Install Docker & Docker Compose
- [ ] Clone the repository
- [ ] Review and update `docker-compose.yml` configuration
- [ ] Update CORS origin in `server/index.js` if needed
- [ ] Run `docker-compose up -d`
- [ ] Access frontend at http://localhost:3000
- [ ] Register admin account (use admin code from env)
- [ ] Test API endpoints via frontend

---

## 📞 Support

For questions or issues, contact: +1 3095301875

---

## 🔄 Development Workflow

1. **Make Changes**
   - Edit code in `client/` or `server/`
   
2. **Rebuild Docker Images** (if using Docker)
   ```bash
   docker-compose up -d --build
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f [service-name]
   # Example: docker-compose logs -f server
   ```

4. **Database Reset** (Development)
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Last Updated**: Based on current codebase review
**Project Status**: Functional, needs production hardening

