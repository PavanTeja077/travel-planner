# Travel Planner - Frontend

This is the frontend application for the Travel Planner. It provides an intuitive, responsive user interface for users to plan their itineraries, track expenses, and communicate with fellow travelers in real time.

## Tech Stack

- **React 19**: Modern UI library using hooks and functional components.
- **Vite**: Ultra-fast build tool and development server.
- **React Router**: Client-side routing for seamless navigation.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI styling.
- **Zustand**: Lightweight global state management.
- **Socket.io-client**: Real-time bidirectional event-based communication.
- **React Leaflet & Google Maps API**: Interactive maps for trip planning.
- **Axios**: Promise-based HTTP client for API requests.
- **Lucide React**: Beautiful and consistent SVG icons.

## Project Structure

The React codebase is highly modular, separating UI components from business logic and state:

```text
src/
├── assets/         # Static assets like images and global CSS
├── components/     # Reusable UI components (Navbar, Buttons, Modals)
├── pages/          # Top-level route components (Home, Dashboard, ItineraryPlanner)
├── services/       # API integration and Axios configuration
├── store/          # Global state management using Zustand
├── App.jsx         # Main application layout and routing setup
└── main.jsx        # React DOM entry point
```

## Features

- **Authentication**: Secure login and signup flows.
- **Dashboard**: Overview of upcoming and past trips.
- **Itinerary Planner**: Interactive day-by-day travel planning with map integration.
- **Expense Tracker**: Keep track of shared or individual travel costs.
- **Real-time Chat**: Dedicated communication channel for trip members.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- The backend server running locally or deployed.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` root directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Bundles the app for production.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Runs ESLint for code quality checks.
