# Quick Reference: Intermediate Stops Feature

## 🎯 What's New?

Users can now board and drop at any intermediate stop on a bus route. When someone gets down early, their seat opens up for other passengers on remaining segments.

## 📍 The Stops Flow (New Step 4)

```
┌─────────────────────────────────────────┐
│  STEP 4: SELECT YOUR STOPS              │
├─────────────────────────────────────────┤
│                                         │
│  🚌 Boarding Point                     │
│  [Select from dropdown ▼]               │
│                                         │
│  🏁 Dropping Point                     │
│  [Select from dropdown ▼]               │
│                                         │
│  ✓ Only stops after boarding shown    │
│  ✓ Real-time seat availability        │
│  ✓ Trip summary updates live          │
│                                         │
│  [Continue to Passenger Details →]    │
└─────────────────────────────────────────┘
```

## 💡 Example: Reusing the Same Seat

### Route: Bengaluru → Mysuru (6 stops)

| Passenger | Seat | Boarding | Dropping | Status |
|-----------|------|----------|----------|--------|
| Alice | A1 | Bengaluru (Stop 1) | Mysuru (Stop 6) | ✓ Booked |
| Bob | A1 | Ramanagara (Stop 2) | Mandya (Stop 5) | ✓ Booked (same seat!) |

**Why it works?** No overlap!
- Alice: Stops 1→6
- Bob: Stops 2→5
- ✓ Bob can use A1 after Ramanagara

## 🔄 Validation Rules

✅ **Must select:** Boarding point and Dropping point
✅ **Dropping must be:** After Boarding (different stop)
❌ **Cannot select:** Same stop for boarding and dropping
❌ **Cannot select:** Dropping before Boarding

## 📊 How Seat Availability Works

```
SEAT AVAILABLE if:
booking.boarding_sequence ≤ your_dropping_sequence
AND
booking.dropping_sequence ≥ your_boarding_sequence

(In other words: NO overlap in journey segments)
```

### Example
- Your segment: Ramanagara (Stop 2) → Mandya (Stop 5)
- Existing booking: Bengaluru (Stop 1) → Mysuru (Stop 6) ❌ CONFLICTS
- Existing booking: Ramanagara (Stop 2) → Channapatna (Stop 3) ❌ OVERLAPS
- Existing booking: Mandya (Stop 5) → Mysuru (Stop 6) ✓ NO CONFLICT
- Existing booking: Bengaluru (Stop 1) → Ramanagara (Stop 2) ✓ NO CONFLICT

## 🛠️ For Developers

### JavaScript API

```javascript
// 1. Load stops for a schedule
await segmentBooking.loadStops(scheduleId);

// 2. Display stop selector UI
const { boardingSelect, droppingSelect } = 
  segmentBooking.displayStopSelection('containerId');

// 3. Get selected stops
const { boarding, dropping } = segmentBooking.getSelectedStops();

// 4. Validate selection
if (segmentBooking.validateSegment()) {
  // Proceed to next step
}

// 5. Get available seats for segment
const availability = await segmentBooking.getAvailableSeats(
  boardingStopSeq, 
  droppingStopSeq
);

// 6. Book a seat
const result = await segmentBooking.bookSeat({
  userId, scheduleId, busId, seatId, seatNumber,
  boardingStopId, boardingStopName, boardingStopSeq,
  droppingStopId, droppingStopName, droppingStopSeq,
  passengerName, passengerPhone, passengerAge, passengerGender,
  amount, tax, grandTotal, paymentMethod,
  contactEmail, contactPhone
});

// 7. Update exit stop (passenger alights early)
await segmentBooking.updateExitStop(bookingId, {
  id: stopId,
  name: stopName,
  sequence: stopSeq
});
```

### New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/segments/:scheduleId` | Get all stops |
| GET | `/api/seats/segment-availability` | Check available seats |
| POST | `/api/bookings/segment` | Create booking |
| PATCH | `/api/bookings/:id/exit-stop` | Update exit point |

## 📱 User Journey

```
1️⃣  Search
    └─ Select Route, Date, Passengers

2️⃣  Select Bus
    └─ Choose from available buses

3️⃣  Choose Seats
    └─ Pick seats on seat map
    └─ Button changes to "Select Stops →"

4️⃣  SELECT STOPS ← NEW!
    └─ Choose boarding point
    └─ Choose dropping point
    └─ See real-time available seats
    └─ Continue to Passenger Details

5️⃣  Passenger Details
    └─ Enter name, age, gender for each passenger
    └─ Enter contact email and phone

6️⃣  Payment
    └─ Choose payment method (Card/UPI/Net Banking)
    └─ Complete payment
    └─ Get booking confirmation
```

## 🎟️ Session Storage Keys

```javascript
sessionStorage.ss_booking = {
  // ... bus details ...
  
  // NEW fields after stop selection:
  boardingStop: {
    id: "stop-uuid",
    sequence: 2,
    name: "Ramanagara",
    departureTime: "10:45 AM",
    arrivalTime: "10:45 AM"
  },
  
  droppingStop: {
    id: "stop-uuid",
    sequence: 5,
    name: "Mandya",
    departureTime: "12:20 PM",
    arrivalTime: "12:15 PM"
  },
  
  scheduleId: "schedule-uuid"
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Please select a boarding point" | Select boarding point first |
| "Dropping stop must be after boarding stop" | Choose a later stop for dropping |
| No seats available for segment | Change boarding/dropping points |
| "Schedule not found" | Ensure valid schedule ID is passed |

## 📚 Files Location

- **Frontend Stop Selector**: `js/segment-booking.js`
- **Stop Selection Page**: `page3-stops.html`
- **Backend Endpoints**: `backend/server.js` (lines 205+)
- **Database Schema**: `backend/migrations/001-create-routes-stops.sql`
- **Full Documentation**: `INTERMEDIATE_STOPS_FEATURE.md`

## 🌐 Live Demo

**URL:** http://localhost:3000

**Quick Test:**
1. Click "🎟️ Book a Ticket"
2. Search for Bangalore → Mysore on any date
3. Select a bus
4. Pick 2 seats
5. Click "Select Stops →"
6. Try booking different segments
7. Notice how same seat is available for non-overlapping segments!

---

**Version:** 1.0  
**Status:** Production Ready ✅  
**Last Updated:** 2026-08-17
