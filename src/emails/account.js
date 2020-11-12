const sendgridMail = require('@sendgrid/mail');

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sendgridMail.send({
        to: email,
        from: 'prashantchanne121@gmail.com',
        subject: 'Thanks for joining',
        text: `Welcome to the app ${name}, Let me know how you get along with the app`,
        html: `<h1> Hello ${name} </h1> <h5> Welcome to the app ${name}, Let me know how you get along with the app </h1>`,
    });

}

const sendCancelEmail = (email, name) => {
    sendgridMail.send({
        to: email,
        from: 'prashantchanne121@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}, see you again`,
        html: `<h1> Goodbye ${name} </h1> <h5> See you again </h5>`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail,
}