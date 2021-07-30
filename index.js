const express = require('express')
const bodyParser = require('body-parser');

//FireBase
var admin = require("firebase-admin");
var serviceAccount = require("./urlshortner-8edae-firebase-adminsdk-baciw-6ff97165db.json");
const { response } = require('express');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const static = express.static("public");

//MiddleWares
app.use(static);
app.use(bodyParser.json());

app.get('/', (req, res) =>{
    res.send("Hello World");
})

const shortner =  admin.firestore().collection("shortner");
const usersdb =  admin.firestore().collection("usersdb");

app.get('/:short', (req, res) => {
    //console.log(req.params);
    const short = req.params.short;
    //const number = req.params.number;
    const doc = shortner.doc(short);
    
    // console.log(doc)
    doc.get().then(response => {
        const data = response.data();
        // console.log(data)
        // if(number && data && data.url)
        //     res.redirect(301, data.url + number);
        if(data && data.url)
            res.redirect(301, data.url);
        else 
            res.redirect(301, "https://google.com");
    })
})

app.get('/whatsapp/:number', (req, res) => {
    const url = 'https://api.whatsapp.com/send?phone=+91'
    res.redirect(301, url + req.params.number);
    // //console.log(req.params);
    // const short = req.params.short;
    // //const number = req.params.number;
    // const doc = shortner.doc(short);
    
    // // console.log(doc)
    // doc.get().then(response => {
    //     const data = response.data();
    //     // console.log(data)
    //     // if(number && data && data.url)
    //     //     res.redirect(301, data.url + number);
    //     if(data && data.url)
    //         res.redirect(301, data.url);
    //     else 
    //         res.redirect(301, "https://google.com");
    // })
})

app.post('/post', (req, res) => {
    const {email, password, short, url} = req.body;
    usersdb.doc(email).get().then(response => {
        const user = response.data();
        if(user && user.email == email && user.password == password) {
            const doc = shortner.doc(short);
            doc.set({url});
            res.send("Done");
        } else {
            res.status(403).send("Forbiden")
        }
    })

})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is Running on port: ${port}`);
})