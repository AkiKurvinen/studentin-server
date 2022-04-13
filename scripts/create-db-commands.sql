CREATE TABLE "users" (
  "id" serial NOT NULL PRIMARY KEY,
  "username" character varying(45) NOT NULL,
  "password" character varying(255) NOT NULL,
  "email" character varying(255) NULL,
  "school" character varying(255) NULL,
  "bio" character varying(500) NULL,
  "joined" date NOT NULL DEFAULT CURRENT_DATE,
  "fname" character varying(45) NULL,
  "lname" character varying(45) NULL,
  "custom_skills" character varying(500) NULL,
  "token" character varying(255) NULL,
  "selector" character varying(255) NULL,
  "title" character varying(45) DEFAULT 'student',
);

CREATE TABLE "projects" (
  "id" serial NOT NULL PRIMARY KEY,
  "name" character varying(255) NOT NULL,
  "details" character varying NULL DEFAULT 'untitled_project',
  "created" date NOT NULL DEFAULT CURRENT_DATE,
  "last_active" date NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE "skills" (
  "id" serial NOT NULL PRIMARY KEY,
  "skill" character varying(45) NOT NULL,
  "category" character varying(45) NOT NULL DEFAULT 'other'
);

CREATE TABLE "memberships" (
  "id" serial NOT NULL,
  "user_id" INT NOT NULL,
  "project_id" INT NOT NULL,
  "role" character varying(45) NOT NULL DEFAULT 'normal',
  PRIMARY KEY (user_id, project_id),
  FOREIGN KEY (project_id)
      REFERENCES projects (id),
  FOREIGN KEY (user_id)
      REFERENCES users(id)
);

CREATE TABLE "talents" (
  "id" serial NOT NULL,
  "user_id" INT NOT NULL,
  "skill_id" INT NOT NULL,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (skill_id)
      REFERENCES skills (id),
  FOREIGN KEY (user_id)
      REFERENCES users(id)
);


CREATE TABLE "recruiting" (
  "id" serial NOT NULL,
  "project_id" INT NOT NULL,
  "skill_id" INT NOT NULL,
  PRIMARY KEY (project_id, skill_id),
  FOREIGN KEY (skill_id)
      REFERENCES skills (id),
  FOREIGN KEY (project_id)
      REFERENCES projects(id)
);