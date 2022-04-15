import { expect } from '@jest/globals';
import pool from './db';
import supertest from 'supertest';
import app from './server.js';

// CREATE
test('POST /api/users/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'newtestUser',
  ]);
  console.log(user_id);
  if (user_id.rowCount > 0) {
    await pool.query('DELETE FROM memberships WHERE role=$1', ['test']);
    await pool.query('DELETE FROM talents WHERE user_id=$1', [
      user_id.rows[0].id,
    ]);
    await pool.query('DELETE FROM users WHERE id=$1', [user_id.rows[0].id]);
  }

  const data = {
    username: 'testUser',
    email: 'test.user@mail.com',
    password: 'password',
    title: 'student',
  };
  const response = await supertest(app)
    .post('/api/users/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(201);
  expect(response.body.userId).toBeTruthy();
  expect(response.body.username).toBeTruthy();
  expect(response.body.token).toBeTruthy();
});
test('POST /api/users/', async () => {
  const data = {
    username: 'testUser',
    email: 'test.user@mail.com',
    password: 'password',
    title: 'student',
  };
  const response = await supertest(app)
    .post('/api/users/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(500);
  expect(response.body.message).toEqual('Username already taken');
});

test('POST /api/projects/', async () => {
  await pool.query('DELETE FROM projects WHERE name=$1', ['Test_project']);
  const data = {
    projectname: 'Test_project',
    projectdetails: 'Lorem ipsum dolor sit amet.',
  };
  const response = await supertest(app)
    .post('/api/projects/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(201);
  expect(response.body.projectid).toBeTruthy();
});
test('POST /api/memberships/', async () => {
  await pool.query('DELETE FROM memberships WHERE role=$1', ['test']);
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  const project_id = await pool.query('SELECT id FROM projects WHERE name=$1', [
    'Test_project',
  ]);

  const data = {
    uid: user_id.rows[0].id,
    pid: project_id.rows[0].id,
    role: 'test',
  };

  const response = await supertest(app)
    .post('/api/memberships/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(201);
  expect(response.body.response).toEqual('Membership added');
});

test('POST /api/skills/', async () => {
  await pool.query('DELETE FROM skills WHERE skill=$1', ['test_skill']);

  const data = {
    skill: 'test_skill',
    cat: 'test_skills',
  };

  const response = await supertest(app)
    .post('/api/skills/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(201);
  expect(response.body.id).toBeTruthy();
});

test('POST /api/talents/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  const skill_id = await pool.query('SELECT id FROM skills WHERE skill=$1', [
    'test_skill',
  ]);
  await pool.query('DELETE FROM talents WHERE user_id=$1 AND skill_id = $2', [
    user_id.rows[0].id,
    skill_id.rows[0].id,
  ]);

  const data = {
    user_id: user_id.rows[0].id,
    skill_id: skill_id.rows[0].id,
  };

  const response = await supertest(app)
    .post('/api/talents/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(201);
  expect(response.body.message).toEqual('Talent added');
});

// READ
test('GET /api/users/:id', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  const data = {
    username: 'testUser',
    email: 'test.user@mail.com',
    password: 'password',
    title: 'student',
  };

  await supertest(app)
    .get(`/api/users/${user_id.rows[0].id}`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.users[0].id).toEqual(user_id.rows[0].id);
      expect(res.body.users[0].username).toEqual(data.username);
      expect(res.body.users[0].email).toEqual(data.email);
      expect(res.body.users[0].title).toEqual(data.title);
      expect(res.body.users[0].password).toBeFalsy();
    });
});
test('GET /api/find/:name', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  const data = {
    username: 'testUser',
    email: 'test.user@mail.com',
  };

  await supertest(app)
    .get(`/api/find/${data.username}`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.users[0].id).toEqual(user_id.rows[0].id);
      expect(res.body.users[0].username).toEqual(data.username);
      expect(res.body.users[0].email).toEqual(data.email);
      expect(res.body.users[0].fname).toBeNull();
      expect(res.body.users[0].lname).toBeNull();
    });

  await supertest(app)
    .get(`/api/find/${data.email}`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.users[0].id).toEqual(user_id.rows[0].id);
      expect(res.body.users[0].username).toEqual(data.username);
      expect(res.body.users[0].email).toEqual(data.email);
      expect(res.body.users[0].fname).toBeNull();
      expect(res.body.users[0].lname).toBeNull();
    });
});
test('GET /api/projects/:project', async () => {
  const data = {
    projectname: 'Test_project',
    projectdetails: 'Lorem ipsum dolor sit amet.',
  };

  await supertest(app)
    .get(`/api/find/projects/Test_project`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.projects[0].id).toBeTruthy();
      expect(res.body.projects[0].name).toEqual(data.projectname);
      expect(res.body.projects[0].details).toEqual(data.projectdetails);
    });
});
test('GET /api/find/skills/:skill', async () => {
  await supertest(app)
    .get(`/api/find/skills/test_skill`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.skills[0].skill).toEqual('test_skill');
      expect(res.body.skills[0].user_id).toBeTruthy();
      expect(res.body.skills[0].username).toEqual('testUser');
    });
});
test('GET /api/users/', async () => {
  await supertest(app)
    .get(`/api/users/`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(Array.isArray(res.body.users)).toBeTruthy();
    });
});

