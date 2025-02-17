require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const dbConnect = require('../config/mongodb.config');
const pokemonRoutes = require('./routes/pokemon.routes');
const { seedDatabase } = require('../scripts/database.seed');
const Pokemon = require('./models/pokemon.model');
const errorHandler = require('./middleware/error.middleware');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance middleware
app.use(compression());

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/pokemon', pokemonRoutes);

// Error handling
app.use(errorHandler);

/**
 * Initialize database and start server
 */
const initializeDatabase = async () => {
  try {
    await dbConnect();
    const countDocuments = await Pokemon.countDocuments();
    if (countDocuments === 0) {
      await seedDatabase();
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('Running in test mode - database will be handled by test helper');
    return;
  }

  try {
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      process.exit(1);
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
