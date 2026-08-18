# Visual Guide: Intermediate Stops Feature

## 🗺️ Route Map Example

```
BENGALURU → MYSURU ROUTE (6 Stops)

Time Flow:
10:00 AM ──────→ 10:45 AM ──────→ 11:15 AM ──────→ 11:45 AM ──────→ 12:15 PM ──────→ 1:00 PM
   │                │                │                │                │                │
   ▼                ▼                ▼                ▼                ▼                ▼
BENGALURU      RAMANAGARA     CHANNAPATNA         MADDUR           MANDYA           MYSURU
(Stop 1)       (Stop 2)       (Stop 3)            (Stop 4)         (Stop 5)         (Stop 6)
                                                        ↓
                                                    [125 km]
                                                   [3 hours]
```

## 👥 Passenger Journeys (Same Seat A1)

```
PASSENGER 1: Alice
═══════════════════════════════════════════════════════════════════════════════════════════
10:00 AM                                                                         1:00 PM
  │                                                                                 │
  ├─ BENGALURU ───→ RAMANAGARA ───→ CHANNAPATNA ───→ MADDUR ───→ MANDYA ───→ MYSURU ─┤
  │  (Boards)                                                           (Alights)      │
  │  ✓ SEAT A1 OCCUPIED FOR ENTIRE ROUTE                                              │
  └─────────────────────────────────────────────────────────────────────────────────────┘


PASSENGER 2: Bob
═══════════════════════════════════════════════════════════════════════════════════════════
                 10:45 AM                           12:15 PM
                   │                                   │
                   ├─ RAMANAGARA ───→ CHANNAPATNA ───→ MADDUR ───→ MANDYA ─┤
                   │  (Boards)                              (Alights)       │
                   │  ✓ SEAT A1 AVAILABLE! (No overlap with Alice)          │
                   └───────────────────────────────────────────────────────┘


Visual Check:
─────────────

Alice:   |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ A1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|
         1        2        3        4        5        6
         
Bob:           |━━━━━━━━━━━━━━━━━ A1 ━━━━━━━━━━━━━━━━|
              2        3        4        5

Result: ✓ NO OVERLAP → Seat can be reused!
```

## 🎨 User Interface Flow

