const mongoose = require('mongoose');
// Defining Post Model
const PostSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    image: {
        type: String
    },
    comments: {
        type: Array,
    },
    postUid: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export = mongoose.model('Posts', PostSchema);