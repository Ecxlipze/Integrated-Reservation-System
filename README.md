# Integrated Reservation System

A comprehensive B2C and B2B reservation platform built with a Node.js/Express/MongoDB backend and a Next.js/Tailwind/shadcn frontend. It features biometric WebAuthn checkout, a global shopping cart, dynamic inventory management, and role-based access control.

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas cluster (Replica Sets required for ACID transactions)
- Git

## Step 1: Prepare the Database (MongoDB Atlas)

Because the checkout engine relies on strict ACID transactions to prevent double-booking race conditions, you need a MongoDB connection that supports Replica Sets.

1. Log in to your [MongoDB Atlas dashboard](https://cloud.mongodb.com/).
2. Retrieve your cluster's connection string (e.g., `mongodb+srv://...`).
3. Ensure your current IP address is whitelisted in the Atlas Network Access settings.

## Step 2: Start the Backend Server

Open your terminal and navigate to the backend folder of your project.

```bash
cd backend
npm install
```

Configure Environment Variables: Create a file named `.env` in the root of the backend directory (or copy `.env.example`) and add the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=super_secret_jwt_key_for_local_testing
```

Seed the Database (Highly Recommended): Run the seed script to populate your database with mock flights, hotels, buses, and tours so your search engine has data to display.

```bash
npx ts-node src/seed.ts
```

Run the Server:

```bash
npm run dev
```

Your backend API is now actively listening on `http://localhost:5000`.

## Step 3: Start the Next.js Frontend

Open a new, separate terminal window (leaving the backend running) and navigate to the frontend folder.

```bash
cd frontend
npm install
```

Configure Environment Variables: Create a file named `.env.local` in the root of the frontend directory (or copy `.env.local.example`) to link the UI to your API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Run the Next.js Development Server:

```bash
npm run dev
```

Your frontend is now actively running on `http://localhost:3000` (or `3001` if port 3000 is occupied). 

*Note: Accessing the dev server from a local network IP (e.g. `192.168.x.x`) has been allowed via `next.config.ts`.*

## Step 4: View the Application

Open your web browser and navigate to `http://localhost:3000`. 

1. **B2C Customer Flow**: You will be greeted by the public search interface. From there, you can register a new Customer account, add mock inventory to your cart, and test the WebAuthn checkout flow. 
2. **B2B / Admin Flow**: To test the operational side, register a second account, manually change its `role` to `Admin` or `Supplier` in your MongoDB database using Compass or Atlas, and log back in to access the protected `/admin` or `/supplier` dashboards.
