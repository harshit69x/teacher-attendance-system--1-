# Teacher Attendance System

A location-based attendance system for teachers that allows them to mark their attendance when they're within the college premises using their phones.

## Features

- **Location Verification**: Uses the Haversine formula to calculate distance from the college
- **Attendance Marking**: Teachers can mark attendance when within 500 meters of the college
- **Todo List**: Teachers can manage their daily tasks
- **Schedule Viewer**: Teachers can view their daily and weekly schedules
- **Statistics**: Teachers can view their attendance records and analytics

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Simple ID/Password authentication

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env.local` file with:
     \`\`\`
     MONGODB_URI=your_mongodb_connection_string
     \`\`\`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository to Vercel
3. Set up the environment variables
4. Deploy

## Customization

- **College Location**: Update the coordinates in `app/dashboard/page.tsx`
- **Range Limit**: Adjust the 500-meter range in `lib/distance-calculator.ts`
- **Schedule Format**: Customize the schedule display format in `app/schedule/page.tsx`

## License

MIT
