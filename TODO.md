# Airline Reservation Booking System Implementation

## Backend Updates
- [ ] Add Passenger, Insurance, Booking MongoDB schemas to server.js
- [ ] Create API endpoints for booking flow:
  - [ ] GET /api/insurances - Get available insurance options
  - [ ] POST /api/bookings - Create new booking
  - [ ] PUT /api/bookings/:id/payment - Process payment and confirm booking
  - [ ] GET /api/bookings/:airlineId - Get bookings for airline dashboard
- [ ] Add seat management logic (update available seats on booking)

## Frontend book-flight page
- [ ] Create Frontend/app/book-flight/page.js with 3-stage booking component
- [ ] Implement PassengerDetails component (stage 1)
- [ ] Implement InsuranceSelection component (stage 2)
- [ ] Implement PaymentGateway component with Razorpay test integration (stage 3)
- [ ] Add state management for booking flow navigation

## Update airline dashboard
- [ ] Add bookings section to Frontend/app/airline-dashboard/page.js
- [ ] Create bookings table showing passenger details and booking info
- [ ] Display booking data alongside flight management

## Connect booking flow
- [ ] Update Frontend/app/search-flights/page.js "Select Flight" button
- [ ] Add navigation to book-flight page with selected flight data
- [ ] Pass flight information to booking process

## Testing & Verification
- [ ] Test complete booking flow end-to-end
- [ ] Verify Razorpay test payments work correctly
- [ ] Ensure seat updates work correctly after booking
- [ ] Test airline dashboard booking display functionality
