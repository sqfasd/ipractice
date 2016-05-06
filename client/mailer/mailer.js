var mailHost  = "localhost"
var mailUser  = "mailer"
var mailPass  = "123456"
var mailPort  = 25
var ignoreTLS = false

var mailTo    = "sqf1225@foxmail.com"
var mailFrom  = "Asch IO Test <test@qingfeng.com>"

var nodemailer = require("nodemailer")
var Transport = nodemailer.createTransport("SMTP", {
    host   : mailHost, port   : mailPort,
    debug  : true, ignoreTLS: ignoreTLS,
    auth   : {user: mailUser, pass: mailPass}
})
var mailOptions = {
    from: mailFrom,
    to: mailTo,
    subject: 'Please verify your acocunt',
    text: 'Click the following links to complete the register'
}
Transport.sendMail(mailOptions, function(err, response){
    console.log(response)
    console.log(err)
    Transport.close()
})
