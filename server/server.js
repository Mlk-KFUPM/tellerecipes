require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db');

const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const chefRouter = require('./routes/chef.route');
const adminRouter = require('./routes/admin.route');

const app = express();

const parseOrigins = (value) => {
  if (!value) return ['*'];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
};

app.use(
  cors({
    origin: parseOrigins(process.env.CORS_ORIGIN || process.env.CORS_ORIGINS),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chef', chefRouter);
app.use('/api/admin', adminRouter);

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
