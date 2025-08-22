# ECE 4180 Course Website

This is the frontend for the ECE 4180 Embedded Systems Design course website. It provides a platform for students to access course materials, complete lab assignments, and submit video demonstrations of their work.

## Features

- **Authentication**: Secure login and registration using AWS Cognito
- **Role-based Access Control**: Different views and permissions for students and staff
- **Course Materials**: Access to lecture notes, tutorials, and resources
- **Lab Assignments**: Six progressive lab assignments focused on ESP32-C6 development
- **Video Submissions**: Students can upload video demonstrations of their completed labs
- **Admin Dashboard**: Staff can manage students, unlock labs, and review submissions

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: AWS Cognito
- **API**: AWS API Gateway with Lambda functions
- **Storage**: AWS S3 for video storage
- **Database**: AWS DynamoDB for submissions and lab status

## Project Structure

```
frontend/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── labs/          # Lab-related components
│   │   ├── layout/        # Layout components (header, footer)
│   │   └── submissions/   # Video submission components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Entry point
│   └── aws-config.ts      # AWS configuration
└── package.json           # Dependencies and scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_USER_POOL_ID=your-cognito-user-pool-id
   REACT_APP_USER_POOL_CLIENT_ID=your-cognito-client-id
   REACT_APP_API_ENDPOINT=your-api-gateway-endpoint
   REACT_APP_S3_BUCKET=your-s3-bucket-name
   ```
4. Start the development server:
   ```
   npm start
   ```

## Backend Infrastructure

The backend is built using AWS CDK and consists of:

- **AWS Cognito User Pool**: For authentication with custom attributes for roles
- **AWS API Gateway**: RESTful API endpoints with Cognito authorizer
- **AWS Lambda Functions**: Business logic for authentication, labs, and submissions
- **AWS DynamoDB Tables**: For storing lab status and submissions
- **AWS S3 Bucket**: For storing video submissions with lifecycle policies

## Deployment

To deploy the frontend:

1. Build the production version:
   ```
   npm run build
   ```
2. Deploy the build folder to your hosting service of choice (AWS S3, Amplify, etc.)

## License

This project is part of the ECE 4180 course at Georgia Institute of Technology.
