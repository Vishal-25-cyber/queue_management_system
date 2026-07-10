# Smart Queue Management System for Hospitals

A full-stack web application built with MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.IO for real-time queue management in hospitals.

## Features

### Patient Features
- ✅ User registration and login
- ✅ View available doctors
- ✅ Book tokens in queue
- ✅ Real-time queue updates using Socket.IO
- ✅ View current token number and queue position
- ✅ View estimated waiting time
- ✅ Cancel token
- ✅ Responsive mobile-friendly UI

### Doctor Features
- ✅ Login and dashboard
- ✅ View today's patient queue
- ✅ Call next patient
- ✅ Mark consultation as completed
- ✅ View patient details
- ✅ Real-time queue updates
- ✅ View consultation statistics

### Admin Features
- ✅ Add, edit, and delete doctors
- ✅ View all patients
- ✅ View all appointments
- ✅ Monitor queue status
- ✅ Dashboard analytics
- ✅ Total patients, active queues, and completed consultations

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

### Frontend
- **Library**: React.js 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.IO Client
- **Build Tool**: Vite
- **Styling**: CSS3

## Project Structure

```
queue-management-system/
├── backend/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── env.js              # Environment variables
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   ├── doctorController.js # Doctor operations
│   │   ├── patientController.js # Patient operations
│   │   └── adminController.js  # Admin operations
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── authorize.js        # Role-based access
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Doctor.js           # Doctor schema
│   │   ├── Token.js            # Queue token schema
│   │   └── Appointment.js      # Appointment schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── doctorRoutes.js     # Doctor endpoints
│   │   ├── patientRoutes.js    # Patient endpoints
│   │   └── adminRoutes.js      # Admin endpoints
│   ├── socket/
│   │   └── socketHandler.js    # Socket.IO events
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Main server file
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── Alert.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── PatientDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── NotFound.jsx
    │   │   └── Unauthorized.jsx
    │   ├── layouts/
    │   │   └── MainLayout.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── QueueContext.jsx
    │   ├── styles/
    │   │   ├── Global.css
    │   │   ├── Navbar.css
    │   │   ├── AuthPages.css
    │   │   ├── Dashboard.css
    │   │   ├── Alert.css
    │   │   └── ...
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── .gitignore
```

## Installation Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/queue-management
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start MongoDB** (if local)
   ```bash
   # Windows
   mongod
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

6. **Run backend server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Application will run on http://localhost:5173

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "9876543210",
  "role": "patient" // or "doctor"
}

Response: 201 Created
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "user": { ... }
}
```

### Doctor Endpoints

#### Get All Doctors
```
GET /api/doctors

Response: 200 OK
{
  "success": true,
  "count": 10,
  "doctors": [ ... ]
}
```

#### Get Doctor by ID
```
GET /api/doctors/:id

Response: 200 OK
{
  "success": true,
  "doctor": { ... }
}
```

#### Get Today's Queue (Doctor only)
```
GET /api/doctors/queue/today
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 5,
  "tokens": [ ... ]
}
```

#### Call Next Patient (Doctor only)
```
PUT /api/doctors/call-patient
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Patient called successfully",
  "token": { ... }
}
```

#### Complete Consultation (Doctor only)
```
PUT /api/doctors/complete-consultation/:tokenId
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Patient is stable"
}

Response: 200 OK
{
  "success": true,
  "message": "Consultation completed successfully",
  "token": { ... }
}
```

### Patient Endpoints

#### Book Token
```
POST /api/patients/book-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor_id"
}

Response: 201 Created
{
  "success": true,
  "message": "Token booked successfully",
  "token": {
    "_id": "token_id",
    "tokenNumber": 5,
    "queuePosition": 5,
    "status": "waiting",
    "doctor": { ... }
  }
}
```

#### Get My Token
```
GET /api/patients/my-token
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "token": { ... }
}
```

#### Get Queue Status
```
GET /api/patients/queue-status/:tokenId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "queueStatus": {
    "tokenNumber": 5,
    "queuePosition": 3,
    "status": "waiting",
    "estimatedWaitTime": 45,
    "doctor": "Dr. Smith"
  }
}
```

#### Cancel Token
```
PUT /api/patients/cancel-token/:tokenId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Token cancelled successfully"
}
```

### Admin Endpoints

