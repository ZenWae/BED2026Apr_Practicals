CREATE TABLE Students (
    student_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NULL
);

INSERT INTO Students (name, address)
VALUES 
('Ali Tan', 'Singapore'),
('Hun Zen Wae', 'Johor Bahru');