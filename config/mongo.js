const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = async () => {
    try {
        const dbUri = process.env.DB_URI;
        if (!dbUri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Successfully connected to MongoDB');

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            } catch (error) {
                console.error('Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        throw error; // Re-throw to be handled by the caller
    }
};

module.exports = connectDatabase;