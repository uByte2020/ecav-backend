const nodemailer = require('nodemailer');
const pug        = require('pug');
const htmlToText = require('html-to-text')
const sgMail     = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

module.exports = class Email{
    constructor(user, url) {
        this.to         = user.email;
        this.firstName  = user.name.split(' ')[0];
        this.url        = url;
        this.from       = process.env.EMAIL_FROM
    }

    newTransport(){
 
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async send(template, subject){

        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName:  this.firstName,
            url:        this.url,
            subject:    this.subject
        });

        // 2) Define the email options
        const mailOptions = {
            from:       this.from,
            to:         this.to,
            subject:    subject,
            html:       html,
            text:       htmlToText.fromString(html),
        }
        try{
            await this.newTransport().sendMail(
                mailOptions
            );
        }catch(error){
            console.log(error)
        }
    }

    async sendWelcome(){
        await this.send('welcome', 'Bem Vindo à Escola de Condução Armando Víctor (ECAV)');
    }
    
    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (Valid for 24h)');
    }
}