test('GET /api/members/:pid', async () => {
  const project_id = await pool.query('SELECT id FROM projects WHERE name=$1', [
    'Test_project',
  ]);
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  await supertest(app)
    .get(`/api/members/${project_id.rows[0].id}`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(Array.isArray(res.body.members)).toBeTruthy();
      expect(res.body.members[0].username).toEqual('testUser');
      expect(res.body.members[0].email).toEqual('test.user@mail.com');
      expect(res.body.members[0].id).toEqual(user_id.rows[0].id);
      expect(res.body.members[0].role).toEqual('test');
    });
});
test('POST /api/login/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);

  const correctUser = {
    username: 'testUser',
    password: 'password',
  };

  const response_correct = await supertest(app)
    .post('/api/login/')
    .set('Accept', 'application/json')
    .send(correctUser);

  expect(response_correct.status).toEqual(201);
  expect(response_correct.body.userId).toEqual(user_id.rows[0].id);

  const noUserFound = {
    username: 'no_user',
    password: 'password',
  };
  const response_no_user_found = await supertest(app)
    .post('/api/login/')
    .set('Accept', 'application/json')
    .send(noUserFound);

  expect(response_no_user_found.status).toEqual(200);
  expect(response_no_user_found.body.error).toEqual(
    'Wrong username or password'
  );
  const wrongPass = {
    username: 'testUser',
    password: 'wrong_pass',
  };
  const response_wrong_pass = await supertest(app)
    .post('/api/login/')
    .set('Accept', 'application/json')
    .send(wrongPass);

  expect(response_wrong_pass.status).toEqual(200);
  expect(response_wrong_pass.body.error).toEqual('Wrong username or password');
});
test('GET /api/projects', async () => {
  await supertest(app)
    .get(`/api/projects/`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(Array.isArray(res.body.projects)).toBeTruthy();
    });
});
test('GET /api/myprojects/:uid', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  const data = {
    projectname: 'Test_project',
    projectdetails: 'Lorem ipsum dolor sit amet.',
  };
  await supertest(app)
    .get(`/api/myprojects/${user_id.rows[0].id}`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(Array.isArray(res.body.projects)).toBeTruthy();
      expect(res.body.projects[0].user_id).toEqual(user_id.rows[0].id);
      expect(res.body.projects[0].name).toEqual(data.projectname);
      expect(res.body.projects[0].details).toEqual(data.projectdetails);
    });
});
test('GET /api/user/:uid/skills', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);

  await supertest(app)
    .get(`/api/user/${user_id.rows[0].id}/skills`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(Array.isArray(res.body.skills)).toBeTruthy();

      expect(res.body.skills[0].user_id).toEqual(user_id.rows[0].id);
      expect(res.body.skills[0].skill_id).toBeTruthy();
      expect(res.body.skills[0].skill).toEqual('test_skill');
      expect(res.body.skills[0].category).toEqual('test_skills');
    });
});
test('GET /api/skills/:skillname', async () => {
  const skill_id = await pool.query('SELECT id FROM skills WHERE skill=$1', [
    'test_skill',
  ]);

  await supertest(app)
    .get(`/api/skills/test_skill`)
    .expect(200)
    .then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.skillid).toEqual(skill_id.rows[0].id);
    });
});
// UPDATE
test('PATCH /api/users/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'testUser',
  ]);
  const data = {
    username: 'newtestUser',
    email: 'newtest.user@mail.com',
    password: 'newpassword',
    title: 'newstudent',
    id: user_id.rows[0].id,
  };
  const response = await supertest(app)
    .patch('/api/users/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(200);
  expect(Array.isArray(response.body.users)).toBeTruthy();

  expect(response.body.users[0].id).toEqual(user_id.rows[0].id);
  expect(response.body.users[0].username).toEqual(data.username);
  expect(response.body.users[0].email).toEqual(data.email);
  expect(response.body.users[0].password).toBeFalsy();
  expect(response.body.users[0].title).toEqual(data.title);
});
test('PATCH /api/update/userdata/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'newtestUser',
  ]);
  const actions = ['school', 'bio', 'email', 'fname', 'lname'];

  // success
  for (let i = 0; i < 5; i++) {
    const data = {
      id: user_id.rows[0].id,
      item: actions[i],
      data: 'New ' + actions[i],
    };

    const response = await supertest(app)
      .patch('/api/update/userdata/')
      .set('Accept', 'application/json')
      .send(data);

    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual('Data updated');
  }
  // failed
  const invalid_action = {
    id: user_id.rows[0].id,
    item: 'invalid_action',
    data: 'New invalid action',
  };

  const response_1 = await supertest(app)
    .patch('/api/update/userdata/')
    .set('Accept', 'application/json')
    .send(invalid_action);

  expect(response_1.status).toEqual(200);
  expect(response_1.body.error).toEqual('Data not updated, no action');

  const invalid_user = {
    id: 0,
    item: 'school',
    data: 'New school',
  };

  const response_2 = await supertest(app)
    .patch('/api/update/userdata/')
    .set('Accept', 'application/json')
    .send(invalid_user);

  expect(response_2.status).toEqual(200);
  expect(response_2.body.error).toEqual('Data not updated');
});
test('PATCH /api/update/project/', async () => {
  const project_id = await pool.query('SELECT id FROM projects WHERE name=$1', [
    'Test_project',
  ]);

  const data = {
    pid: project_id.rows[0].id,
    item: 'details',
    data: 'New project details',
  };

  const response = await supertest(app)
    .patch('/api/update/project/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(200);
  expect(response.body.success).toEqual('Data updated');
});

// DELETE
test('DELETE /api/membership/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'newtestUser',
  ]);
  const project_id = await pool.query('SELECT id FROM projects WHERE name=$1', [
    'Test_project',
  ]);

  const data = {
    pid: project_id.rows[0].id,
    uid: user_id.rows[0].id,
  };

  const response = await supertest(app)
    .delete('/api/membership/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(200);
  expect(response.body.success).toEqual(
    `User ${data.uid} deleted from project ${data.pid}.`
  );
});
test('DELETE /api/project/', async () => {
  const project_id = await pool.query('SELECT id FROM projects WHERE name=$1', [
    'Test_project',
  ]);

  const data = {
    pid: project_id.rows[0].id,
  };

  const response = await supertest(app)
    .delete('/api/project/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(200);
  expect(response.body.success).toEqual(`Project ${data.pid} deleted.`);
});
test('DELETE /api/talents/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'newtestUser',
  ]);
  const skill_id = await pool.query('SELECT id FROM skills WHERE skill=$1', [
    'test_skill',
  ]);

  const data = {
    skilldataId: skill_id.rows[0].id,
    skilldataUid: user_id.rows[0].id,
  };

  const response = await supertest(app)
    .delete('/api/talents/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(200);
  expect(response.body.success).toEqual(`Talent ${data.skilldataUid} removed.`);
});

test('DELETE /api/users/', async () => {
  const user_id = await pool.query('SELECT id FROM users WHERE username=$1', [
    'newtestUser',
  ]);
  await pool.query('DELETE FROM memberships WHERE user_id=$1', [
    user_id.rows[0].id,
  ]);
  await pool.query('DELETE FROM talents WHERE user_id=$1', [
    user_id.rows[0].id,
  ]);

  const data = {
    id: user_id.rows[0].id,
  };

  const response = await supertest(app)
    .delete('/api/users/')
    .set('Accept', 'application/json')
    .send(data);

  expect(response.status).toEqual(200);
  expect(response.body.success).toEqual(`User ${user_id.rows[0].id} deleted.`);
});

test('DELETE /api/projects/empty/', async () => {
  const response = await supertest(app)
    .delete('/api/projects/empty/')
    .set('Accept', 'application/json');

  expect(response.status).toEqual(200);
  expect(response.body.delete).toEqual('OK');
});
// OTHER
test('GET /api/invalid', async () => {
  const response = await supertest(app).get('/api/invalid');
  expect(response.status).toEqual(404);
  expect(response.text).toEqual('{"message":"Could not find this route."}');
});
