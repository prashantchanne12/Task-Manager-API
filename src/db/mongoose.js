const mongoose = require('mongoose');

const connectionUrl = process.env.MONGODB_SERVER;

// mongoose uses the mongodb modules behind the scenes
mongoose.connect(connectionUrl,
    {
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true
    });

