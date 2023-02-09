// Import essential libraries 
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const homeDir = __dirname + '/public/';
const sgMail = require('@sendgrid/mail');
const { getMaxListeners } = require('process');
require('dotenv').config()
console.log(process.env)

// routes
router.get('/', function (req, res) {
    res.sendFile(path.join(homeDir +  'index.htm'));
});
// mail
//const apiKey = "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";
const apiKey = "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";
sgMail.setApiKey(apiKey);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//add the router 
app.use('/', router);
app.listen(process.env.port || 3000);
app.use(express.static(path.join(__dirname, 'public')));

console.log('!Running at Port 3000'); 

console.log("hehhehehe");

app.post('/',function(req,res){
    var name = req.body.full-name;
    var email = req.body.email;
    var comments = req.body.comments;

    const msg = {
        to: "cbronson@gmail.com", 
        from: "no-reply@charlesschmidt.org", 
        subject: "Email from charlesschmidt.org",
        text: `Message from ${name}:\n${email}:\n${comments}`,
    }

    try {
        sgMail.send(msg);
        console.log("sent!");
      } catch (error) {
        res.send("Message Could not be Sent");
        console.log("error sending");
      }

    res.status(200);
    res.redirect('/#contact?success=true');
    //res.end();
 });   