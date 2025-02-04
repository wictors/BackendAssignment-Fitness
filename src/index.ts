import http from 'http';
import express from 'express';
import * as bodyParser from 'body-parser';

import { sequelize } from './db';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(publicRoutes());
app.use('/admin', adminRoutes());
app.use('/user', userRoutes());

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const httpServer = http.createServer(app);

sequelize.sync();

console.log('Sync database', 'postgresql://localhost:5432/fitness_app');

httpServer
  .listen(8000)
  .on('listening', () => console.log(`Server started at port ${8000}`));

export default httpServer;
