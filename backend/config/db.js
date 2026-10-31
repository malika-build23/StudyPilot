const dns = require('dns');
const mongoose = require('mongoose');

// On Windows or certain residential networks, Node.js c-ares DNS resolver can fail on SRV lookups (querySrv ECONNREFUSED).
// Only set custom DNS on Windows; Linux containers (Render, Railway, Docker) manage their own internal DNS.
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Ignore if unable to override DNS servers
  }
}

const connectDB = async () => {
  let primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studypilot_ai';
  if (primaryUri.endsWith('/')) {
    primaryUri = `${primaryUri}studypilot_ai?retryWrites=true&w=majority`;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const localUri = 'mongodb://127.0.0.1:27017/studypilot_ai';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`\n[Database Error] Failed to connect to MongoDB Atlas: ${error.message}`);
    console.error(`[Troubleshooting] If deploying to Render/Vercel/Railway:`);
    console.error(`1. Go to MongoDB Atlas (cloud.mongodb.com) -> Security -> Network Access.`);
    console.error(`2. Ensure IP Access List includes "0.0.0.0/0" (Allow Access from Anywhere).\n`);

    // In local development, attempt fallback to local MongoDB instance
    if (!isProduction && primaryUri !== localUri) {
      console.log('[Database] Development mode: Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/studypilot_ai)...');
      try {
        await mongoose.disconnect();
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[Database Fallback] Connected to local MongoDB: ${localConn.connection.host} (DB: ${localConn.connection.name})`);
        return localConn;
      } catch (localError) {
        console.error(`[Database Error] Local MongoDB connection also failed: ${localError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
