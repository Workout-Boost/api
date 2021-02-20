const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

UserSchema.pre('save', function (this:any, next: any) {
  if (this.isNew || this.isModified('password')) {
    const document = this;
    bcrypt.hash(this.password, saltRounds, function(err: any | unknown, hashedPassword: any) {
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

UserSchema.methods.isCorrectPassword = function(password: any, callback: any) {
  bcrypt.compare(password, this.password, function(err: any, same: any) {
    if (err) {
      callback(err);
    } else {
      callback(err, same);
    }
  });
}

export = mongoose.model('User', UserSchema);