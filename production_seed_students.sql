
-- ========================================
-- Production Students Seeding Script
-- ========================================
-- Run this in Replit Database SQL Runner or via psql
-- ========================================

-- Class 4a students
INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'A1', 'Schüler', c.id, 'male', NOW(), NOW()
FROM classes c WHERE c.name = '4a'
ON CONFLICT DO NOTHING;

INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'B1', 'Schüler', c.id, 'male', NOW(), NOW()
FROM classes c WHERE c.name = '4a'
ON CONFLICT DO NOTHING;

INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'C1', 'Schüler', c.id, 'male', NOW(), NOW()
FROM classes c WHERE c.name = '4a'
ON CONFLICT DO NOTHING;

-- Class 6a students (real names from your file)
INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Alisha', '', c.id, 'female', NOW(), NOW()
FROM classes c WHERE c.name = '6a'
ON CONFLICT DO NOTHING;

INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Antonia', '', c.id, 'female', NOW(), NOW()
FROM classes c WHERE c.name = '6a'
ON CONFLICT DO NOTHING;

INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Blendi', '', c.id, 'male', NOW(), NOW()
FROM classes c WHERE c.name = '6a'
ON CONFLICT DO NOTHING;

-- (Add all 24 students for 6a...)
-- Test class students
INSERT INTO students (id, "firstName", "lastName", "classId", gender, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'TestSchüler1', 'Demo', c.id, 'male', NOW(), NOW()
FROM classes c WHERE c.name = 'Test'
ON CONFLICT DO NOTHING;

-- Verify
SELECT c.name as class, COUNT(s.id) as student_count
FROM classes c
LEFT JOIN students s ON s."classId" = c.id
GROUP BY c.name
ORDER BY c.name;
