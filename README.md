# Agent Management System

A MERN stack application for managing agents and distributing lists.

## Features

- Admin User Login
- Agent Creation & Management
- Uploading and Distributing Lists
- List Status Management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

### Admin user creation 


1. Run the admin creation script:
   ```bash
   node server/scripts/createAdmin.js
   ```

2. The script will create an admin user with the following default credentials:
   - Email: admin@example.com 
   - Password: admin123

   Note: If an admin user already exists, the script will exit without making changes.



### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/agent-management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=24h
   ```

4. Create the initial admin user:
   ```bash
   node scripts/createAdmin.js
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```


## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - Register new agent (admin only)

### Agents
- GET /api/agents - Get all agents (admin only)
- GET /api/agents/profile - Get agent profile
- PUT /api/agents/:id - Update agent (admin only)
- DELETE /api/agents/:id - Delete agent (admin only)

### Lists
- POST /api/lists/upload - Upload and distribute lists (admin only)
- GET /api/lists/my-lists - Get lists for logged-in agent
- GET /api/lists - Get all lists (admin only)
- PATCH /api/lists/:id/status - Update list status
- PUT /api/lists/:id - Update list details (admin only)

## File Upload Format

The system accepts CSV and Excel files (.xlsx, .xls) with the following columns:
- FirstName
- Phone
- Notes

## Security

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Input validation and sanitization

## Error Handling

The application includes comprehensive error handling for:
- Invalid file formats
- Authentication failures
- Database errors
- Input validation
- File upload issues 