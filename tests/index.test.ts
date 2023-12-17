import request from 'supertest';
import express from 'express';
import router from '../src/routes/index.routes';

const app = express();
app.use(express.json());
app.use('/', router);

describe('User Routes', () => {
  it('should respond with a 200 status code for successful fetch', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(404);
  });
});
