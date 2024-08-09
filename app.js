const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', require('./route/userRoutes'));
app.use('/api/admin', require('./route/adminRoute'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
