-- ========================================
-- Production Database Seeding Script
-- ========================================
-- Run this in the Replit Database SQL Runner
-- Tools > Database > SQL Runner
-- ========================================

-- Step 1: Create Classes
-- ========================================

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), '4a', NULL) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), '4b', NULL) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), '4c', NULL) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), '4d', NULL) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), '4e', NULL) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), '6a', NULL) 
ON CONFLICT (name) DO NOTHING;

INSERT INTO classes (id, name, teacher_id) 
VALUES (gen_random_uuid(), 'Test', NULL) 
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create/Update Users
-- ========================================

-- User: Ibra (teacher, class 4a)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Ibra', '2021', 'teacher', c.id
FROM classes c WHERE c.name = '4a'
ON CONFLICT (username) DO UPDATE 
SET password = '2021', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Rast (teacher, class 4b)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Rast', '2022', 'teacher', c.id
FROM classes c WHERE c.name = '4b'
ON CONFLICT (username) DO UPDATE 
SET password = '2022', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Arid (teacher, class 4c)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Arid', '2023', 'teacher', c.id
FROM classes c WHERE c.name = '4c'
ON CONFLICT (username) DO UPDATE 
SET password = '2023', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Pulv (teacher, class 4d)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Pulv', '2024', 'teacher', c.id
FROM classes c WHERE c.name = '4d'
ON CONFLICT (username) DO UPDATE 
SET password = '2024', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Jahi (teacher, class 4e)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Jahi', '2025', 'teacher', c.id
FROM classes c WHERE c.name = '4e'
ON CONFLICT (username) DO UPDATE 
SET password = '2025', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Stie (admin, class 6a)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Stie', '2020', 'admin', c.id
FROM classes c WHERE c.name = '6a'
ON CONFLICT (username) DO UPDATE 
SET password = '2020', role = 'admin', class_id = EXCLUDED.class_id;

-- User: Meie (admin, class 6a)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Meie', '2020', 'admin', c.id
FROM classes c WHERE c.name = '6a'
ON CONFLICT (username) DO UPDATE 
SET password = '2020', role = 'admin', class_id = EXCLUDED.class_id;

-- User: Bobo (teacher, class 6a)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Bobo', '2021', 'teacher', c.id
FROM classes c WHERE c.name = '6a'
ON CONFLICT (username) DO UPDATE 
SET password = '2021', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Muep (teacher, class 6a)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Muep', '2021', 'teacher', c.id
FROM classes c WHERE c.name = '6a'
ON CONFLICT (username) DO UPDATE 
SET password = '2021', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Test (teacher, class Test)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Test', 'password2025', 'teacher', c.id
FROM classes c WHERE c.name = 'Test'
ON CONFLICT (username) DO UPDATE 
SET password = 'password2025', role = 'teacher', class_id = EXCLUDED.class_id;

-- User: Casu (teacher, class Test)
INSERT INTO users (id, username, password, role, class_id)
SELECT gen_random_uuid(), 'Casu', '2025', 'teacher', c.id
FROM classes c WHERE c.name = 'Test'
ON CONFLICT (username) DO UPDATE 
SET password = '2025', role = 'teacher', class_id = EXCLUDED.class_id;

-- ========================================
-- Verification Queries
-- ========================================

-- Check classes were created
SELECT * FROM classes ORDER BY name;

-- Check users were created
SELECT username, role, password FROM users ORDER BY username;

-- ========================================
-- Expected Result: 11 users created
-- ========================================
