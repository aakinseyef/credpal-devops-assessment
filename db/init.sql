-- Create the processed_data table for the application
CREATE TABLE IF NOT EXISTS processed_data (
    id SERIAL PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
