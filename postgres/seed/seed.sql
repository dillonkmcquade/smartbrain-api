BEGIN TRANSACTION;
INSERT into users (name, email, joined)
values
  ('test', 'test@gmail.com', '2018-01-01');
INSERT into login (hash, email)
values
  (
    '$2a$10$SwTwPcnmgGQzcUanJhAWju.BL26KD1X7.OCIxpII9fJjbNN33cZHC',
    'test@gmail.com'
  );
COMMIT;