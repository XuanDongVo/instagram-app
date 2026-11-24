Instagram App — Full-stack Social Networking Mobile Application
A social networking mobile application built with React Native, Expo, and TypeScript, backed by a Spring Boot REST API. It includes a social feed, profiles, posts, stories, interactions, and one-to-one messaging powered by Firebase.
Project scope: Educational / portfolio project inspired by Instagram. This repository is not affiliated with Instagram or Meta.

Tech Stack
Layer	Technologies
Mobile client	React Native 0.81, Expo SDK 54, TypeScript, Expo Router, React Navigation
API client	Axios, AsyncStorage
Backend	Java 22, Spring Boot 3.4, Spring Security, Spring Data JPA, Maven
Database	MySQL
Authentication	JWT, Spring Security, OTP-based password recovery
Messaging	Firebase Cloud Firestore, Firebase Storage
Media uploads	Cloudinary integration through the backend
Other backend integrations	Redis dependency, Spring Mail


Features
Social experience
- Browse the home feed with pull-to-refresh.
- Create and view posts; interact through likes, comments, and saved posts.
- Explore other users' profiles, edit your own profile, and search for users.
- Create and view stories, including viewing activity.
Authentication and administration
- Register, sign in, and sign out using backend authentication APIs.
- Refresh access tokens and store session tokens on the device.
- Recover accounts with email OTP verification and password reset.
- Separate admin routes for managing users, posts, and comments.
Direct messaging
- One-to-one conversations backed by Cloud Firestore.
- Real-time chat and message subscriptions using Firestore listeners.
- Message attachments, typing indicators, read status, and user presence.
- Message editing, deletion, and recall operations in the chat service.
The sections above describe features and service implementations found in the source. They do not imply that every flow has been end-to-end tested on all platforms.

Architecture
instagram-app/
├── frontend/                      # React Native / Expo application
│   ├── app/                       # Expo Router screens
│   │   ├── (auth)/                # Login, register, OTP, password reset
│   │   ├── (tabs)/                # Feed, posts, search, profiles
│   │   ├── admin/                 # Administration screens
│   │   └── messages/              # Conversation screens
│   ├── components/                # Reusable UI components
│   ├── hooks/
│   ├── services/                  # REST API and Firebase integrations
│   ├── types/
│   └── firebaseConfig.ts
└── backend/                       # Spring Boot application
    ├── pom.xml
    └── src/main/
        ├── java/com/example/
        │   ├── config/           # JWT, security, Cloudinary
        │   ├── controller/       # REST endpoints
        │   ├── dto/
        │   ├── entity/
        │   ├── repository/
        │   └── service/
        └── resources/
            └── example.properties
Data flow
React Native / Expo
    ├── Axios + Bearer JWT ──> Spring Boot REST API ──> MySQL
    │                               └── Media upload ──> Cloudinary
    └── Firebase SDK ───────> Cloud Firestore / Firebase Storage
                                (direct messaging)
Getting Started
Prerequisites
- Node.js and npm
- Android Studio emulator or a compatible Expo development environment
- JDK 22 and Maven (the repository includes Maven Wrapper scripts)
- MySQL
- A configured Firebase project for Firestore and Storage
- Cloudinary credentials for backend media uploads
- SMTP credentials if testing email OTP / password recovery
1. Clone the repository
git clone https://github.com/XuanDongVo/instagram-app.git
cd instagram-app
2. Configure MySQL
Create the local database:
CREATE DATABASE `social-app`;
The backend uses Spring Data JPA, with spring.jpa.hibernate.ddl-auto=update in its example configuration. This is suitable for local development, not a recommended production migration strategy.
3. Configure and run the backend
Use backend/src/main/resources/example.properties as a reference and create a local, untracked backend/src/main/resources/application.properties with your own settings.

At minimum, provide the database connection, JWT secret, Cloudinary credentials, and any mail configuration required for the flows you want to test.

Example (replace all placeholders locally):
spring.application.name=instagram-app
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/social-app
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update

jwt.base64-secret=YOUR_BASE64_ENCODED_JWT_SECRET
cloud_name=YOUR_CLOUDINARY_CLOUD_NAME
api_key=YOUR_CLOUDINARY_API_KEY
api_secret=YOUR_CLOUDINARY_API_SECRET

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_SMTP_USERNAME
spring.mail.password=YOUR_SMTP_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
On Windows:
cd backend
.\mvnw.cmd spring-boot:run
On macOS/Linux:
cd backend
./mvnw spring-boot:run
Important port note: The repository's example.properties specifies port 8081, while frontend/services/api.ts currently targets port 8080. The sample above uses 8080 to match the client. If you choose a different backend port, update the mobile API base URL accordingly.
4. Configure Firebase
The mobile client initializes Firebase in frontend/firebaseConfig.ts. Configure your own Firebase project and ensure Firestore and Storage are enabled with appropriate security rules.

Firebase configuration identifies a project; it is not a replacement for Firestore/Storage security rules. Do not commit private service-account keys or backend secrets.
5. Install and run the mobile app
Open a separate terminal:
cd frontend
npm install
npx expo start
For native development builds, the project also provides:
npm run android
# or
npm run ios
Native builds require a configured Android or iOS development toolchain. Platform support and individual flows have not been verified as published-store releases.
6. Connect the mobile app to the backend
Edit frontend/services/api.ts to use an API base URL reachable from your development device.
Environment	Typical local backend address
Android emulator	http://10.0.2.2:8080/api
iOS simulator	http://localhost:8080/api
Physical phone	http://YOUR_COMPUTER_LAN_IP:8080/api
Web on the same computer	http://localhost:8080/api


For a physical device, both devices generally need access to the same network. The current implementation uses a hardcoded LAPTOP_IP and platform-based URL selection, so check its logic rather than assuming a new configuration will be picked up automatically.
Selected REST API Routes
The Spring Boot backend exposes endpoints under /api/v1.
Area	Example routes
Authentication	POST /auth/register, POST /auth/login
Account recovery	POST /auth/send-otp, POST /auth/verify-otp, POST /auth/reset-password
Posts	GET /post, POST /post, DELETE /post/{postId}
Stories	GET /stories, POST /stories, POST /stories/{storyId}/view
Comments	GET /comments/post/{postId}, POST /comments


Authentication is required for protected endpoints; admin routes are intended for users with the admin role.
Development Notes
- The API client stores access and refresh tokens using AsyncStorage and attempts token renewal after HTTP 401 responses.
- Firebase is used for direct messaging, while core social content is served by Spring Boot endpoints.
- A functional local environment requires matching network settings and valid Firebase, database, and media-service configuration.
- The codebase contains prototype-level configuration and development choices; review authentication, access controls, Firebase rules, CORS, and error handling before public deployment.
- The tracked backend example.properties includes a JWT value and sample account information. Rotate any credentials that have ever been used and avoid committing secrets in subsequent changes.

