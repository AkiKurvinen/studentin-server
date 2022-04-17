import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import HttpError from './http-error.js';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
// CREATE
// users
const addUser = async (req, res, next) => {
  const userExist = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [req.body.username]
  );

  if (userExist.rowCount > 0) {
    return next(new HttpError('Username already taken', 500));
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);
  } catch (error) {
    return next(new HttpError('Could not create user, try again.', 500));
  }

  const result = await pool.query(
    'INSERT INTO users (username, email, password, title) VALUES ($1,$2,$3,$4)',
    [req.body.username, req.body.email, hashedPassword, req.body.title]
  );

  if (result) {
    const users = await pool.query(
      'SELECT id, username, email, fname, lname, school  FROM users WHERE username = $1 ORDER BY id ASC',
      [req.body.username]
    );

    //res.json({ user: users.rows });
    let token;
    try {
      token = jwt.sign(
        {
          userId: users.rows[0].id,
          username: users.rows[0].username,
        },
        'secret_only_the_server_knows', // secret key
        { expiresIn: '1h' } // options like an experation time
      );
    } catch (err) {
      return next(new HttpError('Signup failed, please try again', 500));
    }

    res.status(201).json({
      userId: users.rows[0].id,
      username: users.rows[0].username,
      token: token,
    });
  } else {
    res.json({ error: 'Could not add user.' });
  }
};
app.post('/api/users/', addUser);

// projects
const addProject = async (req, res, next) => {
  let response;
  if (req.body.projectname && req.body.projectname.length === 0) {
    response = await pool.query(
      'INSERT INTO projects (name, details) VALUES ( $2)',
      [req.body.projectdetails]
    );
  } else if (req.body.projectname && req.body.projectname.length > 0) {
    response = await pool.query(
      'INSERT INTO projects (name, details) VALUES ($1, $2)',
      [req.body.projectname, req.body.projectdetails]
    );
  } else {
    res.status(500).json({
      response: 'Missing arguments',
    });
  }

  if (response.rowCount === 1) {
    console.log(response);
    const newid = await pool.query(
      'SELECT * FROM projects WHERE name = $1 ORDER BY id DESC LIMIT 1',
      [req.body.projectname]
    );
    res.status(201).json({
      projectid: newid.rows[0].id,
    });
  } else {
    res.status(500).json({
      response: 'Could not add project',
    });
  }
};
app.post('/api/projects/', addProject);

// memberships
const addMemberships = async (req, res, next) => {
  const response = await pool.query(
    'INSERT INTO memberships (user_id, project_id, role) VALUES ($1, $2 ,$3)',
    [req.body.uid, req.body.pid, req.body.role]
  );
  if (response && response.rowCount === 1) {
    res.status(201).json({
      response: 'Membership added',
    });
  } else {
    res.status(500).json({
      response: 'Could not add membership',
    });
  }
};
app.post('/api/memberships/', addMemberships);
// skills
const addNewSkill = async (req, res, next) => {
  const response = await pool.query(
    'INSERT INTO skills (skill, category) VALUES ($1, $2)',
    [req.body.skill, req.body.cat]
  );
  if (response.rowCount > 0) {
    const findSkillID = await pool.query(
      'SELECT id FROM skills WHERE skill = $1 LIMIT 1',
      [req.body.skill]
    );

    if (findSkillID.rowCount > 0) {
      console.log(findSkillID.rows[0].id);
      const newskillid = findSkillID.rows[0].id;
      res.status(201).json({
        id: newskillid,
      });
    }
  } else {
    res.status(500).json({
      response: 'Could not add skill',
    });
  }
};
app.post('/api/skills/', addNewSkill);
// talents
const addTalent = async (req, res, next) => {
  const checkexist = await pool.query(
    `SELECT COUNT(*) FROM talents WHERE user_id = $1 AND skill_id = $2`,
    [req.body.user_id, req.body.skill_id]
  );
  if (
    checkexist !== undefined &&
    checkexist.rowCount > 0 &&
    checkexist.rows[0].count > 0
  ) {
    console.log(checkexist);
    res.status(201).json({
      message: 'You have already added this talent',
    });
  } else {
    const response = await pool.query(
      'INSERT INTO talents (user_id, skill_id) VALUES ($1, $2)',
      [req.body.user_id, req.body.skill_id]
    );
    if (response !== undefined && response.rowCount > 0) {
      res.status(201).json({
        message: 'Talent added',
      });
    } else {
      res.status(500).json({
        message: 'Could not add talent',
      });
    }
  }
};
app.post('/api/talents/', addTalent);

