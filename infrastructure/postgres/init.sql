-- ==============================================================================
-- PolarSync Edge - TimescaleDB Initialization Script
-- Designed for Antarctic/Polar Microgrid Energy Management (NCPOR Bharati/Maitri)
-- ==============================================================================

-- 1. Enable TimescaleDB Extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 2. Telemetry Table (Time-Series Hypertable)
CREATE TABLE IF NOT EXISTS station_telemetry (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(50) NOT NULL DEFAULT 'BHARATI-STATION-01',
    solar_kw DOUBLE PRECISION NOT NULL,
    demand_kw DOUBLE PRECISION NOT NULL,
    battery_soc DOUBLE PRECISION NOT NULL,        -- State of Charge (0 - 100%)
    battery_temp_c DOUBLE PRECISION NOT NULL,     -- Battery Bank Temp (-20C to +40C)
    battery_voltage DOUBLE PRECISION NOT NULL,    -- 48V DC or 400V DC Bus
    fuel_reserve_liters DOUBLE PRECISION NOT NULL,-- Polar Diesel reserve
    generator_status VARCHAR(20) NOT NULL,        -- 'OFF', 'STANDBY', 'RUNNING', 'MAINTENANCE'
    generator_output_kw DOUBLE PRECISION DEFAULT 0.0,
    active_tier_shedding INT DEFAULT 0,           -- 0 = None, 3 = Tier 3 shed, 2 = Tier 2 & 3 shed
    ambient_temp_c DOUBLE PRECISION DEFAULT -25.0,-- Antarctic air temperature
    wind_speed_ms DOUBLE PRECISION DEFAULT 12.0
);

-- Convert to TimescaleDB Hypertable partitioned on 1-day chunks
SELECT create_hypertable('station_telemetry', 'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');

CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON station_telemetry (station_id, time DESC);

-- 3. Hourly Energy Forecasts Table
CREATE TABLE IF NOT EXISTS energy_forecasts (
    id SERIAL PRIMARY KEY,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    target_hour TIMESTAMPTZ NOT NULL,
    horizon_hours INT NOT NULL,                   -- 1 to 24
    predicted_demand_kw DOUBLE PRECISION NOT NULL,
    predicted_solar_kw DOUBLE PRECISION NOT NULL,
    net_gap_kw DOUBLE PRECISION NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL    -- 0.0 to 1.0
);

CREATE INDEX IF NOT EXISTS idx_forecasts_target ON energy_forecasts (target_hour DESC);

-- 4. Commander Decisions & Audit Trail (Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS commander_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gap_kwh DOUBLE PRECISION NOT NULL,
    recommendation_text TEXT NOT NULL,
    action_type VARCHAR(50) NOT NULL,             -- 'SHED_TIER3', 'RESCHEDULE_TIER2', 'GEN_SCHEDULE', 'MAINTAIN'
    target_loads JSONB NOT NULL DEFAULT '[]',
    generator_hours_recommended DOUBLE PRECISION DEFAULT 0.0,
    estimated_fuel_saved_liters DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',-- 'PENDING', 'APPROVED', 'REJECTED', 'OVERRIDDEN'
    commander_id VARCHAR(100),
    approval_timestamp TIMESTAMPTZ,
    override_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_decisions_time ON commander_decisions (timestamp DESC);

-- 5. Station Load Inventory & Criticality Tiers
CREATE TABLE IF NOT EXISTS load_inventory (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    tier INT NOT NULL CHECK (tier IN (1, 2, 3)), -- 1: Critical Life-Safety, 2: Flexible Labs, 3: Non-Critical
    nominal_kw DOUBLE PRECISION NOT NULL,
    sheddable BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Essential Polar Research Station Baseline Loads
INSERT INTO load_inventory (id, name, tier, nominal_kw, sheddable, is_active, description)
VALUES
    ('LOAD-T1-HEAT', 'Life-Support Habitat Heating', 1, 28.5, FALSE, TRUE, 'Emergency redundant HVAC & radiant heating for habitat modules. NEVER SHED.'),
    ('LOAD-T1-LIFE', 'Oxygen & Medical Life Support', 1, 14.0, FALSE, TRUE, 'Infirmary medical equipment, atmospheric circulation, fire suppression. NEVER SHED.'),
    ('LOAD-T1-COMM', 'Satellite & Emergency Comm Bus', 1, 4.5, FALSE, TRUE, 'Iridium and emergency beacon transceiver systems. NEVER SHED.'),
    ('LOAD-T2-LAB',  'Atmospheric Science Spectrometry', 2, 12.0, TRUE, TRUE, 'Spectrometry and LIDAR arrays. Schedulable into peak solar windows.'),
    ('LOAD-T2-SNOW', 'Main Snow Melt Fresh Water Tank', 2, 8.5, TRUE, TRUE, 'Snow melter for potable water generation. Flexible duty cycle.'),
    ('LOAD-T3-DRONE','Polar Rover & Drone Recharging', 3, 7.0, TRUE, TRUE, 'Field survey battery bank charging stations. First candidate for shedding.'),
    ('LOAD-T3-REC',  'Crew Living Quarters & Recreation', 3, 5.5, TRUE, TRUE, 'Gym, media devices, non-essential domestic appliances. First candidate for shedding.')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Historical Telemetry Point
INSERT INTO station_telemetry (
    time, station_id, solar_kw, demand_kw, battery_soc, battery_temp_c, battery_voltage,
    fuel_reserve_liters, generator_status, generator_output_kw, active_tier_shedding, ambient_temp_c, wind_speed_ms
) VALUES (
    NOW(), 'BHARATI-STATION-01', 68.4, 61.2, 74.0, 18.5, 412.0, 14200.0, 'STANDBY', 0.0, 0, -28.4, 14.2
);
