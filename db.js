const Pool = require("pg").Pool;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "@Ravind95",
  port: 5432,
  database: "jwttutorial"
});

module.exports = pool;


// (
//   user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
//   user_email character varying(255) COLLATE pg_catalog."default" NOT NULL,
//   user_password character varying(255) COLLATE pg_catalog."default" NOT NULL,
//   user_name character varying(255) COLLATE pg_catalog."default",
//   CONSTRAINT users_pkey PRIMARY KEY (user_id),
//   CONSTRAINT users_user_email_key UNIQUE (user_email)
// )

// TABLESPACE pg_default;

// ALTER TABLE IF EXISTS public.users
//   OWNER to postgres;