// READ
// users
const getUserById = async (req, res, next) => {
  const uid = parseInt(req.params.id);
  const users = await pool.query(
    'SELECT id, username, email, school, bio, joined, fname, lname, custom_skills, token, selector, title FROM users WHERE id = $1 ORDER BY id ASC',
    [uid]
  );
  if (users.rowCount == 0) {
    res.status(404).json({ error: 'No user by that id' });
  } else {
    res.status(200).json({ users: users.rows });
  }
};
app.get('/api/users/:id', getUserById);

const findUserBynameEmail = async (req, res, next) => {
  const name = req.params.name;

  const users = await pool.query(
    `SELECT id, username, email, fname, lname, school FROM users WHERE LOWER(username) LIKE LOWER('%${name}%') OR LOWER(email) LIKE LOWER('%${name}%') ORDER BY id ASC`
  );
  if (users.rowCount == 0) {
    res.status(404).json({ error: 'no users found' });
  } else {
    res.status(200).json({ users: users.rows });
  }
};
app.get('/api/find/:name', findUserBynameEmail);
const findProjectByName = async (req, res, next) => {
  const name = req.params.project;

  const projects = await pool.query(
    `SELECT * FROM projects WHERE LOWER(name) LIKE LOWER('%${name}%') ORDER BY id ASC`
  );
  if (projects.rowCount == 0) {
    res.status(404).json({ error: 'no projects found' });
  } else {
    res.status(200).json({ projects: projects.rows });
  }
};
app.get('/api/find/projects/:project', findProjectByName);
const findPersoinWithSkill = async (req, res, next) => {
  const skill = req.params.skill;

  const skills = await pool.query(
    `SELECT skills.skill, talents.user_id, users.username, users.email,  users.school, users.fname, users.lname
 FROM talents
 INNER JOIN skills ON talents.skill_id= skills.id
 INNER JOIN users ON talents.user_id= users.id
 WHERE LOWER(skills.skill) LIKE LOWER('%${skill}%')`
  );
  if (skills.rowCount == 0) {
    res.json({ error: 'no skilled users found' });
  } else {
    res.json({ skills: skills.rows });
  }
};
app.get('/api/find/skills/:skill', findPersoinWithSkill);
const getUsers = async (req, res, next) => {
  const users = await pool.query(
    'SELECT id, username, email, fname, lname, school FROM users ORDER BY id ASC'
  );
  res.status(200).json({ users: users.rows });
};
app.get('/api/users/', getUsers);
const getProjectMembers = async (req, res, next) => {
  const pid = parseInt(req.params.pid);
  const members = await pool.query(
    `
  SELECT users.username, users.email, users.id, memberships.role
  FROM memberships
  INNER JOIN users ON memberships.user_id = users.id
  WHERE memberships.project_id= $1`,
    [pid]
  );
  res.status(200).json({ members: members.rows });
};
app.get('/api/members/:pid', getProjectMembers);
const loginUser = async (req, res, next) => {
  const password = req.body.password;
  const username = req.body.username;

  const users = await pool.query(
    'SELECT * FROM users WHERE username = $1 ORDER BY id ASC',
    [username]
  );
  if (users.rowCount == 0) {
    res.json({ error: 'Wrong username or password' });
  } else {
    const passw = users.rows[0].password;
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, passw);
    } catch (error) {
      new HttpError('Could not log you in, credetials might be wrong', 500);
    }
    if (!isValidPassword) {
      res.json({ error: 'Wrong username or password' });
      new HttpError('Could not log you in, credetials might be wrong', 500);
    } else {
      const users = await pool.query(
        'SELECT * FROM users WHERE username = $1 ORDER BY id ASC',
        [req.body.username]
      );
      let token;
      try {
        token = jwt.sign(
          {
            userId: users.rows[0].id,
            username: users.rows[0].username,
          },
          'secret_only_the_server_knows', // secret key
          { expiresIn: '1h' } // options like an experation time
        );
      } catch (err) {
        return next(new HttpError('Login in failed, please try again', 500));
      }

      res.status(201).json({
        userId: users.rows[0].id,
        username: users.rows[0].username,
        token: token,
      });
      //
    }
  }
};
app.post('/api/login/', loginUser);

