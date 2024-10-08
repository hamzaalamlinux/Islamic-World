const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require("cors");

require('dotenv').config();

const app = express();
const corsOptions = {
    origin: '*', // Allow only this domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: true, // Allow cookies
};

app.use(cors(corsOptions));
connectDB();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', require('./route/userRoutes'));
app.use('/api/admin', require('./route/adminRoute'));
app.use('/api/web', require('./route/webRoute'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
