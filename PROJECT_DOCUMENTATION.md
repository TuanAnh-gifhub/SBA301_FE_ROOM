# SBA_Rent_Room_System - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Directory Structure](#directory-structure)
5. [Features](#features)
6. [Setup & Installation](#setup--installation)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Frontend Components](#frontend-components)
10. [User Roles & Permissions](#user-roles--permissions)
11. [Development Guidelines](#development-guidelines)
12. [Deployment](#deployment)

---

## Project Overview

**Project Name:** SBA_Rent_Room_System (EduRoom)

**Description:** A full-stack web application designed to manage room rental operations. The system allows customers to browse and book rooms, owners to manage their properties, and administrators to oversee the entire platform. The application supports multi-user roles with distinct functionalities for each role.

**Project Type:** Full-Stack Web Application (Monorepo with separate Frontend and Backend)

**Version:** 0.0.1-SNAPSHOT

**Primary Use Cases:**
- Customers: Browse rooms, make bookings, manage reservations, track invoices
- Owners: List properties, manage room details, handle bookings, track payments
- Admins: Manage users, categories, packages, amenities, reports, and platform settings

---

## Technology Stack

### Backend
- **Framework:** Spring Boot 4.0.1
- **Language:** Java 21 (LTS)
- **Build Tool:** Maven
- **Primary Dependencies:**
  - Spring Security (authentication & authorization)
  - Spring Data JPA (ORM & database access)
  - Spring Mail (email notifications)
  - PostgreSQL (relational database)
  - MongoDB (NoSQL database)
  - MapStruct (object mapping)
  - Lombok (code generation)
  - SpringDoc OpenAPI/Swagger (API documentation)
  - ZXing (QR code generation)
  - Jackson (JSON processing)

### Frontend
- **Framework:** React 19.2.4
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + PostCSS
- **State Management:** React Context API
- **HTTP Client:** Axios
- **UI Components:** Ant Design (antd) 6.2.2
- **Primary Dependencies:**
  - React Router DOM (client-side routing)
  - Framer Motion (animations)
  - Lucide React (icons)
  - React Icons
  - Socket.js & STOMP (real-time messaging)
  - Full Calendar (calendar functionality)
  - React Toastify (notifications)
  - React Count Up (counting animations)

### Databases
- **PostgreSQL 16:** Relational database for user, room, booking, payment data
- **MongoDB 7:** NoSQL database for flexible document storage

### DevOps & Deployment
- **Containerization:** Docker & Docker Compose
- **Frontend Server:** Nginx
- **Java Runtime:** OpenJDK 21

---

## Project Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                 │
│                     (Port: 5173/Vite)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Pages: Landing, Login, Dashboard, Admin, Owner  │   │
│  │ Components: Header, Sidebar, Cards, Forms       │   │
│  │ Services: API calls via Axios                   │   │
│  │ State: AuthContext, Custom Hooks               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓
                    HTTP/REST API
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend (Spring Boot)                    │
│              (Port: 8080 with /api/v1 context)           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Controllers: Handle HTTP requests               │   │
│  │ Services: Business logic & operations           │   │
│  │ Repositories: Database persistence              │   │
│  │ Security: JWT/OAuth2 Authentication             │   │
│  │ DTOs: Data Transfer Objects                     │   │
│  │ Entities: JPA Entity Models                     │   │
│  │ Exceptions: Custom Exception Handling           │   │
│  │ Specification: Dynamic Query Building           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
    PostgreSQL 16              MongoDB 7
  (Primary DB)            (NoSQL Storage)
```

### Layered Architecture (Backend)
```
┌─────────────────────────────────┐
│    Controller Layer (REST API)   │ ← Handles HTTP requests
├─────────────────────────────────┤
│    Service/Facade Layer         │ ← Business logic
├─────────────────────────────────┤
│    Repository Layer             │ ← Data access
├─────────────────────────────────┤
│    Entity/Model Layer           │ ← Data representation
├─────────────────────────────────┤
│    Database Layer               │ ← Persistence
│  (PostgreSQL & MongoDB)         │
└─────────────────────────────────┘
```

---

## Directory Structure

### Backend Directory Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/org/rent/room/be/
│   │   │   ├── base/              # Base classes & interfaces
│   │   │   ├── BeApplication.java # Spring Boot entry point
│   │   │   ├── common/            # Common utilities & types
│   │   │   ├── config/            # Spring configuration classes
│   │   │   │   ├── Security config
│   │   │   │   ├── Database config
│   │   │   │   └── OpenAPI/Swagger config
│   │   │   ├── constant/          # Application constants
│   │   │   ├── controller/        # REST endpoints
│   │   │   │   ├── AdminController
│   │   │   │   ├── UserController
│   │   │   │   ├── BookingController
│   │   │   │   ├── RoomController
│   │   │   │   ├── PaymentController
│   │   │   │   └── ...other controllers
│   │   │   ├── dataInitializer/  # Database seed data
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── entity/           # JPA entities (database models)
│   │   │   │   ├── User
│   │   │   │   ├── Room
│   │   │   │   ├── Booking
│   │   │   │   ├── Payment
│   │   │   │   ├── Amenity
│   │   │   │   ├── Category
│   │   │   │   ├── Package
│   │   │   │   └── ...other entities
│   │   │   ├── exception/        # Custom exceptions & handlers
│   │   │   ├── facade/           # Facade pattern classes
│   │   │   ├── mapper/           # MapStruct mappers for DTOs
│   │   │   ├── properties/       # Configuration properties
│   │   │   ├── repository/       # Data access layer
│   │   │   ├── schedule/         # Scheduled tasks & cron jobs
│   │   │   ├── security/         # Security configs (JWT, OAuth2)
│   │   │   ├── service/          # Service interfaces
│   │   │   ├── serviceImpl/       # Service implementations
│   │   │   ├── specification/    # JPA specifications for dynamic queries
│   │   │   └── utils/            # Utility functions & helpers
│   │   └── resources/
│   │       ├── application.yaml   # Main configuration
│   │       └── fonts/             # Font files for PDF generation
│   └── test/java/                # Unit & integration tests
├── pom.xml                       # Maven configuration
├── Dockerfile                    # Docker container build
├── mvnw & mvnw.cmd              # Maven wrapper scripts
└── target/                       # Build output directory
```

### Frontend Directory Structure
```
frontend/
├── src/
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   ├── assets/                    # Static assets (logos, images)
│   ├── components/
│   │   ├── Admin/                 # Admin-specific components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── Header/                # Shared header components
│   │   │   ├── Header.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── AnimatedNavText.tsx
│   │   │   └── ScrambleText.tsx
│   │   ├── Error/
│   │   │   └── NotFound.tsx       # 404 page
│   │   ├── Footer/
│   │   │   └── Footer.tsx
│   │   ├── HeroSection/           # Landing page hero
│   │   │   └── HeroSection.tsx
│   │   └── Owner/
│   │       └── SideBarOwner.tsx
│   ├── config/
│   │   └── axios.ts               # Axios configuration
│   ├── context/
│   │   └── AuthContext.tsx        # Global auth state
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   ├── useAuthCheck.ts        # Auth verification hook
│   │   ├── useBookingIntent.ts    # Booking state hook
│   │   ├── useCountUp.tsx         # Counter animation hook
│   │   └── useUnreadMessages.ts   # Message notification hook
│   ├── layouts/
│   │   └── RootLayout.tsx         # Main layout wrapper
│   ├── pages/
│   │   ├── Admin/                 # Admin pages
│   │   │   ├── AdminPage.tsx
│   │   │   ├── LoginAdmin.tsx
│   │   │   ├── UserManagement/
│   │   │   ├── RoleManagement/
│   │   │   ├── AmenityManagement/
│   │   │   ├── CategoryManagement/
│   │   │   ├── PackageManagement/
│   │   │   ├── PostManagement/
│   │   │   ├── ProfileAdmin/
│   │   │   └── ReportAdmin/
│   │   ├── Customer/              # Customer pages
│   │   │   ├── PackagePage.tsx
│   │   │   ├── LoginPage/
│   │   │   ├── LandingPage/
│   │   │   ├── Booking/
│   │   │   ├── ChatBox/
│   │   │   ├── AboutUs/
│   │   │   └── ...other pages
│   │   └── Owner/                 # Owner pages
│   │       └── ...owner specific pages
│   ├── routes/
│   │   ├── Router.tsx             # Main routing configuration
│   │   └── ProtectedAdminRouter.tsx # Admin route protection
│   ├── services/                  # API service methods
│   │   ├── index.ts
│   │   ├── postService.ts
│   │   ├── usersService.ts
│   │   ├── roleService.ts
│   │   ├── reportService/
│   │   ├── amenities/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── categories/
│   │   ├── chats/
│   │   ├── cities/
│   │   ├── package/
│   │   ├── payment/
│   │   ├── posts/
│   │   ├── rental-areas/
│   │   ├── rooms/
│   │   ├── subscription/
│   │   └── upload/
│   ├── types/                     # TypeScript type definitions
│   │   ├── booking.ts
│   │   └── room.ts
│   ├── utils/                     # Utility functions
│   │   ├── bookingMapper.ts
│   │   ├── iconMapper.ts
│   │   └── imageUrlHelper.ts
│   ├── App.css
│   └── index.css
├── public/                        # Public assets
├── package.json
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── eslint.config.js               # ESLint configuration
├── nginx.conf                     # Nginx configuration for production
├── Dockerfile                     # Docker container build
├── components.json                # Component library config
└── README.md
```

---

## Features

### 1. User Management & Authentication
- **User Roles:** Admin, Owner, Customer
- **Authentication Methods:**
  - Email/Password login
  - Google OAuth2 integration
- **User Profiles:** Profile management, avatar uploads
- **Role-Based Access Control:** Different dashboards for each role

### 2. Room Management (Owner Functionality)
- **Room Listing:** Create, edit, delete room postings
- **Room Details:** Title, description, price, amenities, images
- **Availability:** Set availability calendar
- **Image Upload:** Multiple room images with invoices storage
- **Room Search & Filtering:** By location, price range, amenities

### 3. Booking System
- **Create Bookings:** Customers can book available rooms
- **Booking Status:** Pending, Confirmed, Completed, Cancelled
- **Invoice Generation:** Automatic invoice creation & PDF generation
- **Payment Tracking:** Integration with payment system
- **Booking Calendar:** Visual booking status display

### 4. Payment Management
- **Payment Processing:** Integration with payment gateway
- **Invoice Management:** Generate and store invoices
- **Payment Status Tracking:** Pending, Completed, Failed
- **Subscription Packages:** Premium features with packages

### 5. Amenities & Categories
- **Amenities Management:** Add, edit, delete room amenities
- **Categories:** Organize rooms by category
- **Packages:** Define rental packages with different pricing

### 6. Real-time Communication
- **Chat System:** WebSocket-based messaging between users
- **Notifications:** Real-time notifications using Socket.js & STOMP
- **Unread Messages:** Track unread message count

### 7. Admin Dashboard
- **User Management:** Manage all users and roles
- **Reports:** Generate and view analytics reports
- **System Settings:** Configure platform amenities, categories, packages
- **Post Moderation:** Manage room postings

### 8. Owner Dashboard
- **Property Management:** View and manage all listed properties
- **Booking Management:** Accept/reject/manage bookings
- **Analytics:** Track bookings and payments

### 9. Customer Features
- **Room Discovery:** Browse and search available rooms
- **Booking Management:** View and manage bookings
- **Chat with Owners:** Real-time communication
- **Payment History:** View invoices and payment records
- **Subscription:** Choose subscription packages

### 10. Additional Features
- **File Upload:** Document and image uploads
- **UI/UX:**
  - Responsive design (mobile-first)
  - Dark/Light mode support
  - Smooth animations with Framer Motion
- **API Documentation:** Swagger/OpenAPI documentation
- **Email Notifications:** Automated email notifications
- **Data Export:** Generate reports and exports

---

## Setup & Installation

### Prerequisites
- **Java:** JDK 21 LTS installed
- **Node.js:** Version 18+ with npm
- **Docker & Docker Compose:** Latest version
- **Git:** For version control

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Set Environment Variables:**
   Create a `.env` file in the backend directory:
   ```
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/room_booking_db
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=12345
   SPRING_DATA_MONGODB_URI=mongodb://admin:admin123@localhost:27018/rent_room_db?authSource=admin
   SERVER_PORT=8080
   SERVER_SERVLET_CONTEXT_PATH=/api/v1
   ```

3. **Start Database Services:**
   From the project root, start PostgreSQL and MongoDB:
   ```bash
   docker-compose up -d
   ```

4. **Run Backend:**
   ```bash
   # Using Maven wrapper
   ./mvnw spring-boot:run
   
   # Or using Maven directly
   mvn spring-boot:run
   ```
   The backend will start at `http://localhost:8080/api/v1`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   Create `.env` file in frontend directory (if needed):
   ```
   VITE_API_URL=http://localhost:8080/api/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:5173`

5. **Build for Production:**
   ```bash
   npm run build
   ```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api/v1
- **Swagger UI:** http://localhost:8080/api/v1/swagger-ui.html
- **MongoDB:** localhost:27018 (admin/admin123)
- **PostgreSQL:** localhost:5433 (postgres/12345)

---

## Database Schema

### Main Entities Overview

#### Users
- `id` (PK)
- `email` (UNIQUE)
- `password`
- `firstName`, `lastName`
- `phone`
- `avatar`
- `role` (ENUM: ADMIN, OWNER, CUSTOMER)
- `status` (ACTIVE, INACTIVE, SUSPENDED)
- `createdAt`, `updatedAt`

#### Rooms
- `id` (PK)
- `ownerId` (FK to Users)
- `title`
- `description`
- `price` (per unit time)
- `location`
- `category` (FK to Category)
- `numberOfBeds`
- `numberOfBathrooms`
- `images` (array of URLs)
- `amenities` (Many-to-Many)
- `isAvailable`
- `createdAt`, `updatedAt`

#### Bookings
- `id` (PK)
- `customerId` (FK to Users)
- `roomId` (FK to Rooms)
- `checkInDate`
- `checkOutDate`
- `status` (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `totalPrice`
- `createdAt`, `updatedAt`

#### Payments
- `id` (PK)
- `bookingId` (FK to Bookings)
- `amount`
- `status` (PENDING, COMPLETED, FAILED)
- `paymentMethod`
- `transactionId`
- `createdAt`, `updatedAt`

#### Amenities
- `id` (PK)
- `name`
- `description`
- `icon`

#### Categories
- `id` (PK)
- `name`
- `description`

#### Packages
- `id` (PK)
- `name`
- `description`
- `price`
- `duration`
- `features`

---

## API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
Most endpoints require Bearer Token authentication:
```
Authorization: Bearer <jwt-token>
```

### Main API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/google` - Google OAuth login

#### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

#### Rooms
- `GET /rooms` - Get all available rooms
- `GET /rooms/{id}` - Get room details
- `POST /rooms` - Create new room (Owner)
- `PUT /rooms/{id}` - Update room (Owner)
- `DELETE /rooms/{id}` - Delete room (Owner)
- `GET /rooms/search` - Search/filter rooms

#### Bookings
- `GET /bookings` - Get user bookings
- `GET /bookings/{id}` - Get booking details
- `POST /bookings` - Create booking
- `PUT /bookings/{id}` - Update booking status
- `DELETE /bookings/{id}` - Cancel booking

#### Payments
- `GET /payments` - Get payment history
- `POST /payments` - Create payment
- `GET /payments/{id}` - Get payment details

#### Admin Endpoints
- `GET /admin/dashboard` - Admin dashboard stats
- `GET /admin/users` - Manage users
- `GET /admin/amenities` - Manage amenities
- `GET /admin/categories` - Manage categories
- `GET /admin/packages` - Manage packages
- `GET /admin/reports` - Generate reports

### Swagger Documentation
View complete API documentation at:
```
http://localhost:8080/api/v1/swagger-ui.html
```

---

## Frontend Components

### Key Components

#### Pages
- **LandingPage:** Home page with featured rooms
- **LoginPage:** User authentication
- **PackagePage:** Display subscription packages
- **AdminPage:** Admin dashboard
- **BookingPage:** Booking management
- **ChatBox:** Real-time messaging

#### Shared Components
- **Header:** Navigation bar with user menu
- **Footer:** Site footer
- **Sidebar:** Navigation sidebar (Admin/Owner)
- **UserMenu:** Dropdown user profile menu

#### Hooks (Custom Hooks)
- `useAuthCheck()` - Check user authentication
- `useBookingIntent()` - Handle booking flow
- `useCountUp()` - Number animation
- `useUnreadMessages()` - Track unread messages
- `use-mobile()` - Detect mobile device

#### Services
Each service module handles specific API calls:
- `authService` - Authentication APIs
- `usersService` - User management APIs
- `bookingService` - Booking operations
- `roomsService` - Room management
- `paymentService` - Payment processing
- `amenitiesService` - Amenities CRUD
- `categoriesService` - Category management
- `chatsService` - Messaging APIs

#### State Management
- **AuthContext:** Global authentication state
- **BookingContext:** Booking state (if necessary)
- **React Router:** Page routing

---

## User Roles & Permissions

### Admin Role
**Permissions:**
- Access to admin dashboard
- Full CRUD on users, amenities, categories, packages
- View and moderate all room postings
- Generate reports and analytics
- Manage system settings
- View all bookings and payments

### Owner Role
**Permissions:**
- Create and manage room listings
- View own bookings
- Accept/reject bookings
- View payment records for own rooms
- Manage amenities for own rooms
- Chat with customers
- Access to owner dashboard

### Customer Role
**Permissions:**
- Browse available rooms
- Create bookings
- View own bookings and payment history
- Chat with room owners
- Subscribe to packages
- Update profile
- Upload documents

---

## Development Guidelines

### Code Style & Standards
1. **Backend (Java):**
   - Follow Spring Boot best practices
   - Use MapStruct for DTO mappings
   - Implement custom exceptions for error handling
   - Add JSDoc comments to public methods
   - Use Lombok to reduce boilerplate

2. **Frontend (TypeScript):**
   - Follow React functional component style
   - Use TypeScript for type safety
   - Follow ESLint rules (`npm run lint`)
   - Use Tailwind CSS for styling
   - Organize components by feature

### Git Workflow
1. Create feature branches from `main`
2. Commit messages follow convention: `[feature/fix/docs]: Description`
3. Create pull requests for code review
4. Merge after approval

### Testing
- **Backend:** Use JUnit 5 and MockMvc for unit tests
- **Frontend:** Use Jest/Vitest for component testing

### Documentation
- Update comments when changing logic
- Maintain API documentation in Swagger
- Update this documentation with new features

---

## Deployment

### Docker Deployment

1. **Build Docker Images:**
   ```bash
   # Build backend
   cd backend
   docker build -t sba-rent-room-backend:latest .
   
   # Build frontend
   cd frontend
   docker build -t sba-rent-room-frontend:latest .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Production Deployment Steps
1. Set production environment variables
2. Update database connection strings
3. Build optimized frontend: `npm run build`
4. Deploy using docker-compose or Kubernetes
5. Configure Nginx reverse proxy
6. Set up SSL/HTTPS certificates
7. Configure logging and monitoring

### Environment Configuration
Create production `.env` file with:
```
# Database
SPRING_DATASOURCE_URL=<production-db-url>
SPRING_DATASOURCE_USERNAME=<prod-user>
SPRING_DATASOURCE_PASSWORD=<prod-password>
SPRING_DATA_MONGODB_URI=<prod-mongodb-uri>

# Email
MAIL_USERNAME=<smtp-email>
MAIL_PASSWORD=<smtp-password>

# OAuth
GOOGLE_CLIENT_ID=<prod-google-id>
GOOGLE_CLIENT_SECRET=<prod-google-secret>

# Server
SERVER_PORT=8080
ENVIRONMENT=production
```

---

## Additional Resources

### Documentation Files
- **Backend Note:** [backend/note.txt](backend/note.txt)
- **Frontend README:** [frontend/README.md](frontend/README.md)
- **Database Documentation:** See docker-compose.yml

### External Resources
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAPI/Swagger Guide](https://swagger.io/specification)

### Contact & Support
For questions or issues, refer to the project repository or contact the development team.

---

**Document Last Updated:** March 2025
**Version:** 1.0
**Maintenance Status:** Active Development
