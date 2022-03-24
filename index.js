const exp = require('express');
const app = exp();
const bp = require('body-parser');
const https = require('https');
const ejs = require('ejs');
const underscore = require('underscore');
const axios = require('axios').default;

//Express configuration 
app.use(bp.urlencoded({ extended: true }));
app.use(exp.static('public'));
app.set('view engine', 'ejs');
app.listen(process.env.PORT || 3000, () => {
    console.log('server is live!')
})

//Firebase configuration 
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { PassThrough } = require('stream');
const { title } = require('process');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
let blogsRef = db.collection('Blogs');


//Home Route 
app.get('/', function (req, res) {
    res.render('home');
})

//Blog Route 
app.get('/blog', function (req, res) {
    var posts = [];
    var eachPost = [];
    blogsRef.get().then((qureySnapshot) => {
        qureySnapshot.forEach(document => {
            eachPost = [];
            eachPost.push(document.data().title);
            eachPost.push(document.data().description);
            eachPost.push(document.data().name); 
            posts.push(eachPost);
        })
        res.render('blog', {
            posts: posts
        });
    })

})

//Blog Post Route 
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
app.get('/blogpost/:title', (req, res) => {
    const title = req.params.title;
    const rndInt = randomIntFromInterval(1, 6)
    blogsRef.get().then((qureySnapshot) => {
        qureySnapshot.forEach(document => {
            if(title === document.data().title){
                res.render('blogpost', {
                    title: title,
                    description: document.data().description,
                    author: document.data().name,
                    posting: document.data().posting,
                    int: rndInt
                });
            } else{
                //pass
            }
        })
    })
})

//Authors Route
app.get('/authors', function (req, res) {
    var allAuthors = [];
    blogsRef.get().then((qureySnapshot) => {
        qureySnapshot.forEach(document => {
            allAuthors.push(document.data().name);
        })
        var authors = underscore.uniq(allAuthors); 
        res.render('authors', {
            authors:authors
        });
    })

})

//Add Post Route 
app.get('/addpost', function (req, res) {
    res.render('addPost');
})
app.post('/addpost', function (req, res) {
    const submission = {
        title: req.body.title,
        description: req.body.description,
        name: req.body.posterName,
        posting: req.body.posting
    };
    console.log
    db.collection('Blogs').doc().set(submission);
    res.render('success');
})