```
┌──────────────────────────────────────────────────────────────┐
│ HOME PAGE (index.html)                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎟️ Book a Ticket                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: SEARCH (user-login.html)                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Route: [Bangalore → Mysore    ▼]                       │ │
│ │ Date:  [2026-08-17            ]                        │ │
│ │ Pass:  [1 Passenger           ▼]                       │ │
│ │ [Search Buses →]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: SELECT BUS (page2.html)                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☐ AC Volvo | 10:00 AM | 3 hrs | ₹300 | ⭐⭐⭐⭐  │ │
│ │ ☐ SemiLux  | 11:00 AM | 3.5 hrs | ₹250 | ⭐⭐⭐  │ │
│ │ ☑ Royal    | 09:30 AM | 2.5 hrs | ₹400 | ⭐⭐⭐⭐⭐│ │
│ │ [Continue to Seats →]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: CHOOSE SEATS (page3.html)                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │         Bus Layout                                      │ │
│ │    [A1] [A2] [A3]    ← Row A                           │ │
│ │    [B1] [B2] [B3]    ← Row B                           │ │
│ │    [C1] [C2] [C3]    ← Row C                           │ │
│ │                                                         │ │
│ │ Selected: A1, B1                                        │ │
│ │ Subtotal: ₹600                                          │ │
│ │ [Select Stops →]  ← NEW BUTTON!                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
    ╔══════════════════════════════════════════════════════════╗
    ║  NEW STEP! ← INTERMEDIATE STOPS FEATURE                  ║
    ╚══════════════════════════════════════════════════════════╝
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: SELECT STOPS (page3-stops.html) ← NEW PAGE!         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚏 Select Your Stops                                   │ │
│ │                                                         │ │
│ │ 🚌 Boarding Point                                      │ │
│ │ [Bengaluru               ▼]                           │ │
│ │                                                         │ │
│ │ 🏁 Dropping Point                                      │ │
│ │ [Mysuru                  ▼]                           │ │
│ │                                                         │ │
│ │ ✓ 40 Seats Available                                  │ │
│ │                                                         │ │
│ │ [Continue to Passenger Details →]                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ SUMMARY:                                                     │
│ • Bus: Royal                                                 │
│ • Seats: A1, B1                                              │
│ • Boarding: Bengaluru (10:00 AM)                             │
│ • Dropping: Mysuru (1:00 PM)                                 │
│ • Total: ₹630 (incl. tax)                                    │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: PASSENGER DETAILS (page4.html)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Passenger 1 (Seat A1)                                  │ │
│ │ Name: [John Doe         ]                              │ │
│ │ Age:  [30   ]  Gender: [Male  ▼]                      │ │
│ │                                                         │ │
│ │ Passenger 2 (Seat B1)                                  │ │
│ │ Name: [Jane Smith       ]                              │ │
│ │ Age:  [28   ]  Gender: [Female▼]                      │ │
│ │                                                         │ │
│ │ Contact Email: [user@example.com]                      │ │
│ │ Contact Phone: [+91 9876543210  ]                      │ │
│ │                                                         │ │
│ │ [Proceed to Payment →]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 6: PAYMENT (payment.html)                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Secure Payment                                          │ │
│ │ [💳 Card] [📱 UPI] [🏦 Net Banking]                   │ │
│ │                                                         │ │
│ │ Card Number: [████ ████ ████ ████]                   │ │
│ │ Expiry:      [MM / YY]  CVV: [███]                   │ │
│ │                                                         │ │
│ │ [Pay ₹630]                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ ✓ BOOKING CONFIRMED (page5.html)                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Booking Reference: SS12345678                          │ │
│ │                                                         │ │
│ │ ✓ Booking Status: CONFIRMED                           │ │
│ │ • Bus: Royal                                            │ │
│ │ • Route: Bangalore → Mysore                             │ │
│ │ • Date: 17 Aug 2026                                     │ │
│ │ • Departure: 10:00 AM                                   │ │
│ │                                                         │ │
│ │ 🚌 Boarding: Bengaluru (10:00 AM)                      │ │
│ │ 🏁 Dropping: Mysuru (1:00 PM)                          │ │
│ │                                                         │ │
│ │ Seats: A1, B1                                           │ │
│ │ Total: ₹630                                             │ │
│ │                                                         │ │
│ │ ✓ E-Ticket sent to user@example.com                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## ⚙️ Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Frontend)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ sessionStorage
                              ▼
                    ┌────────────────────┐
                    │  ss_booking        │
                    │  • Bus info        │
                    │  • Selected seats  │
                    │  • Boarding stop ← │
                    │  • Dropping stop ← │
                    └────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS BACKEND (Node.js)               │
├─────────────────────────────────────────────────────────────┤
│ Routes:                                                      │
│ • GET /api/segments/:scheduleId                            │
│ • GET /api/seats/segment-availability                      │
│ • POST /api/bookings/segment                               │
│ • PATCH /api/bookings/:id/exit-stop                        │
│                                                              │
│  Query Logic:                                               │
│  if (booking.boarding_seq <= your_dropping_seq &&           │
│      booking.dropping_seq >= your_boarding_seq)             │
│    seat_is_booked()                                         │
│  else                                                        │
│    seat_is_available()                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                          │
├─────────────────────────────────────────────────────────────┤
│ Tables:                                                      │
│ • routes (id, name, origin, destination)                   │
│ • stops (id, route_id, name, sequence, times)              │
│ • bus_schedules (bus_id, route_id, date, price)            │
│ • bus_seats (id, bus_id, seat_number, type)                │
│ • bookings_v2 (                                             │
│     user_id, seat_id,                                       │
│     boarding_stop_id, boarding_sequence,  ← SEGMENT INFO   │
│     dropping_stop_id, dropping_sequence   ← SEGMENT INFO   │
│   )                                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Seat Availability Algorithm

```
INPUT: 
  - Your boarding sequence: 2
  - Your dropping sequence: 5
  - All existing bookings for this bus

