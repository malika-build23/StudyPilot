const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Semester description cannot exceed 50 characters'],
    },
    branch: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Branch description cannot exceed 100 characters'],
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Return user object without sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    semester: this.semester || '',
    branch: this.branch || '',
    googleId: this.googleId || null,
    avatar: this.avatar || '',
    isGoogleUser: Boolean(this.googleId),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
