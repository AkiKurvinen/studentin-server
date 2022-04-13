import pg from 'pg';

const pool = new pg.Pool({
  database: 'database',
  user: 'dbuser',
  host: '127.0.0.1',
  password: 'dbpass',
  port: 5432,
});

pool.query(
  `CREATE SEQUENCE users_id_seq;
  CREATE TABLE IF NOT EXISTS public.users
  (
    id integer NOT NULL DEFAULT nextval('users_id_seq') UNIQUE,
    username character varying(100) UNIQUE NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(60) COLLATE pg_catalog."default" NOT NULL,
    role character varying(10) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
  )`,
  (error, results) => {
    if (error) {
      throw error;
    }

    console.log(results);
  }
);
