# Smart Healthcare Emergency Routing System

A real-time emergency healthcare platform that helps patients reach the most suitable hospital faster using live data, maps, and AI.

## Problem Statement
In emergency situations, patients lose critical time deciding which hospital to go to. Hospitals also lack prior information about incoming emergencies. This project solves both problems using smart routing and real-time alerts.

## Solution
- Suggests best nearby hospitals based on distance, queue load, and specialization
- Provides real-time navigation using Google Maps
- Sends emergency alerts to hospitals before patient arrival
- Allows image upload in accident cases so doctors can prepare in advance

## Technologies Used (Google Technologies)
- Flutter / React (Lovable frontend)
- Firebase (Authentication, Database)
- Google Maps APIs (Directions, Distance Matrix, Places)
- Gemini API (understanding emergency context)
- Google Cloud Platform

## Features
- User & Hospital Authentication
- Emergency type selection
- Live hospital queue data
- Call doctor directly
- Accident image upload for doctor understanding
- Real-time directions to hospital

## How to Run Locally

1. Clone the repository
   git clone https://github.com/divyanallamolu/REPO_NAME.git

2. Navigate to the project directory
   cd REPO_NAME

3. Install dependencies
   npm install

4. Create `.env` file and add:
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY  
   VITE_GEMINI_API_KEY=YOUR_API_KEY

5. Start the development server
   npm run dev

App runs at:
http://localhost:5173

## Live Demo
https://healthcare-emergency.vercel.app
## Team
credverse
