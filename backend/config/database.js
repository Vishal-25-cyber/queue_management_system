const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'Not set'}`);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    return conn;
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n📋 Solutions:');
      console.error('   1. Start MongoDB locally: mongod');
      console.error('   2. Or use MongoDB Atlas (cloud)');
      console.error('   3. Update MONGODB_URI in .env file');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('\n📋 Solution:');
      console.error('   Check username/password in MONGODB_URI');
    }

    console.error('\n💡 Reference .env file for correct MONGODB_URI format');
    console.error('   Local: mongodb://localhost:27017/queue-management');
    console.error('   Atlas: mongodb+srv://username:password@cluster.mongodb.net/queue-management');
    
    process.exit(1);
  }
};

module.exports = connectDB;
