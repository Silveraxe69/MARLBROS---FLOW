-- =============================================
-- Smart Bus System - PostgreSQL Database Schema
-- =============================================

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS crowd_status CASCADE;
DROP TABLE IF EXISTS bus_eta CASCADE;
DROP TABLE IF EXISTS bus_location CASCADE;
DROP TABLE IF EXISTS bus_stop_sequence CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS bus_stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'passenger' CHECK (role IN ('passenger', 'admin', 'driver')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- ROUTES TABLE
-- =============================================
CREATE TABLE routes (
    route_id VARCHAR(20) PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    start_stop VARCHAR(255) NOT NULL,
    end_stop VARCHAR(255) NOT NULL,
    distance_km DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routes_name ON routes(route_name);

-- =============================================
-- BUS STOPS TABLE
-- =============================================
CREATE TABLE bus_stops (
    stop_id VARCHAR(20) PRIMARY KEY,
    stop_name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stops_name ON bus_stops(stop_name);
CREATE INDEX idx_stops_city ON bus_stops(city);
CREATE INDEX idx_stops_location ON bus_stops(latitude, longitude);

-- =============================================
-- BUSES TABLE
-- =============================================
CREATE TABLE buses (
    bus_id VARCHAR(20) PRIMARY KEY,
    route_id VARCHAR(20) REFERENCES routes(route_id) ON DELETE SET NULL,
    bus_color VARCHAR(50),
    service_type VARCHAR(50),
    women_bus BOOLEAN DEFAULT FALSE,
    accessible BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'maintenance', 'delayed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buses_route ON buses(route_id);
CREATE INDEX idx_buses_status ON buses(status);

-- =============================================
-- BUS STOP SEQUENCE TABLE
-- =============================================
CREATE TABLE bus_stop_sequence (
    sequence_id SERIAL PRIMARY KEY,
    route_id VARCHAR(20) REFERENCES routes(route_id) ON DELETE CASCADE,
    stop_id VARCHAR(20) REFERENCES bus_stops(stop_id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, stop_order),
    UNIQUE(route_id, stop_id)
);

CREATE INDEX idx_sequence_route ON bus_stop_sequence(route_id);
CREATE INDEX idx_sequence_stop ON bus_stop_sequence(stop_id);
CREATE INDEX idx_sequence_order ON bus_stop_sequence(route_id, stop_order);

-- =============================================
-- BUS LOCATION TABLE (Real-time GPS data)
-- =============================================
CREATE TABLE bus_location (
    location_id SERIAL PRIMARY KEY,
    bus_id VARCHAR(20) REFERENCES buses(bus_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    heading DECIMAL(5, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location_bus ON bus_location(bus_id);
CREATE INDEX idx_location_timestamp ON bus_location(timestamp DESC);
CREATE INDEX idx_location_bus_time ON bus_location(bus_id, timestamp DESC);

-- =============================================
-- BUS ETA TABLE
-- =============================================
CREATE TABLE bus_eta (
    eta_id SERIAL PRIMARY KEY,
    bus_id VARCHAR(20) REFERENCES buses(bus_id) ON DELETE CASCADE,
    stop_id VARCHAR(20) REFERENCES bus_stops(stop_id) ON DELETE CASCADE,
    eta_minutes INTEGER,
    distance_km DECIMAL(10, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eta_bus ON bus_eta(bus_id);
CREATE INDEX idx_eta_stop ON bus_eta(stop_id);
CREATE INDEX idx_eta_bus_stop ON bus_eta(bus_id, stop_id);

-- =============================================
-- CROWD STATUS TABLE
-- =============================================
CREATE TABLE crowd_status (
    crowd_id SERIAL PRIMARY KEY,
    bus_id VARCHAR(20) REFERENCES buses(bus_id) ON DELETE CASCADE,
    stop_id VARCHAR(20) REFERENCES bus_stops(stop_id) ON DELETE SET NULL,
    crowd_level VARCHAR(20) CHECK (crowd_level IN ('Low', 'Medium', 'Full')),
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crowd_bus ON crowd_status(bus_id);
CREATE INDEX idx_crowd_stop ON crowd_status(stop_id);
CREATE INDEX idx_crowd_timestamp ON crowd_status(timestamp DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS
-- =============================================

-- View: Active buses with latest location
CREATE OR REPLACE VIEW active_buses_with_location AS
SELECT 
    b.bus_id,
    b.route_id,
    b.bus_color,
    b.service_type,
    b.women_bus,
    b.accessible,
    b.status,
    r.route_name,
    r.start_stop,
    r.end_stop,
    l.latitude,
    l.longitude,
    l.speed,
    l.timestamp as last_updated
FROM buses b
LEFT JOIN routes r ON b.route_id = r.route_id
LEFT JOIN LATERAL (
    SELECT latitude, longitude, speed, timestamp
    FROM bus_location
    WHERE bus_id = b.bus_id
    ORDER BY timestamp DESC
    LIMIT 1
) l ON true
WHERE b.status = 'running';

-- =============================================
-- SAMPLE DATA INSERT
-- =============================================

-- Insert sample admin user
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@smartbus.com', '$2a$10$XqRpLKZU0g.Q/W5R5U5Zx.J5uHY9wL6YzJqZ5bF0Pq5aK6H5L6G7i', 'Admin User', 'admin');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Sample admin user created: admin@smartbus.com';
END $$;
