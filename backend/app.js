const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.set("trust proxy", 1);

// routes
const inhalersRoutes = require('./src/routes/inhalersRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// middleware
const authMiddleware = require('./src/middleware/authMiddleware');
const { limiterBasic, limiterAdminLogin } = require('./src/middleware/rateLimitMiddleware');
const errorMiddleware = require('./src/middleware/errorMiddleware.js');

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, '../frontend')));

//Routes
app.use('/api/inhalers', limiterBasic, inhalersRoutes);
app.use('/api/admin/login', limiterAdminLogin, authRoutes);
app.use('/api/admin', limiterBasic, authMiddleware, adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, './data/uploads')));
app.use('/guides', express.static(path.join(__dirname, './data/guides'), {
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));

// redirect requests to unused routes to index
app.all('/*splat', (req, res) => {res.redirect('/')});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
