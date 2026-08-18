# SeatSync - Intermediate Stops Feature

## Overview
This feature allows passengers to board and alight at intermediate stops along a bus route. When a passenger gets down at an intermediate stop, the seat becomes available for other passengers traveling on the remaining segment of that route.

## How It Works

### 1. Database Schema
The system uses `bookings_v2` table to track segment-based bookings:
- **boarding_stop_id**: Where the passenger boards
- **boarding_stop**: Name of boarding stop
- **boarding_sequence**: Order sequence of boarding stop in the route
- **dropping_stop_id**: Where the passenger alights
- **dropping_stop**: Name of dropping stop
- **dropping_sequence**: Order sequence of dropping stop in the route

### 2. Seat Availability Logic
A seat is considered **booked** for a specific segment if:
- The existing booking starts at or before your dropping point AND
- The existing booking ends at or after your boarding point

This allows seats to be reused across different segments of the same route.

### 3. Booking Flow

**Old Flow:**
Search → Select Bus → Choose Seats → Passenger Details → Payment

**New Flow:**
Search → Select Bus → Choose Seats → **Select Stops** → Passenger Details → Payment

### 4. User Experience

#### Step 4: Select Stops (page3-stops.html)
- User sees all stops for the selected route
- Selects a boarding point (pickup location)
- Selects a dropping point (must be after boarding point)
- Available seats are dynamically updated based on selected segment

#### Seat Availability Update (page3.html → page3-stops.html)
- Before: User books seat for entire route
- After: User books seat for specific segment between stops
- Pricing automatically calculated based on segment

## API Endpoints

### 1. Get Stops for a Schedule
```
GET /api/segments/:scheduleId
Response:
{
  success: true,
  stops: [
    {
      id: "uuid",
      name: "Bengaluru",
      sequence: 1,
      arrival_time: "10:00 AM",
      departure_time: "10:00 AM"
    },
    ...
  ]
}
```

### 2. Get Segment-Aware Seat Availability
```
GET /api/seats/segment-availability?scheduleId=xxx&boardingStopSeq=1&droppingStopSeq=3
Response:
{
  success: true,
  availableSeats: [
    { id: "seat-id", seat_number: "A1", row: "A", column: 1 },
    ...
  ],
  bookedCount: 5,
  totalSeats: 40
}
```

### 3. Book with Intermediate Stops
```
POST /api/bookings/segment
Body:
{
  userId: "user-uuid",
  scheduleId: "schedule-uuid",
  busId: "bus-uuid",
  seatId: "seat-uuid",
  seatNumber: "A1",
  boardingStopId: "stop-uuid",
  boardingStopName: "Bengaluru",
  boardingStopSeq: 1,
  droppingStopId: "stop-uuid",
  droppingStopName: "Mysuru",
  droppingStopSeq: 6,
  passengerName: "John Doe",
  passengerPhone: "9876543210",
  passengerAge: 30,
  passengerGender: "male",
  amount: 300,
  tax: 15,
  grandTotal: 315,
  paymentMethod: "card",
  contactEmail: "john@example.com",
  contactPhone: "9876543210"
}
```

### 4. Update Exit Stop (Passenger Alights Early)
```
PATCH /api/bookings/:bookingId/exit-stop
Body:
{
  exitStopId: "stop-uuid",
  exitStopName: "Mandya",
  exitStopSeq: 5
}
Response:
{
  success: true,
  message: "Exit stop updated. Seat availability updated for other passengers."
}
```

## Files Modified/Created

### New Files
- `js/segment-booking.js` - Segment booking handler class
- `page3-stops.html` - Stop selection UI

### Modified Files
- `page3.html` - Updated to redirect to stop selection page
- `page4.html` - Shows boarding/dropping stops in summary
- `payment.html` - Updated step numbers
- `backend/server.js` - Added 4 new API endpoints

## Example Scenario

**Route:** Bengaluru → Mysuru (with 6 stops)
**Bus:** AC Volvo, 40 seats
**Date:** 2026-08-17

### Passenger 1
- Boards at: Bengaluru (Stop 1)
- Drops at: Mysuru (Stop 6)
- Seat: A1
- Status: Entire route booked

### Passenger 2
- Boards at: Ramanagara (Stop 2)
- Drops at: Mandya (Stop 5)
- Seat: A1 ✓ **Available!**
- Status: Can use Seat A1 for this segment

The same seat (A1) is booked by both passengers because their journey segments don't overlap!

## Future Enhancements

1. **Price Calculation Based on Distance**
   - Current: Fixed price per seat
   - Future: Calculate fare based on km between boarding and dropping stops

2. **Seat Upgrade/Downgrade**
   - Allow passengers to change seat type during journey
   - Collect/refund price difference

3. **Real-time Occupancy**
   - Show real-time seat occupancy by segment
   - Display passenger flow along the route

4. **Group Seat Management**
   - Assign nearby seats to group passengers
   - Ensure no gaps in seating arrangement

5. **Admin Dashboard Features**
   - View passenger alighting points
   - Revenue by segment
   - Route occupancy heatmap

## Testing

To test the feature:

1. Navigate to http://localhost:3000
2. Book a ticket: Home → Book Now
3. Search for a bus
4. Select 2-3 seats
5. You'll now see "Select Stops →" button
6. Choose boarding and dropping points
7. Complete passenger details and payment
8. Booking confirmation will show selected stops

## Database Migration

Run this migration on your Supabase database:
```sql
-- See backend/migrations/001-create-routes-stops.sql
```

After migration:
1. Verify tables created: `routes`, `stops`, `bus_schedules`, `bus_seats`, `bookings_v2`
2. Populate stop data for your routes
3. Test API endpoints
