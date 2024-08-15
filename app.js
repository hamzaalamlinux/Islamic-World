const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require("cors");

require('dotenv').config();

const app = express();
const corsOptions = {
    origin: 'https://islamic-world-1.onrender.com', // Allow only this domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies
};

app.use(cors(corsOptions));
connectDB();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', require('./route/userRoutes'));
app.use('/api/admin', require('./route/adminRoute'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