// projects
const getAllProjects = async (req, res, next) => {
  const allProjects = await pool.query('SELECT * FROM projects LIMIT 50');

  if (allProjects.rowCount == 0) {
    res.status(404).json({
      error: 'No projects found',
    });
  }
  res.status(200).json({
    projects: allProjects.rows,
  });
};
app.get('/api/projects/', getAllProjects);

const getMyProjects = async (req, res, next) => {
  const uid = parseInt(req.params.uid);
  const myProjects = await pool.query(
    `SELECT memberships.user_id, projects.id, projects.name, projects.details
   FROM memberships
   INNER JOIN projects ON project_id = projects.id
   WHERE memberships.user_id = $1`,
    [uid]
  );

  if (myProjects.rowCount == 0) {
    res.status(404).json({
      error: 'No projects found',
    });
  } else {
    res.status(200).json({ projects: myProjects.rows });
  }
};
app.get('/api/myprojects/:uid', getMyProjects);

// skills
const getUserSkills = async (req, res, next) => {
  const uid = parseInt(req.params.uid);
  const myskills = await pool.query(
    `SELECT talents.user_id, talents.skill_id, skills.skill, skills.category
   FROM talents
   INNER JOIN skills ON skill_id = skills.id
   WHERE talents.user_id = $1`,
    [uid]
  );

  if (myskills.rowCount == 0) {
    res.status(404).json({
      error: 'No skills added',
    });
  } else {
    res.status(200).json({
      skills: myskills.rows,
    });
  }
};
app.get('/api/user/:uid/skills', getUserSkills);

const findSkillBySkillname = async (req, res, next) => {
  const skillname = req.params.skillname;
  const myskills = await pool.query(
    `SELECT id FROM skills WHERE LOWER(skill) = LOWER($1) LIMIT 1`,
    [skillname]
  );

  if (myskills.rowCount == 0) {
    res.status(404).json({
      skillid: 0,
    });
  } else {
    res.status(200).json({
      skillid: myskills.rows[0].id,
    });
  }
};
app.get('/api/skills/:skillname', findSkillBySkillname);
// UPDATE
const updateUser = async (req, res, next) => {
  const uid = parseInt(req.body.id);
  let hashedPassword = '';
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);
  } catch (error) {
    return next(new HttpError('Could not update user, try again.', 500));
  }

  const users = await pool.query(
    `
    UPDATE users
    SET username = $1, email = $2, password = $3, title = $4
    WHERE id = $5;`,
    [req.body.username, req.body.email, hashedPassword, req.body.title, uid]
  );
  const checkUsers = await pool.query(
    'SELECT id, username, email, title, fname, lname, school  FROM users WHERE id = $1 ORDER BY id ASC',
    [uid]
  );
  res.status(200).json({ users: checkUsers.rows });
};
app.patch('/api/users/', updateUser);

