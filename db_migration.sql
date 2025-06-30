
-- Add allowMultipleDevices column to employees table
ALTER TABLE employees ADD allowMultipleDevices BIT DEFAULT 0;

-- Add role column to employees table
ALTER TABLE employees ADD role NVARCHAR(50) DEFAULT 'normal';

-- Add locationCoordinates column to employees table
ALTER TABLE employees ADD locationCoordinates NVARCHAR(MAX) NULL;
