# Airline Reservation System

A comprehensive full-stack airline reservation system built with Next.js (Frontend) and Node.js/Express (Backend) with MongoDB database integration.

## 🚀 Features

### User Features
- **Flight Search & Booking**: Search flights by source, destination, and date
- **User Registration & Authentication**: Secure user accounts with password hashing
- **Passenger Information Management**: Store and manage passenger details
- **Insurance Options**: Multiple travel insurance packages (Basic, Premium, Gold)
- **Payment Integration**: Razorpay payment gateway integration
- **Booking Management**: View and manage flight bookings
- **Seat Assignment**: Automatic seat allocation upon booking confirmation

### Airline Management Features
- **Airline Registration**: Airlines can register and get auto-generated credentials
- **Flight Management**: Airlines can add, update, and manage their flights
- **Dashboard**: Comprehensive dashboard for airlines to view bookings and flights
- **Seat Matrix Management**: Dynamic seat matrix with up to 400 seats per flight
- **Operating Days**: Flexible flight scheduling with operating days configuration
- **Discount Management**: Percentage or fixed amount discounts on flights

### Technical Features
- **Caching System**: Flight search results caching for improved performance
- **Real-time Seat Availability**: Dynamic seat tracking and availability updates
- **Payment Verification**: Secure payment processing with signature verification
- **Responsive Design**: Mobile-friendly UI built with Material-UI
- **RESTful API**: Well-structured backend API endpoints

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework for production
- **Material-UI (MUI)** - React components library
- **Framer Motion** - Animation library
- **Date-fns** - Date utility library
- **Razorpay SDK** - Payment integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **Razorpay** - Payment gateway integration
- **xlsx** - Excel file processing

## 📁 Project Structure

```
airline-reservation/
├── Backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── cache/                 # Flight search cache files
│   └── node_modules/
├── Frontend/
│   ├── app/                   # Next.js app directory
│   │   ├── components/        # Reusable React components
│   │   ├── theme/            # Material-UI theme configuration
│   │   ├── layout.js         # Root layout component
│   │   ├── page.js           # Home page
│   │   ├── globals.css       # Global styles
│   │   ├── search-flights/   # Flight search page
│   │   ├── book-flight/      # Flight booking page
│   │   ├── bookings/         # User bookings page
│   │   ├── login/            # User login page
│   │   ├── register/         # User registration page
│   │   ├── airline-dashboard/ # Airline management dashboard
│   │   ├── airline-log/      # Airline login page
│   │   ├── airline-reg/      # Airline registration page
│   │   └── home/             # Home page
│   ├── package.json          # Frontend dependencies
│   ├── next.config.mjs       # Next.js configuration
│   └── README.md             # Frontend-specific README
└── README.md                 # Project README (this file)
```

## 🗄️ Database Schema

### Collections
- **Users**: User accounts and authentication
- **Passengers**: Passenger information for bookings
- **Airlines**: Airline company information
- **AirlineCredentials**: Airline login credentials
- **Flights**: Flight information and seat management
- **Bookings**: Flight booking records
- **Insurances**: Travel insurance options

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd airline-reservation
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Configuration**

   **Backend (.env file in Backend/)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/airline_booking
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   PORT=5000
   ```

   **Frontend (.env.local in Frontend/)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Run the Application**

   **Backend (Terminal 1)**
   ```bash
   cd Backend
   node server.js
   ```

   **Frontend (Terminal 2)**
   ```bash
   cd Frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📡 API Endpoints

### User Endpoints
- `POST /users` - User registration
- `POST /users/login` - User login
- `GET /users/:userId/bookings` - Get user bookings

### Flight Endpoints
- `GET /flights` - Search flights
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:bookingId/payment` - Process payment

### Airline Endpoints
- `POST /api/airlines/register` - Airline registration
- `POST /api/airlines/login` - Airline login
- `GET /api/airlines/:airlineId/flights` - Get airline flights
- `POST /api/airlines/:airlineId/flights` - Add new flight
- `PUT /api/airlines/flights/:flightId` - Update flight
- `DELETE /api/airlines/flights/:flightId` - Delete flight

### Payment Endpoints
- `POST /api/create-order` - Create Razorpay order

### Insurance Endpoints
- `GET /api/insurances` - Get insurance options
- `POST /api/insurances/seed` - Seed insurance data

## 🔧 Key Features Implementation

### Flight Search with Caching
- Intelligent caching system reduces database queries
- Cache files stored in Backend/cache/ directory
- Automatic cache invalidation and updates

### Seat Management
- Dynamic seat matrix generation (up to 400 seats)
- Random seat assignment upon booking confirmation
- Real-time seat availability tracking

### Payment Integration
- Razorpay payment gateway integration
- Secure payment verification with HMAC signatures
- Support for test and production environments

### Responsive Design
- Material-UI components for consistent UI
- Mobile-first responsive design
- Smooth animations with Framer Motion

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm run test
```

## 📦 Deployment

### Backend Deployment
1. Set up environment variables
2. Configure MongoDB connection
3. Deploy to cloud platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application
   ```bash
   npm run build
   ```
2. Deploy to Vercel, Netlify, or any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

## 🔄 Future Enhancements

- [ ] Email notifications for bookings
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Loyalty program integration
- [ ] Mobile app development
- [ ] Real-time flight updates
- [ ] Admin panel for system management
