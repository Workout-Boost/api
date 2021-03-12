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
  following: { type: Array},
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
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(saltRounds, function(err: any, salt: any) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err: any, hash: any) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
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