#### Add Doctor
```
POST /api/admin/doctors
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Dr. Smith",
  "email": "doctor@example.com",
  "password": "password123",
  "phone": "9876543210",
  "department": "Cardiology",
  "qualifications": "MBBS, MD",
  "experience": 10,
  "consultationFee": 500
}

Response: 201 Created
{
  "success": true,
  "message": "Doctor added successfully",
  "doctor": { ... }
}
```

#### Dashboard Stats
```
GET /api/admin/dashboard
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "stats": {
    "totalPatients": 50,
    "totalDoctors": 10,
    "activeQueues": 5,
    "completedConsultations": 25,
    "totalAppointments": 100
  }
}
```

## Socket.IO Real-time Events

### Client Events (Emit)
- `join_queue` - User joins a queue
- `token_booked` - Patient books a token
- `call_next_patient` - Doctor calls next patient
- `consultation_completed` - Doctor completes consultation
- `token_cancelled` - Patient cancels token
- `doctor_online` - Doctor comes online
- `doctor_offline` - Doctor goes offline
- `get_queue_status` - Get current queue status

### Server Events (Listen)
- `queue_updated` - Queue has been updated
- `patient_called` - Patient is called for consultation
- `consultation_ended` - Consultation is completed
- `doctor_status_changed` - Doctor status changed (online/offline)
- `queue_status` - Current queue status
- `queue_positions_updated` - Queue positions updated

## Usage Guide

### For Patients
1. Register with your name, email, phone, and password
2. Login to your dashboard
3. View available doctors with their details and ratings
4. Click "Book Token" to get a queue token
5. View your current token number and queue position
6. Receive real-time updates when your turn is coming
7. You can cancel your token if needed

### For Doctors
1. Login with your credentials
2. View today's patient queue
3. Click "Call Next Patient" to call the next waiting patient
4. View patient details and consult
5. Click "Complete" after consultation
6. View your consultation statistics

### For Admins
1. Login with admin credentials
2. Add new doctors with their details
3. View all patients and appointments
4. Monitor queue status for each doctor
5. View dashboard analytics
6. Manage hospital operations

## Development Commands

### Backend
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (patient|doctor|admin),
  department: String,
  qualifications: String,
  experience: Number,
  availability: [String],
  consultationFee: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  department: String,
  qualifications: String,
  experience: Number,
  consultationFee: Number,
  availability: [String],
  bio: String,
  isOnline: Boolean,
  totalConsultations: Number,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Token Collection
```javascript
{
  _id: ObjectId,
  doctorId: ObjectId (ref: Doctor),
  doctorUserId: ObjectId (ref: User),
  patientId: ObjectId (ref: User),
  patientName: String,
  tokenNumber: Number,
  status: String (waiting|called|in-progress|completed|cancelled),
  queuePosition: Number,
  estimatedWaitTime: Number,
  bookedAt: Date,
  calledAt: Date,
  completedAt: Date,
  notes: String,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ CORS enabled
- ✅ Environment variables for sensitive data
- ✅ Error handling middleware

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution: Make sure MongoDB is running
Windows: mongod
macOS: brew services start mongodb-community
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution: Kill the process using the port
Windows: netstat -ano | findstr :5000
macOS/Linux: lsof -i :5000 | grep LISTEN
```

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution: Ensure FRONTEND_URL is correctly set in .env
```

## Performance Optimization

1. **Database Indexing**: Indexes on frequently queried fields
2. **Real-time Updates**: Socket.IO for instant updates without polling
3. **Lazy Loading**: Components load on demand
4. **Caching**: Token stored in localStorage to reduce API calls
5. **Pagination**: Handle large data sets efficiently (future implementation)

## Future Enhancements

- 📅 Appointment scheduling system
- 💬 In-app messaging between patients and doctors
- 💰 Payment integration
- 📊 Advanced analytics and reporting
- 📱 Mobile app using React Native
- 🔔 Push notifications
- ⭐ Patient ratings and reviews
- 🗂️ Medical records management
- 🔒 Two-factor authentication
- 📧 Email notifications

## License

MIT License - feel free to use this project for personal or commercial use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please create an issue in the repository or contact the development team.

## Author

Built with ❤️ for better hospital queue management

---

**Happy Coding!** 🚀
