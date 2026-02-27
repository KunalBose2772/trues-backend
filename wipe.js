const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected. Wiping all data...');
        try {
            await mongoose.connection.db.dropDatabase();
            console.log('Database successfully wiped! You now have a 100% clean slate.');
            process.exit(0);
        } catch (err) {
            console.error('Error wiping database:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.log('MongoDB Connection Error: ', err);
        process.exit(1);
    });
