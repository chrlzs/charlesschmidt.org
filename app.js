// Import essential libraries 
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const homeDir = __dirname + '/public/';
const sgMail = require('@sendgrid/mail');
const { getMaxListeners } = require('process');
require('dotenv').config()

// routes
router.get('/', function (req, res) {
    res.sendFile(path.join(homeDir +  'index.htm'));
});
// mail
const apiKey = process.env.SENDGRID_API_KEY;sgMail.setApiKey("redacted");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//add the router 
app.use('/', router);
app.listen(process.env.port || 3000);
app.use(express.static(path.join(__dirname, 'public')));

console.log('Running at Port 3000'); 

app.post('/',function(req,res){
    var fullname = req.body.fullname;
    var email = req.body.email;
    var comments = req.body.comments;

    const msg = {
        to: "me@charlesschmidt.org", 
        from: "no-reply@charlesschmidt.org", 
        subject: "Email from charlesschmidt.org",
        text: `Message from ${fullname}:\n${email}:\n${comments}`,
    }

    try {
      if (comments) {        
        sgMail.send(msg);
        console.log("sent!!!! ");
      }

    } catch (error) {
        res.send("Message Could not be Sent");
        console.log("error sending");
    }

    res.status(200);
    res.redirect('/#contact?success=true');
    //res.end();
 });   