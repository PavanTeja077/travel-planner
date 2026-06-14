# Travel Planner - Backend

This is the backend service for the Travel Planner application. It provides a RESTful API and real-time WebSocket communication to support itinerary planning, expense tracking, and group chat features.

## Tech Stack

- **Node.js & Express.js**: Server framework and routing.
- **MongoDB & Mongoose**: NoSQL database for flexible data storage.
- **Socket.io**: Real-time communication for group chats and live updates.
- **JWT (JSON Web Tokens)**: Secure authentication and authorization.
- **Bcrypt.js**: Password hashing.
- **Cloudinary & Multer**: Image uploading and storage.
- **Node-Cron**: Task scheduling.

## Project Structure

The codebase is organized in a modular structure to separate concerns and improve maintainability:

```text
src/
├── config/         # Environment variables and database configuration
├── controllers/    # Route handlers containing business logic
├── middleware/     # Custom Express middleware (e.g., authentication, error handling)
├── models/         # Mongoose database schemas
├── routes/         # Express route definitions
├── utils/          # Helper functions and utilities
├── server.js       # Express application entry point
└── socket.js       # Socket.io configuration and event handlers
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` root directory and add your environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

## API Endpoints

- **Auth**: `/api/auth` (Register, Login)
- **Users**: `/api/users` (Profile management)
- **Trips/Itineraries**: `/api/trips` (CRUD for trips)
- **Expenses**: `/api/expenses` (Manage trip expenses)
- **Chat**: Handled via Socket.io events.

## Scripts
- `npm start`: Runs the server in production mode.
- `npm run dev`: Runs the server with auto-reloading using `node --watch`.
