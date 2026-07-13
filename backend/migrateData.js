const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/queue-management';
const ATLAS_URI = 'mongodb+srv://hospitalqueue:hospital@portfolio.mo5wnyq.mongodb.net/queue-management?retryWrites=true&w=majority&appName=portfolio';

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const Token = require('./models/Token');
const Notification = require('./models/Notification');
const ActivityLog = require('./models/ActivityLog');

const models = [User, Doctor, Department, Appointment, Token, Notification, ActivityLog];

async function migrate() {
    try {
        console.log('Connecting to local database...');
        const localDb = await mongoose.createConnection(LOCAL_URI).asPromise();
        
        console.log('Connecting to Atlas database...');
        const atlasDb = await mongoose.createConnection(ATLAS_URI).asPromise();

        // For each model, fetch from local and insert to atlas
        for (const Model of models) {
            const modelName = Model.modelName;
            console.log(`\nMigrating ${modelName}...`);
            
            const LocalModel = localDb.model(modelName, Model.schema);
            const AtlasModel = atlasDb.model(modelName, Model.schema);

            // Fetch all documents from local
            let query = LocalModel.find({});
            if (modelName === 'User') {
                query = query.select('+password');
            }
            const docs = await query.lean();
            console.log(`Found ${docs.length} documents in local ${modelName}.`);

            if (docs.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicate keys during migration
                await AtlasModel.deleteMany({});
                
                // Insert into Atlas using native driver to bypass validation/hooks
                await AtlasModel.collection.insertMany(docs);
                console.log(`Successfully inserted ${docs.length} documents into Atlas ${modelName}.`);
            }
        }

        console.log('\nMigration completed successfully!');
        await localDb.close();
        await atlasDb.close();
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
