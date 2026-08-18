/**
 * SQL Migration: Create routes, stops, bus_schedules, bus_seats, bookings_v2 tables
 * Phase 1: Database structure for segment-based seat booking
 * 
 * EXECUTION STEPS:
 * 1. Copy this SQL and paste into Supabase SQL Editor
 * 2. OR run via command line: psql -U postgres -d your_db -f this_file.sql
 * 
 * IMPORTANT:
 * - Existing tables (users, buses, bookings) are NOT modified
 * - New bookings use bookings_v2 table
 * - Old bookings table remains for backward compatibility
 * - RLS policies must allow SELECT on new tables
 */

-- ========================================
-- 1. ROUTES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  distance_km DECIMAL(8,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_active ON routes(active);

-- ========================================
-- 2. STOPS TABLE (depends on routes)
-- ========================================
CREATE TABLE IF NOT EXISTS stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sequence INT NOT NULL,
  arrival_time VARCHAR(10),
  departure_time VARCHAR(10),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(route_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_stops_route_sequence ON stops(route_id, sequence);

-- ========================================
-- 3. BUS_SCHEDULES TABLE (links buses to routes)
-- ========================================
CREATE TABLE IF NOT EXISTS bus_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  departure_time VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INT DEFAULT 40,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bus_id, route_id, date, departure_time)
);

CREATE INDEX IF NOT EXISTS idx_bus_schedules_date ON bus_schedules(date);
CREATE INDEX IF NOT EXISTS idx_bus_schedules_bus_route ON bus_schedules(bus_id, route_id);

-- ========================================
-- 4. BUS_SEATS TABLE (tracks individual seats)
-- ========================================
CREATE TABLE IF NOT EXISTS bus_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  seat_number VARCHAR(5) NOT NULL,
  row CHAR(1) NOT NULL,
  column INT NOT NULL,
  type VARCHAR(20) DEFAULT 'regular',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bus_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_bus_seats_bus ON bus_seats(bus_id);

-- ========================================
-- 5. BOOKINGS_V2 TABLE (NEW segment-aware bookings)
-- ========================================
CREATE TABLE IF NOT EXISTS bookings_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  bus_id UUID NOT NULL REFERENCES buses(id),
  schedule_id UUID NOT NULL REFERENCES bus_schedules(id),
  seat_id UUID NOT NULL REFERENCES bus_seats(id),
  seat_number VARCHAR(5) NOT NULL,
  
  -- Boarding stop information
  boarding_stop_id UUID NOT NULL REFERENCES stops(id),
  boarding_stop VARCHAR(100) NOT NULL,
  boarding_sequence INT NOT NULL,
  
  -- Dropping stop information
  dropping_stop_id UUID NOT NULL REFERENCES stops(id),
  dropping_stop VARCHAR(100) NOT NULL,
  dropping_sequence INT NOT NULL,
  
  -- Passenger information
  passenger_name VARCHAR(100) NOT NULL,
  passenger_phone VARCHAR(20),
  passenger_age INT,
  passenger_gender VARCHAR(20),
  
  -- Booking status
  booking_status VARCHAR(20) DEFAULT 'confirmed',
  payment_status VARCHAR(20) DEFAULT 'pending',
  
  -- Contact information
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  
  -- Pricing information
  amount DECIMAL(10,2),
  tax DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2),
  payment_method VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_v2_schedule ON bookings_v2(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_seat ON bookings_v2(seat_id);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_user ON bookings_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_boarding_dropping 
  ON bookings_v2(boarding_sequence, dropping_sequence);
CREATE INDEX IF NOT EXISTS idx_bookings_v2_status ON bookings_v2(booking_status);

-- ========================================
-- SEED DATA (Optional - Examples for Bengaluru → Mysuru route)
-- ========================================

-- Insert main route
INSERT INTO routes (name, origin, destination, distance_km) 
VALUES ('Bengaluru → Mysuru', 'Bengaluru', 'Mysuru', 150)
ON CONFLICT (name) DO NOTHING;

-- Insert stops for the route
INSERT INTO stops (route_id, name, sequence, arrival_time, departure_time)
SELECT r.id, s.name, s.seq, s.arr_time, s.dep_time
FROM routes r,
LATERAL (
  VALUES
    ('Bengaluru', 1, '10:00 AM', '10:00 AM'),
    ('Ramanagara', 2, '10:45 AM', '10:50 AM'),
    ('Channapatna', 3, '11:15 AM', '11:20 AM'),
    ('Maddur', 4, '11:45 AM', '11:50 AM'),
    ('Mandya', 5, '12:15 PM', '12:20 PM'),
    ('Mysuru', 6, '01:00 PM', '01:00 PM')
) AS s(name, seq, arr_time, dep_time)
WHERE r.name = 'Bengaluru → Mysuru'
ON CONFLICT (route_id, sequence) DO NOTHING;

-- ========================================
-- NOTES:
-- ========================================
-- After running this migration:
-- 1. Verify tables were created: SELECT table_name FROM information_schema.tables;
-- 2. Check Supabase RLS policies - ensure SELECT is allowed for auth.users
-- 3. Populate bus_seats for existing buses (run separate script)
-- 4. Populate bus_schedules for existing buses (run separate script)
-- 5. Test backend endpoints: GET /api/routes, GET /api/routes/{id}/stops
