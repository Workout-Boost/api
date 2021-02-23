const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, required: true },
  saved: { type: Array },
  shared: { type: Number },
  theme: { type: String },
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