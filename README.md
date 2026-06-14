# Travel Planner

A comprehensive, full-stack travel planning application that allows users to collaboratively build itineraries, track trip expenses, and communicate in real-time.

## Project Architecture

This project is structured as a monorepo containing distinct frontend and backend applications. It has been built with high modularity in mind to ensure scalability and ease of maintenance.

- **Frontend**: A modern, responsive React application built with Vite, Tailwind CSS, and Zustand.
- **Backend**: A robust RESTful API built with Node.js, Express, MongoDB, and Socket.io for real-time features.

## Key Features

- **Interactive Itinerary Planning**: Map-integrated scheduling for daily trip activities.
- **Real-time Group Chat**: Dedicated WebSocket-powered chat rooms for specific trips.
- **Expense Tracking**: Easily log and monitor travel expenses.
- **Media Uploads**: Cloudinary integration for handling user and trip images.
- **Secure Authentication**: JWT-based secure access.

## Getting Started

To run the complete application locally, you will need to start both the frontend and backend servers.

### 1. Start the Backend
Navigate to the `backend` directory, install dependencies, and start the dev server.
```bash
cd backend
npm install
npm run dev
```
*(Refer to the Backend README for required environment variables).*

### 2. Start the Frontend
In a new terminal, navigate to the `frontend` directory, install dependencies, and start the Vite server.
```bash
cd frontend
npm install
npm run dev
```
*(Refer to the Frontend README for required environment variables).*
