-- The following code is not valid SQL and appears to be Python code.
-- SQL files should contain SQL statements. If you need to hash passwords in SQL,
-- you should use a database function or preprocess the data in your application.

-- Example of a hashed password inserted into a SQL file:
CREATE TABLE
  public.users (
    id serial NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
  );

ALTER TABLE
  public.users
ADD
  CONSTRAINT users_pkey PRIMARY KEY (id);
INSERT INTO users (email, password) VALUES ('user@gmail.com', 'testpassword');