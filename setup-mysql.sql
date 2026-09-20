-- MySQL Setup Script for Drishti AI
-- Run this with admin privileges

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS drishti_ai;

-- Create user (if not exists)
CREATE USER IF NOT EXISTS 'drishti'@'localhost' IDENTIFIED BY 'najla@09';

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON drishti_ai.* TO 'drishti'@'localhost';

-- Refresh permissions
FLUSH PRIVILEGES;

USE drishti_ai;

CREATE TABLE IF NOT EXISTS users (
	id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(150) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(50) NOT NULL DEFAULT 'health_worker',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS patients (
	id VARCHAR(100) NOT NULL,
	patient_code VARCHAR(100) NOT NULL UNIQUE,
	name VARCHAR(150) NOT NULL,
	age INT NULL,
	gender VARCHAR(30) NULL,
	phone VARCHAR(30) NULL,
	village VARCHAR(150) NULL,
	district VARCHAR(150) NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS retinal_scans (
	id VARCHAR(100) NOT NULL,
	patient_id VARCHAR(100) NOT NULL,
	eye VARCHAR(20) NOT NULL,
	image_path VARCHAR(500) NULL,
	image_quality DECIMAL(5,2) NULL,
	quality_status VARCHAR(50) NULL,
	dr_grade INT NULL,
	confidence DECIMAL(6,5) NULL,
	risk_level VARCHAR(50) NULL,
	ai_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT fk_retinal_scans_patient
		FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
	INDEX idx_retinal_scans_patient_id (patient_id),
	INDEX idx_retinal_scans_created_at (created_at)
);

-- Compatibility migration for databases created by the earlier app schema.
SET @patient_code_exists = (
	SELECT COUNT(*)
	FROM information_schema.columns
	WHERE table_schema = DATABASE()
	  AND table_name = 'patients'
	  AND column_name = 'patient_code'
);
SET @add_patient_code = IF(
	@patient_code_exists = 0,
	'ALTER TABLE patients ADD COLUMN patient_code VARCHAR(100) NULL AFTER id',
	'SELECT 1'
);
PREPARE add_patient_code_statement FROM @add_patient_code;
EXECUTE add_patient_code_statement;
DEALLOCATE PREPARE add_patient_code_statement;
UPDATE patients SET patient_code = id WHERE patient_code IS NULL OR patient_code = '';

-- Verify
SELECT USER(), DATABASE();
