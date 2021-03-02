const express               = require('express');
const bodyParser            = require('body-parser');
const app                   = express();
const mysql                 = require('mysql');
const jwt                   = require('jsonwebtoken');

const passport              = require ('passport');
const passportJWT           = require ('passport-jwt');

let ExtractJwt              = passportJWT.ExtractJwt;
let JwtStrategy             = passportJWT.Strategy;

let jwtOptions              = {};
jwtOptions.jwtFromRequest   = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey      = "Belajar Login JWT";

const swaggerJsDoc          = require ('swagger-jsdoc');
const swaggerUi             = require ('swagger-ui-express');

const port                  = process.env.PORT || 3000
 


// parse application/json
app.use(bodyParser.json());
 
//create database connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'valas'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//tampilkan semua data bank
app.get('/bankVerify', verifyToken, (req, res) => {
    jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
        if (err) {
            res.sendStatus(403);
        } else {
            let sql = "SELECT * FROM tb_bank";
            let query = conn.query(sql, (err, results) => {
                if(err) throw err;
                 res.json({
                     "status": 200, 
                     "error": null, 
                     "response": results
                });
            });
        }
    });
});
 
//tampilkan data bank berdasarkan id
app.get('/bank/:id',(req, res) => {
  let sql = "SELECT * FROM tb_bank WHERE id="+req.params.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
//Tambahkan data bank baru
app.post('/bank',(req, res) => {
  let data = {nama: req.body.nama, url: req.body.url, logo: req.body.logo, status: req.body.status};
  let sql = "INSERT INTO tb_bank SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": "Success"}));
  });
});
 
//Edit data bank berdasarkan id
app.put('/bank/:id',(req, res) => {
  let sql = "UPDATE tb_bank SET nama='"+req.body.nama+"', url='"+req.body.url+"', logo='"+req.body.logo+"', status='"+req.body.status+"' WHERE id="+req.params.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": "Success"}));
  });
});
 
//Delete data bank berdasarkan id
app.delete('/bank/:id',(req, res) => {
  let sql = "DELETE FROM tb_bank WHERE id="+req.params.id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.send(JSON.stringify({"status": 200, "error": null, "response": "Success"}));
  });
});

let strategy    = new JwtStrategy (jwtOptions, (jwt_payload, next) => {
    let user    = getUser({
        id: jwt_payload.id
    })
    if (user) {
        next (null, user);
    } else {
        next (null, false);
    }
});

passport.use (strategy);

const getUser   = async obj => {
    return await User.findOne({
        where:obj
    })
}

app.use(express.urlencoded ({
    extended    : true
}) );

const db        = require('./config/db');
const User      = require('./models/User');

db.authenticate().then( () => console.log ('Database Terkoneksi') );

app.get('/', (req, res) => res.send("Node bisa dibuka di REST api"));

app.post('/login', async (req, res) => {
    try {
        const {
            username, password
        } = req.body

        if (username && password) {
            let user    = await getUser ({
                username: username
            });
            if (!user) {
                res.status(401).json({
                    message: 'Username Salah Atau Anda Belum Terdaftar'
                });
            }
            if (user.password === password) {
                let payload = {
                    id: user.id
                }
                let token   = jwt.sign(payload, jwtOptions.secretOrKey);
                 res.json({
                     message: "Berhasil Login",
                     token  : token
                 });
            } else {
                res.status(401).json({
                    message: 'Password Salah'
                })
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



app.get('/verify', verifyToken, (req, res) => {
    
    jwt.verify(req.token, jwtOptions.secretOrKey, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            let sql = "SELECT * FROM tb_bank";
            let query = conn.query(sql, (err, results) => {
                if(err) throw err;
                 res.json({
                     "status": 200, 
                     "error": null, 
                     "response": results
                });
            });
        }
    });
});

function verifyToken(req, res, next) {
    const bearerHeader  = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer    = bearerHeader.split(' ');
        const bearerToken   = bearer[1];
        req.token   = bearerToken;
        next();
    } else {
         res.json({
            message : 'Token Expired'
         });
    }
}

app.post('/register', async (req, res) => {
    try {
        const {
            username, password
        } = req.body

        const newUser   = new User ({
            username, password
        })

        await newUser.save();
         res.json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
 
//Server listening
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});

// app.use(function(req, res, next) {
//     var token = req.headers['authorization'];

//     if (token) {
//         jwt.verify(token, app.get(jwtOptions.secretOrKey), function(err, decoded) {
//             if (err) {
//                 return  res.json({
//                     success : false,
//                     message : 'Problem dengan TOken'
//                 });
//             } else {
//                 req.decoded = decoded;
//                 next();
//             }
//         });
//     } else {
//         return res.status(403).send({
//             success : false,
//             message : 'Token Expired'
//         });
//     }
// });

// app.get('/protected', passport.authenticate("jwt", {session: false}), (req, res) => {
//     let sql = "SELECT * FROM tb_bank";
//     let query = conn.query(sql, (err, results) => {
//         if(err) throw err;
//         res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
//     });
    // try {
    //     res.send("Selamat Anda Telah Bisa Mengakses Router ini");
    // } catch (err) {
    //     console.error(err.message);
    //     res.status(500).send('Server Error');
    // }
// });