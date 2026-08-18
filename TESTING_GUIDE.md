# Testing the Intermediate Stops Feature

## 🧪 Manual Testing Checklist

### Prerequisites
- Backend server running: http://localhost:3000
- No errors in browser console
- SessionStorage enabled

### Test Case 1: Basic Stop Selection

**Steps:**
1. Navigate to http://localhost:3000
2. Click "🎟️ Book a Ticket" button
3. Select Route: "Bangalore → Mysore"
4. Select Date: Any future date
5. Select Passengers: 1
6. Click "Search Buses →"
7. Click any bus
8. Select 2 seats (e.g., A1, A2)
9. Click "Select Stops →"

**Expected Result:**
- ✓ Page navigates to page3-stops.html
- ✓ All stops for route displayed
- ✓ Can see stops with times
- ✓ Summary shows bus and seats
- ✓ Continue button is disabled initially

---

### Test Case 2: Stop Selection Validation

**Prerequisites:** At Step 4 (Select Stops page)

**Test 2A - Boarding Point Selection:**
1. Click "🚌 Boarding Point" dropdown
2. Select "Bengaluru"

**Expected Result:**
- ✓ Boarding point shows in summary as "Bengaluru (10:00 AM)"
- ✓ Dropping point dropdown only shows stops AFTER Bengaluru
- ✓ Ramanagara, Channapatna, Maddur, Mandya, Mysuru visible
- ✓ Bengaluru NOT in dropping list

**Test 2B - Dropping Point Selection:**
1. Click "🏁 Dropping Point" dropdown
2. Select "Mysuru"

**Expected Result:**
- ✓ Dropping point shows in summary as "Mysuru (1:00 PM)"
- ✓ Continue button becomes ENABLED
- ✓ Summary updates in real-time

---

### Test Case 3: Validation Rules

**Prerequisites:** At Step 4, Bengaluru selected

**Test 3A - Cannot select same stop:**
1. Try to select "Bengaluru" as dropping point
2. Verify it's NOT in the dropdown

**Expected Result:**
- ✓ Bengaluru not available in dropping list

**Test 3B - Cannot select earlier stop:**
1. Select "Ramanagara" as boarding
2. Verify "Ramanagara" not in dropping list (only later stops)

**Expected Result:**
- ✓ Only Channapatna, Maddur, Mandya, Mysuru in dropping

**Test 3C - Must select both points:**
1. Select only boarding, click "Continue"
2. Verify error appears

**Expected Result:**
- ✓ Alert: "Please select a boarding point"
- ✓ Alert: "Please select a dropping point"

---

### Test Case 4: Proceeding to Passenger Details

**Prerequisites:** Both stops selected (e.g., Bengaluru → Mysuru)

**Steps:**
1. Click "Continue to Passenger Details →"

**Expected Result:**
- ✓ Redirects to page4.html
- ✓ Step indicator shows Step 5/6
- ✓ Summary shows:
  - Bus name
  - Route
  - Date
  - Departure time
  - 🚏 **Boarding Point:** Bengaluru (10:00 AM)
  - 🏁 **Dropping Point:** Mysuru (1:00 PM)
  - Selected seats
  - Total amount
  - Tax calculation
  - Grand total

---

### Test Case 5: Complete Booking Flow

**Steps:**
1. From page 4 (Passenger Details), fill form:
   - Passenger 1: John, 30, Male
   - Email: test@example.com
   - Phone: 9876543210
2. Click "Proceed to Payment →"

**Expected Result:**
- ✓ Redirects to payment.html
- ✓ Step indicator shows Step 6/6
- ✓ Order summary includes:
  - Boarding point
  - Dropping point
  - Selected seats
  - All pricing

3. Fill payment details (demo/test card)
4. Click "Pay ₹[amount]"

**Expected Result:**
- ✓ Loading overlay appears
- ✓ Booking confirmation page (page5.html)
- ✓ Booking reference displayed
- ✓ All booking details shown

---

### Test Case 6: Multiple Segments (Advanced)

**Scenario:** Test if same seat can be booked by different passengers

**Setup:** Manual database entry needed or mock API responses

