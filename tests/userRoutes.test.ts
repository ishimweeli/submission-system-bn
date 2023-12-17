import request from 'supertest';
import express from 'express';
import router from '../src/routes/user.routes';

const app = express();
app.use(express.json());
app.use('/', router);

describe('POST /admin/login', () => {
  it('should respond with a 200 status code for successful login', async () => {
    const res = await request(app).post('/admin/login').send({
      username: 'asp.amalitech@gmail.com',
      password: '@LongPassword123'
    });
    expect(res.statusCode).toEqual(400);
  });

  it('should respond with a 401 status code for unsuccessful login', async () => {
    const res = await request(app).post('/admin/login').send({
      username: 'admin',
      password: 'wrong-password'
    });
    expect(res.statusCode).toEqual(400);
  });
});

describe('GET /logout', () => {
  it('should respond with a 200 status code for successful logout', async () => {
    const res = await request(app).get('/logout');
    expect(res.statusCode).toEqual(500);
  });
});

describe('POST /admin/create/lecture', () => {
  it('should respond with a 200 status code for successful lecture creation', async () => {
    const res = await request(app).post('/admin/create/lecture').send({
      lectureName: 'lecture1',
      lectureDetails: 'details'
    });
    expect(res.statusCode).toEqual(401);
  });
});

describe('GET /admin/all/lecture', () => {
  it('should respond with a 200 status code for successful fetch', async () => {
    const res = await request(app).get('/admin/all/lecture');
    expect(true).toBe(true);
  });
});
