const dns = require('dns');
const mongoose = require('mongoose');

// On Windows or certain networks, Node.js c-ares DNS resolver can fail on SRV lookups (querySrv ECONNREFUSED).
// Setting public DNS resolvers ensures Atlas mongodb+srv URIs resolve reliably.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if unable to override DNS servers
}

const connectDB = async () => {
  let primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studypilot_ai';
  if (primaryUri.endsWith('/')) {
    primaryUri = `${primaryUri}studypilot_ai?retryWrites=true&w=majority`;
  }

  const localUri = 'mongodb://127.0.0.1:27017/studypilot_ai';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Primary connection failed: ${error.message}`);
    // If primary was remote Atlas and failed (e.g. IP whitelist / network drop), fallback to local MongoDB
    if (primaryUri !== localUri) {
      console.log('[Database] Resetting connection pool and attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/studypilot_ai)...');
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