const updateUserField = async (req, res, next) => {
  const uid = parseInt(req.body.id);
  const item = req.body.item;
  const txt = req.body.data;

  const actions = ['school', 'bio', 'email', 'fname', 'lname'];
  if (actions.includes(item)) {
    // match
    const users = await pool.query(
      `
    UPDATE users
    SET ${item} = $2
    WHERE id = $1;`,
      [uid, txt]
    );

    const check = await pool.query(
      `
    SELECT ${item}
    FROM users
    WHERE id = $1;`,
      [uid]
    );
    if (res.statusCode == 200 && check.rowCount > 0) {
      res.status(200).json({
        success: 'Data updated',
      });
    } else {
      res.status(500).json({ error: 'Data not updated' });
    }
  } else {
    res.status(404).json({ error: 'Data not updated, no action' });
  }
};
app.patch('/api/update/userdata/', updateUserField);
const updateProjectField = async (req, res, next) => {
  const pid = parseInt(req.body.pid);
  const item = req.body.item;
  const txt = req.body.data;

  const actions = ['details'];
  if (actions.includes(item)) {
    // match
    const users = await pool.query(
      `
    UPDATE projects
    SET ${item} = $2
    WHERE id = $1;`,
      [pid, txt]
    );

    const check = await pool.query(
      `
    SELECT ${item}
    FROM projects
    WHERE id = $1;`,
      [pid]
    );
    if (res.statusCode == 200 && check.rowCount > 0) {
      res.status(200).json({
        success: 'Data updated',
      });
    } else {
      res.status(500).json({ error: 'Data not updated' });
    }
  } else {
    res.status(404).json({ error: 'Data not updated, no action' });
  }
};
app.patch('/api/update/project/', updateProjectField);
// DELETE
const deleteUserMemberships = async (req, res, next) => {
  const uid = parseInt(req.body.id);
  const memberships = await pool.query(
    'DELETE FROM memberships WHERE user_id = $1;',
    [uid]
  );

  const checkMemberships = await pool.query(
    'SELECT id FROM memberships WHERE user_id = $1',
    [uid]
  );
  if (checkMemberships.rows.length !== 0) {
    res.status(500).json({ failed: 'Cannot delete user memberships.' });
  } else {
    res.status(200).json({ success: `User ${uid} talents memberships.` });
  }
};
app.delete('/api/users/memberships/', deleteUserMemberships);
const deleteUserTalents = async (req, res, next) => {
  const uid = parseInt(req.body.id);
  const talents = await pool.query('DELETE FROM talents WHERE user_id = $1;', [
    uid,
  ]);

  const checkTalents = await pool.query(
    'SELECT id FROM talents WHERE user_id = $1',
    [uid]
  );
  if (checkTalents.rows.length !== 0) {
    res.json({ failed: 'Cannot delete user talents.' });
  } else {
    res.json({ success: `User ${uid} talents deleted.` });
  }
};
app.delete('/api/users/talents/', deleteUserTalents);
const deleteUserById = async (req, res, next) => {
  const uid = parseInt(req.body.id);

  const users = await pool.query('DELETE FROM users WHERE id = $1', [uid]);
  const checkUsers = await pool.query(
    'SELECT id, username, email, fname, lname, school  FROM users WHERE id = $1 ORDER BY id ASC',
    [uid]
  );
  if (checkUsers.rows.length !== 0) {
    res.status(500).json({ failed: 'Cannot delete user' });
  } else {
    res.status(200).json({ success: `User ${uid} deleted.` });
  }
};
app.delete('/api/users/', deleteUserById);
const deleteEmptyProjects = async (req, res, next) => {
  const projects = await pool.query(
    `DELETE FROM projects
    WHERE id NOT IN (
      SELECT project_id
      FROM memberships)`
  );
  if (projects !== undefined) {
    res.status(200).json({ delete: 'OK' });
  } else {
    res.status(500).json({ delete: 'FAILED' });
  }
};
app.delete('/api/projects/empty/', deleteEmptyProjects);

const deleteProjectById = async (req, res, next) => {
  const pid = parseInt(req.body.pid);

  const del_memberships = await pool.query(
    'DELETE FROM memberships WHERE project_id = $1',
    [pid]
  );
  const del_projects = await pool.query('DELETE FROM projects WHERE id = $1', [
    pid,
  ]);
  if (del_memberships.rows.length !== 0 || del_projects.rows.length !== 0) {
    console.log(del_memberships);
    res.status(500).json({ failed: 'Cannot delete project' });
  } else {
    res.status(200).json({ success: `Project ${pid} deleted.` });
  }
};
app.delete('/api/project/', deleteProjectById);

const deleteTalent = async (req, res, next) => {
  const sid = parseInt(req.body.skilldataId);
  const uid = parseInt(req.body.skilldataUid);
  const talents = await pool.query(
    'DELETE FROM talents WHERE user_id = $1 AND skill_id = $2',
    [uid, sid]
  );

  res.status(200).json({ success: `Talent ${uid} removed.` });
};
app.delete('/api/talents/', deleteTalent);

const deleteMembership = async (req, res, next) => {
  const pid = parseInt(req.body.pid);
  const uid = parseInt(req.body.uid);
  const memberships = await pool.query(
    'DELETE FROM memberships WHERE user_id = $1 AND project_id = $2',
    [uid, pid]
  );
  res.json({ success: `User ${uid} deleted from project ${pid}.` });
};
app.delete('/api/membership/', deleteMembership);

// OTHER
app.use((req, res, next) => {
  throw new HttpError('Could not find this route.', 404);
});
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || 'Unknown error occured' });
});

app.listen(process.env.PORT, () =>
  console.log('API is running in port ', +process.env.PORT)
);
export default app;
