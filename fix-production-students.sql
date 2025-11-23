-- SQL script to fix production student data
-- Run this against your PRODUCTION database in the Replit Database pane

-- Step 1: Clear existing student-related data
DELETE FROM student_assessments;
DELETE FROM student_creative_tasks;
DELETE FROM student_creative_profiles;
DELETE FROM homeworks;
DELETE FROM vocabulary_words;
DELETE FROM spelling_errors;
DELETE FROM student_errors;
DELETE FROM students;

-- Step 2: Insert correct students for Class 4a
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  '',
  (SELECT id FROM classes WHERE name = '4a'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('Alisja', 'female'),
  ('Andrin', 'male'),
  ('Asmin', 'male'),
  ('Bilal', 'male'),
  ('Celina', 'female'),
  ('Chayenne', 'female'),
  ('Davide', 'male'),
  ('Devin', 'male'),
  ('Elon', 'male'),
  ('Galana', 'female'),
  ('Gjin', 'male'),
  ('Laurent', 'male'),
  ('Lucien', 'male'),
  ('Luka', 'male'),
  ('Mira', 'female'),
  ('Muhammad', 'male'),
  ('Rayan', 'male'),
  ('Ronja', 'female'),
  ('Samuel', 'male'),
  ('Sophia', 'female'),
  ('Stella', 'female'),
  ('Tiara', 'female')
) AS data(name, gender);

-- Step 3: Insert correct students for Class 4b
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  '',
  (SELECT id FROM classes WHERE name = '4b'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('Azia', 'female'),
  ('Carina', 'female'),
  ('Delia', 'female'),
  ('Dias', 'male'),
  ('Elias', 'male'),
  ('Fatima', 'female'),
  ('Fynn', 'male'),
  ('Gabriel', 'male'),
  ('John', 'male'),
  ('Leandro', 'male'),
  ('Lorian', 'male'),
  ('Maya', 'female'),
  ('Melissa', 'female'),
  ('Miki', 'male'),
  ('Niharika', 'female'),
  ('Santiago', 'male'),
  ('Sascha', 'male'),
  ('Sebastian', 'male'),
  ('Severina', 'female'),
  ('Soraya', 'female'),
  ('Summer', 'female')
) AS data(name, gender);

-- Step 4: Insert correct students for Class 4c
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  '',
  (SELECT id FROM classes WHERE name = '4c'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('Ahana', 'female'),
  ('Anika', 'female'),
  ('Anisa', 'female'),
  ('Carlos', 'male'),
  ('Davi', 'male'),
  ('David', 'male'),
  ('Erin', 'female'),
  ('Etika', 'female'),
  ('Ishanika', 'female'),
  ('Jahir', 'male'),
  ('Kaynan', 'male'),
  ('Koray', 'male'),
  ('Lian', 'male'),
  ('Mariana', 'female'),
  ('Naila', 'female'),
  ('Naya', 'female'),
  ('Renas', 'male'),
  ('Shriya', 'female'),
  ('Sydney', 'female'),
  ('Vida', 'female'),
  ('Yasin', 'male'),
  ('Yuliano', 'male')
) AS data(name, gender);

-- Step 5: Insert correct students for Class 4d
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  '',
  (SELECT id FROM classes WHERE name = '4d'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('Andi', 'male'),
  ('Anna', 'female'),
  ('Blendi', 'male'),
  ('Ela', 'female'),
  ('Erblina', 'female'),
  ('Erijon', 'male'),
  ('Eris', 'male'),
  ('Hazar', 'male'),
  ('Jamina', 'female'),
  ('Kian', 'male'),
  ('Leana', 'female'),
  ('Leandros', 'male'),
  ('Leonard', 'male'),
  ('Luesa', 'female'),
  ('Marc', 'male'),
  ('Marlon', 'male'),
  ('Medina', 'female'),
  ('Simon', 'male'),
  ('Sureja', 'female'),
  ('Tiana', 'female'),
  ('Valentina', 'female')
) AS data(name, gender);

-- Step 6: Insert correct students for Class 4e
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  '',
  (SELECT id FROM classes WHERE name = '4e'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('Aaron', 'male'),
  ('Adam', 'male'),
  ('Alina', 'female'),
  ('Anastasija', 'female'),
  ('Berzan', 'male'),
  ('Blerona', 'female'),
  ('Carolina', 'female'),
  ('Chanel', 'female'),
  ('David', 'male'),
  ('Edijon', 'male'),
  ('Elona', 'female'),
  ('Emilja', 'female'),
  ('Joshua', 'male'),
  ('Leandra', 'female'),
  ('Leonardo', 'male'),
  ('Melisa', 'female'),
  ('Mila', 'female'),
  ('Mohammed', 'male'),
  ('Nick', 'male'),
  ('Sofia', 'female'),
  ('Suara', 'female')
) AS data(name, gender);

-- Step 7: Insert correct students for Class 6a
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  '',
  (SELECT id FROM classes WHERE name = '6a'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('Alisha', 'female'),
  ('Antonia', 'female'),
  ('Blendi', 'male'),
  ('Danilo', 'male'),
  ('Denis', 'male'),
  ('Devin', 'male'),
  ('Dominic', 'male'),
  ('Eduard', 'male'),
  ('Eliza', 'female'),
  ('Hakan', 'male'),
  ('Ibrahim', 'male'),
  ('Kerlin', 'male'),
  ('Lena', 'female'),
  ('Matej', 'male'),
  ('Mattia', 'male'),
  ('Nicholas', 'male'),
  ('Ramun', 'male'),
  ('Rina', 'female'),
  ('Salih', 'male'),
  ('Shaiel', 'male'),
  ('Sofia', 'female'),
  ('Sona', 'female'),
  ('Stela', 'female'),
  ('Wael', 'male')
) AS data(name, gender);

-- Step 8: Insert correct students for Test class
INSERT INTO students (id, first_name, last_name, class_id, gender, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  name,
  'Demo',
  (SELECT id FROM classes WHERE name = 'Test'),
  gender,
  NOW(),
  NOW()
FROM (VALUES
  ('TestSchüler1', 'male'),
  ('TestSchüler2', 'female'),
  ('TestSchüler3', 'male'),
  ('TestSchüler4', 'female'),
  ('TestSchüler5', 'male'),
  ('TestSchüler6', 'female'),
  ('TestSchüler7', 'male'),
  ('TestSchüler8', 'female'),
  ('TestSchüler9', 'male'),
  ('TestSchüler10', 'female'),
  ('TestSchüler11', 'male'),
  ('TestSchüler12', 'female')
) AS data(name, gender);

-- Verify the results
SELECT 
  c.name as class_name, 
  COUNT(s.id) as student_count 
FROM classes c 
LEFT JOIN students s ON c.id = s.class_id 
GROUP BY c.name 
ORDER BY c.name;
