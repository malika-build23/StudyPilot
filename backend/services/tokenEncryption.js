
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = () => {
  const key = process.env.DRIVE_TOKEN_ENCRYPTION_KEY;

  if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      'DRIVE_TOKEN_ENCRYPTION_KEY must be a valid 64-character hexadecimal key.'
    );
  }

  return Buffer.from(key, 'hex');
};

const encrypt = (plainText) => {
  if (!plainText) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(':');
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format.');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
