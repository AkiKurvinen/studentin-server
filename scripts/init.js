const pg = require('pg');

const pool = new pg.Pool({
  database: 'studentdb',
  user: 'dbuser',
  host: '127.0.0.1',
  password: 'dbpass',
  port: 5432,
});

pool.query(
  `
CREATE SEQUENCE memberships_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
CREATE SEQUENCE projects_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
CREATE SEQUENCE recruiting_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
CREATE SEQUENCE skills_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
CREATE SEQUENCE talents_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;

CREATE TABLE "public"."projects" (
    "id" integer DEFAULT nextval('projects_id_seq') NOT NULL,
    "name" character varying(255) DEFAULT 'untitled_project' NOT NULL,
    "details" character varying(300),
    "created" date DEFAULT CURRENT_DATE NOT NULL,
    "last_active" date DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" character varying(45) NOT NULL,
    "password" character varying(255) NOT NULL,
    "email" character varying(255),
    "school" character varying(255),
    "bio" character varying(500),
    "joined" date DEFAULT CURRENT_DATE NOT NULL,
    "fname" character varying(45),
    "lname" character varying(45),
    "custom_skills" character varying(500),
    "token" character varying(255),
    "selector" character varying(255),
    "title" character varying(45) DEFAULT 'student',
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE TABLE "public"."memberships" (
    "id" integer DEFAULT nextval('memberships_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "project_id" integer NOT NULL,
    "role" character varying(45) DEFAULT 'normal' NOT NULL,
    CONSTRAINT "memberships_pkey" PRIMARY KEY ("user_id", "project_id"),
    CONSTRAINT "memberships_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) NOT DEFERRABLE,
    CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE
) WITH (oids = false);

CREATE TABLE "public"."skills" (
    "id" integer DEFAULT nextval('skills_id_seq') NOT NULL,
    "skill" character varying(45) NOT NULL,
    "category" character varying(45) DEFAULT 'other' NOT NULL,
    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE TABLE "public"."recruiting" (
    "id" integer DEFAULT nextval('recruiting_id_seq') NOT NULL,
    "project_id" integer NOT NULL,
    "skill_id" integer NOT NULL,
    CONSTRAINT "recruiting_pkey" PRIMARY KEY ("project_id", "skill_id"),
    CONSTRAINT "recruiting_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) NOT DEFERRABLE,
    CONSTRAINT "recruiting_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES skills(id) NOT DEFERRABLE
) WITH (oids = false);


CREATE TABLE "public"."talents" (
    "id" integer DEFAULT nextval('talents_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "skill_id" integer NOT NULL,
    CONSTRAINT "talents_pkey" PRIMARY KEY ("user_id", "skill_id"),
    CONSTRAINT "talents_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES skills(id) NOT DEFERRABLE,
    CONSTRAINT "talents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE
) WITH (oids = false);



INSERT INTO "users" ("id", "username", "password", "email", "school", "bio", "joined", "fname", "lname", "custom_skills", "token", "selector", "title") VALUES
(3,	'Beta',	'$2a$12$XpE5TejihLEX1W2qi.ESf.p4qqsNaDYxwY1R9fM0g3lcSpbU5Yw/q',	'Beta.betaman@mail.com',	'Tuni',	'Beta bio ',	'2022-04-03',	'Bertil',	'Bellingcat',	NULL,	NULL,	NULL,	'client'),
(2,	'Admin',	'$2a$12$7.piG3OgnOonl3cE5en3z.3Yx1iWdDAhO/cImHbEYSYaHCiN2N8jK',	'Admin@mail.com',	NULL,	NULL,	'2022-03-13',	'Aatu',	'Admin',	NULL,	NULL,	NULL,	'admin'),
(1,	'Alfa',	'$2a$12$GsU3xjRmVQ29RGe0Z8P./em6//koefd.VqJGwBSkj2VxR2b43LHb6',	'Alfa@mail.fi',	'Tuni',	'Alfa bio text.',	'2022-03-13',	'Adam',	'Andersson',	NULL,	NULL,	NULL,	'admin'),
(4,	'Gamma',	'$2a$12$Q1OCW1AXZ/LJlyKgTpaJYuMZLieGx/tJRZTEjKPMtcCmpvfc8H6Vi',	'Gabriella@mail.fi',	'Elämänkoulu',	'Here is bio!',	'2022-04-06',	'Gabriella',	'Gerbiiili',	NULL,	NULL,	NULL,	'admin');

INSERT INTO "projects" ("id", "name", "details", "created", "last_active") VALUES
(452,	'New Project',	'Awesome Alfa Project',	'2022-04-03',	'2022-04-03'),
(453,	'Admin project',	'Test role',	'2022-04-03',	'2022-04-03');
INSERT INTO "memberships" ("id", "user_id", "project_id", "role") VALUES
(44,	2,	452,	'creator'),
(45,	2,	453,	'creator');
INSERT INTO "skills" ("id", "skill", "category") VALUES
(1,	'C++',	'code'),
(2,	'JavaScript',	'code'),
(3,	'React',	'framework'),
(4,	'Vue.js',	'framework'),
(5,	'Video Editing',	'media'),
(6,	'Photography',	'media'),
(7,	'Photoshop',	'adobe'),
(8,	'Illustrator',	'adobe'),
(9,	'InDesign',	'adobe'),
(10,	'Excel',	'office'),
(11,	'Teams',	'office'),
(12,	'OneDrive',	'office'),
(13,	'OneNote',	'office'),
(14,	'Outlook',	'office'),
(15,	'PowerPoint',	'office'),
(16,	'SharePoint',	'office'),
(17,	'Skype',	'office'),
(18,	'Word',	'office'),
(19,	'Yammer',	'office'),
(22,	'Marketing',	'other'),
(23,	'Finance',	'other'),
(24,	'SAP',	'other'),
(25,	'Physics',	'other'),
(26,	'Mathlab',	'other'),
(27,	'Chemistry',	'other'),
(28,	'Chemistry',	'other'),
(29,	'Dancing',	'other'),
(30,	'Dancing',	'other'),
(31,	'Singing',	'other'),
(32,	'Singing',	'other'),
(33,	'TikTok',	'some'),
(34,	'Instagram',	'some'),
(35,	'Twitter',	'some'),
(36,	'Facebook',	'some'),
(37,	'C',	'code'),
(38,	'AfterEffects',	'adobe'),
(39,	'Premiere',	'adobe'),
(40,	'OnlyFans',	'other'),
(41,	'js',	'other'),
(43,	'test_skill',	'test_skills');
INSERT INTO "talents" ("id", "user_id", "skill_id") VALUES
(1,	1,	1),
(2,	1,	2),
(5,	1,	5),
(8,	1,	8),
(9,	1,	9),
(10,	1,	10),
(14,	1,	34),
(15,	1,	35),
(16,	1,	33),
(17,	1,	36),
(23,	1,	18),
(24,	1,	22),
(25,	1,	37),
(28,	1,	38),
(34,	1,	39),
(35,	1,	7),
(68,	1,	23),
(70,	3,	7),
(71,	3,	1),
(72,	4,	8),
(73,	4,	1),
(75,	4,	2),
(76,	4,	9),
(77,	4,	18);

`,
  (error, results) => {
    if (error) {
      throw error;
    }

    console.log(results);
  }
);