ALGORITHM:
  available_seats = all_bus_seats
  
  FOR EACH existing_booking:
    IF (existing_booking.boarding_seq ≤ 5 AND
        existing_booking.dropping_seq ≥ 2):
        # CONFLICT! There's overlap
        remove_from_available_seats(existing_booking.seat_id)
  
  RETURN available_seats

EXAMPLE:
  Your segment: Stops 2→5 (Ramanagara → Mandya)
  
  Booking 1: 1→6   Overlap? YES  (1≤5 AND 6≥2) → REMOVE
  Booking 2: 2→3   Overlap? YES  (2≤5 AND 3≥2) → REMOVE
  Booking 3: 2→5   Overlap? YES  (2≤5 AND 5≥2) → REMOVE
  Booking 4: 5→6   Overlap? NO   (5≤5 BUT 6<2) → KEEP ✓
  Booking 5: 1→2   Overlap? NO   (1≤5 BUT 2<2) → KEEP ✓
```

## 💾 Session Storage Flow

```
Step 3 (Seats):
───────────────
sessionStorage.ss_booking = {
  id: 123,
  name: "Royal Volvo",
  route: "bangalore-mysore",
  date: "2026-08-17",
  time: "10:00 AM",
  type: "AC",
  seats: 40,
  price: 300,
  selectedSeats: ["A1", "B1"],
  totalAmount: 600,
  tax: 30,
  grandTotal: 630
}

Step 4 (Stops): ← ADD FIELDS
──────────────
sessionStorage.ss_booking = {
  ...previous fields...,
  boardingStop: {
    id: "uuid-123",
    sequence: 1,
    name: "Bengaluru",
    arrivalTime: "10:00 AM",
    departureTime: "10:00 AM"
  },
  droppingStop: {
    id: "uuid-456",
    sequence: 6,
    name: "Mysuru",
    arrivalTime: "1:00 PM",
    departureTime: "1:00 PM"
  },
  scheduleId: "schedule-uuid"
}

Step 5 (Passengers): ← ADD FIELDS
────────────────────
sessionStorage.ss_booking = {
  ...previous fields...,
  passengers: [
    {
      seat: "A1",
      firstName: "John",
      lastName: "Doe",
      age: 30,
      gender: "male"
    },
    {
      seat: "B1",
      firstName: "Jane",
      lastName: "Smith",
      age: 28,
      gender: "female"
    }
  ],
  contactEmail: "user@example.com",
  contactPhone: "+91 9876543210"
}
```

## 📱 Mobile View

```
Phone (375px width):
═════════════════════════════════════════════════════

┌─ Page3-Stops ─────────────────────────────────────┐
│ SeatSync  <                                       │
├───────────────────────────────────────────────────┤
│ [✓] [✓] [✓] [✗] [✗]                              │
│ Search Bus Seats Stops Details                    │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│ 🚏 Select Your Stops                              │
│                                                   │
│ 🚌 Boarding Point                                 │
│ ┌─────────────────────────────────────────────┐  │
│ │ Bengaluru                           ▼      │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│ 🏁 Dropping Point                                 │
│ ┌─────────────────────────────────────────────┐  │
│ │ Mysuru                              ▼      │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │ [Continue →]                                │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
├───────────────────────────────────────────────────┤
│ SUMMARY:                                          │
│ Royal Volvo                                       │
│ 17 Aug 2026                                       │
│ 10:00 AM                                          │
│ Seats: A1, B1                                     │
│ Boarding: Bengaluru                               │
│ Dropping: Mysuru                                  │
│ ₹630                                              │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

**Visual Guide Complete!** All diagrams show the intermediate stops feature in action.