**Expected Behavior:**
```
Bus with 2 seats, 6 stops

Booking 1:
- Seat: A1
- Segment: Stop 1 → Stop 6
- Status: Confirmed

Booking 2 (Same seat A1):
- Segment: Stop 2 → Stop 5
- Expected: Available ✓
- Reason: No overlap (1-6 vs 2-5)

Booking 3 (Same seat A1):
- Segment: Stop 1 → Stop 3
- Expected: NOT Available ✗
- Reason: Overlaps with Booking 1 (1-6 includes 1-3)
```

---

### Test Case 7: Browser Console Check

**Steps:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Complete a booking flow
4. Check for errors

**Expected Result:**
- ✓ No red errors
- ✓ Network tab shows:
  - GET `/api/segments/[id]` → 200 OK
  - GET `/api/seats/segment-availability?...` → 200 OK (if applicable)
  - POST `/api/bookings/segment` → 200 OK (if applicable)

---

### Test Case 8: Responsive Design

**Steps:**
1. Start booking flow at stop selection
2. Resize browser to mobile width (375px)
3. Test stop selectors
4. Test summary display

**Expected Result:**
- ✓ Stop selectors remain clickable
- ✓ Summary cards stack vertically
- ✓ Text is readable
- ✓ Buttons are clickable
- ✓ No overflow

---

### Test Case 9: Session Storage Verification

**Steps:**
1. At stop selection page, open Console
2. Type: `JSON.parse(sessionStorage.ss_booking)`
3. Check for new fields

**Expected Result:**
```javascript
{
  name: "AC Volvo",
  route: "bangalore-mysore",
  date: "2026-08-17",
  // ... other fields ...
  
  // NEW FIELDS:
  boardingStop: {
    id: "...",
    sequence: 1,
    name: "Bengaluru",
    departureTime: "10:00 AM"
  },
  droppingStop: {
    id: "...",
    sequence: 6,
    name: "Mysuru",
    departureTime: "1:00 PM"
  },
  scheduleId: "..."
}
```

---

### Test Case 10: Back Navigation

**Steps:**
1. At stop selection (page3-stops.html)
2. Click "← Back to Seats" link
3. Verify you're back at page3.html
4. Click "Select Stops →" again

**Expected Result:**
- ✓ Back link works
- ✓ Session data preserved
- ✓ Can proceed again
- ✓ No state corruption

---

## 🔍 API Testing (cURL)

### Test: Get Stops
```bash
curl http://localhost:3000/api/segments/schedule-uuid-here
```

**Expected Response:**
```json
{
  "success": true,
  "stops": [
    {
      "id": "uuid",
      "name": "Bengaluru",
      "sequence": 1,
      "arrival_time": "10:00 AM",
      "departure_time": "10:00 AM"
    }
  ]
}
```

### Test: Check Seat Availability
```bash
curl "http://localhost:3000/api/seats/segment-availability?scheduleId=uuid&boardingStopSeq=1&droppingStopSeq=6"
```

**Expected Response:**
```json
{
  "success": true,
  "availableSeats": [
    {
      "id": "seat-uuid",
      "seat_number": "A1",
      "row": "A",
      "column": 1
    }
  ],
  "bookedCount": 5,
  "totalSeats": 40
}
```

---

## 📋 Pre-Production Checklist

- [ ] All manual tests pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Session storage works
- [ ] Back navigation works
- [ ] Payment flow completes
- [ ] Booking confirmation shows stops
- [ ] Database migration applied
- [ ] API endpoints tested
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] User can restart booking flow

---

## 🐛 Known Issues & Workarounds

| Issue | Workaround |
|-------|-----------|
| Stops not loading | Verify scheduleId is valid, check API endpoint |
| Continue button disabled | Ensure both stops are selected |
| SessionStorage cleared | Don't clear browser data during booking |
| Mobile: Dropdown hidden | Scroll down or use device orientation |

---

## ✅ Final Validation

After all tests pass, verify:

1. **Functionality**
   - ✓ Users can select intermediate stops
   - ✓ Seat availability respects segments
   - ✓ Booking completes successfully

2. **Data Integrity**
   - ✓ All booking fields saved correctly
   - ✓ Session data not corrupted
   - ✓ Database writes successful

3. **User Experience**
   - ✓ Flow is intuitive
   - ✓ Error messages are clear
   - ✓ Responsive on all devices

4. **Performance**
   - ✓ Pages load quickly
   - ✓ No lag in dropdowns
   - ✓ API responds in < 500ms

---

**Status:** Ready for Testing ✅

**Execute tests and report any issues to the development team.**
