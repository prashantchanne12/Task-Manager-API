const express = require('express');
require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;


// Site under maintenance
// app.use((req, res, next) => {

//     res.status(503).send({ error: 'Site is under maintenance' });
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});

// const jwt = require('jsonwebtoken');

// const foo = async () => {

//     // returns authentication token
//     const token = jwt.sign({ _id: '1234' }, 'helloworld', {
//         expiresIn: '7 second'
//     });
//     console.log(token);

//     const data = jwt.verify(token, 'helloworld');
//     console.log(data);
// }

// foo();

// JWT Token
// BASE64
// HEADER.PAYLOAD.SIGNATURE

const multer = require('multer');
const upload = multer({
    // destination folder
    dest: 'images',
});

// upload.single('upload')
// middlerware 
// upload : name of the form key
app.post('/upload', upload.single('upload'), (req, res, next) => {

    res.send();
});