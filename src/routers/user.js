const express = require('express');
const userRouter = express.Router();
const multer = require('multer');
const sharp = require('sharp');

const auth = require('../middleware/auth');
const User = require('../models/user');

const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account');

userRouter.post('/users', async (req, res, next) => {

    const user = new User(req.body);

    try {

        // 200 - ok
        // 201 - created
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });

    } catch (err) {
        res.status(400).send(err);

    }

});

userRouter.post('/users/login', async (req, res, next) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token });

    } catch (err) {
        res.status(400).send(err);
    }
});

userRouter.post('/users/logout', auth, async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.send('Logged out');

    } catch (err) {
        res.status(500).send(err);
    }
});


userRouter.post('/users/logoutAll', auth, async (req, res, next) => {

    try {

        req.user.tokens = [];

        await req.user.save();

        res.send('Logged out from all devices');

    } catch (err) {
        res.status(500).send(err);
    }

});

// When someone makes GET request to /users it will first go through the auth middleware and then it will run our route handler
userRouter.get('/users/me', auth, async (req, res, next) => {
    try {
        res.send(req.user);
    } catch (err) {
        res.status(404).send(err);
    }
});

// userRouter.get('/users/:id', async (req, res, next) => {
//     const id = req.params.id;

//     try {
//         const user = await User.findById(id);

//         if (!user) {
//             return res.status(404).send();
//         }

//         res.send(user);

//     } catch (err) {
//         res.status(500).send(err);
//     }
// });

// .patch http method is designed for updating an existing resource
userRouter.patch('/users/me', auth, async (req, res, next) => {

    const updates = Object.keys(req.body);
    const allowedUpdate = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdate.includes(update));

    // const id = req.params.id;

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Operation' });
    }

    try {

        // const user = await User.findById(id);

        updates.forEach(update => {
            req.user[update] = req.body[update];
        });

        await req.user.save();

        res.send(req.user);


        // The following method bypasses mongoose middleware call that's why we use above traditional method of updating

        // const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        // new : true => This means return the new user which is updated

        // if (!user) {
        //     return res.status(404).send();
        // }


    } catch (err) {
        res.status(400).send(err);
    }

});



userRouter.delete('/users/me', auth, async (req, res, next) => {

    // const id = req.user._id;

    try {
        // const user = await User.findByIdAndDelete(id);

        // if (!user) {
        //     return res.status(404).send();
        // }

        sendCancelEmail(req.user.email, req.user.name);
        await req.user.remove();
        res.send(req.user);

    } catch (err) {
        res.status(500).send(err);
    }

});

const upload = multer({
    // dest: 'avatar',
    limits: {
        // restricting file size 
        fileSize: 1000000,
    },
    fileFilter(req, file, callback) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Invalid file type'));
        }

        callback(undefined, true);

        // callback(new Error('Please upload an Image'));
        // callback(undefined, true);
        // c allback(undefined, false);
    }
});



userRouter.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res, next) => {

    const buffer = await sharp(req.file.buffer)
        .resize({
            width: 250,
            height: 250
        })
        .png()
        .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.send();

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

userRouter.delete('/users/me/avatar', auth, async (req, res, next) => {
    try {

        req.user.avatar = undefined;
        await req.user.save();
        res.send(req.user);

    } catch (err) {
        res.status(500).send(err);
    }
});

userRouter.get('/users/:id/avatar', async (req, res, next) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);

    } catch (err) {
        res.status(404).send(err);
    }
});

module.exports = userRouter;
