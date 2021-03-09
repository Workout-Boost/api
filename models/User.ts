const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;
// Defining User Model and bcrpyting information
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, required: true },
  avatar: { type: String},
  saved: { type: Array },
  savedByOthers: { type: Number },
  shared: { type: Number },
  isVerified: { type: Boolean},
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

UserSchema.pre('save', function (this: any, next: any) {
  if (this.isNew || this.isModified('password')) {
    const document = this;
    bcrypt.hash(this.password, saltRounds, function(err: any, hashedPassword: string) {
      if (err) {
        next(err);
      } else {
        document.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});

UserSchema.methods.isCorrectPassword = function(password: string, callback: any) {
  bcrypt.compare(password, this.password, function(err: any, same: any) {
    if (err) {
      callback(err);
    } else {
      callback(err, same);
    }
  });
}

export = mongoose.model('User', UserSchema);