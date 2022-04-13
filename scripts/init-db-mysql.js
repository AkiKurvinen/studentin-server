import pg from 'pg';

const pool = new pg.Pool({
  database: 'database',
  user: 'dbuser',
  host: '127.0.0.1',
  password: 'dbpass',
  port: 5432,
});

pool.query(
  `
CREATE TABLE IF NOT EXISTS mydb.users (
 id SERIAL PRIMARY KEY,
  username VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  school VARCHAR(255) NULL,
  bio VARCHAR(500) NULL,
  joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fname VARCHAR(45) NULL,
  lname VARCHAR(45) NULL,
  custom_skills VARCHAR(500) NULL,
  token VARCHAR(255) NULL,
  selector VARCHAR(255) NULL,
  PRIMARY KEY (id))
;


-- -----------------------------------------------------
-- Table mydb.projects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(45) NOT NULL DEFAULT 'untitled_project',
  details VARCHAR(500) NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id))



-- -----------------------------------------------------
-- Table mydb.skills
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.skills (
  id SERIAL PRIMARY KEY,
  skill VARCHAR(45) NOT NULL,
  category VARCHAR(45) NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX skill_UNIQUE (skill ASC) VISIBLE);



-- -----------------------------------------------------
-- Table mydb.memberships
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.memberships (
 id SERIAL PRIMARY KEY,
  users_id INT NOT NULL,
  projects_id INT NOT NULL,
  role VARCHAR(45) NOT NULL DEFAULT 'normal',
  PRIMARY KEY (id),
  INDEX fk_memberships_users_idx (users_id ASC) VISIBLE,
  INDEX fk_memberships_projects1_idx (projects_id ASC) VISIBLE,
  CONSTRAINT fk_memberships_users
    FOREIGN KEY (users_id)
    REFERENCES mydb.users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_memberships_projects
    FOREIGN KEY (projects_id)
    REFERENCES mydb.projects (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);



-- -----------------------------------------------------
-- Table mydb.talents
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.talents (
 id SERIAL PRIMARY KEY,
  users_id INT NOT NULL,
  skills_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX fk_talents_users1_idx (users_id ASC) VISIBLE,
  INDEX fk_talents_skills1_idx (skills_id ASC) VISIBLE,
  CONSTRAINT fk_talents_users1
    FOREIGN KEY (users_id)
    REFERENCES mydb.users (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_talents_skills1
    FOREIGN KEY (skills_id)
    REFERENCES mydb.skills (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



-- -----------------------------------------------------
-- Table mydb.recruiting
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.recruiting (
 id SERIAL PRIMARY KEY,
  projects_id INT NOT NULL,
  skills_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX fk_recruiting_projects1_idx (projects_id ASC) VISIBLE,
  INDEX fk_recruiting_skills1_idx (skills_id ASC) VISIBLE,
  CONSTRAINT fk_recruiting_projects1
    FOREIGN KEY (projects_id)
    REFERENCES mydb.projects (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_recruiting_skills1
    FOREIGN KEY (skills_id)
    REFERENCES mydb.skills (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;`,
  (error, results) => {
    if (error) {
      throw error;
    }

    console.log(results);
  }
);
