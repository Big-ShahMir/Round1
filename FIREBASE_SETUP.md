# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. In your Firebase project, click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web app icon (</>) to add a web app if you haven't already
5. Copy the configuration object

## 5. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## 6. Firestore Security Rules

Update your Firestore security rules to allow authenticated users to read/write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Recruiters can read/write jobs
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.recruiterId;
    }
    
    // Applications can be read by recruiters and written by interviewees
    match /applications/{applicationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 7. Test the Setup

1. Run your development server: `npm run dev`
2. Navigate to `/login` to test authentication
3. Create a new account and test the sign-up process
4. Verify that users are created in Firebase Authentication and Firestore

## 8. Production Considerations

Before deploying to production:

1. Update Firestore security rules to be more restrictive
2. Enable additional authentication methods if needed (Google, GitHub, etc.)
3. Set up proper CORS policies
4. Configure Firebase hosting if needed
5. Set up monitoring and analytics

## Troubleshooting

- **Authentication errors**: Check that Email/Password auth is enabled
- **Firestore errors**: Verify your security rules and database location
- **Environment variables**: Ensure `.env.local` is in your project root and variables start with `NEXT_PUBLIC_`
- **Build errors**: Make sure all Firebase dependencies are installed (`npm install firebase`)

