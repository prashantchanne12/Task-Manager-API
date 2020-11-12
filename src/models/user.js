const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email');
            }
        },
    },

    age: {
        type: Number,
        default: 0,

        // Custom validation
        validate(value) {
            if (value < 0) {
                throw new Error('Invalid Age');
            }
        }
    },

    password: {
        type: String,
        required: true,

        validate(value) {
            if (value.length < 6) {
                throw new Error('Password must be greater than 6 chars')
            }

            if (value.includes('password')) {
                throw new Error('Password can\'t be password');
            }
        },

        trim: true,

    },

    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],

    avatar: {
        type: Buffer,
    }

}, {
    timestamps: true,
});

// we are going to set tasks which are created by user as a virtual property
// Virtual property is not actual data which is stored into the database, it's a relationship between entity
// User -> Task
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', // user's id
    foreignField: 'owner'
});

// Instance method -> Availabel on instance of model
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);


    user.tokens = user.tokens.concat({ token: token });
    await user.save();

    return token;
}

// userSchema.methods.getPublicProfile = function () {
//     const user = this;
//     const userObject = user.toObject();

//     delete userObject.password;
//     delete userObject.tokens;

//     return userObject;
// }

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// Static method -> Available on model
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email: email });

    if (!user) {
        throw new Error('Unable to Login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to Login');
    }

    return user;

}

// Hashed the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {

    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

// Defining Model
const User = mongoose.model('User', userSchema);

module.exports = User;