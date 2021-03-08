import express from "express";
import bodyParser from "body-parser";

// mysql
import mysql from "mysql";

// jwt
import jwt from "jsonwebtoken";
import passport from "passport";
import passportJWT from "passport-jwt";
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "Belajar Login JWT";

// sequelize
import sequelize from "sequelize";

// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

// port
const port = process.env.PORT || 3000;

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bank API",
      description: "Dokumentasi REST API Data Bank",
      version: "1.0.0",
      contact: {
        name: "Alifianto Narendra",
      },
      servers: ["http://localhost:3000"],
    },
  },
  apis: ["app.js"], // files containing annotations as above
};

const openapiSpecification = await swaggerJsDoc(options);
app.use("/bank", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// parse application/json
app.use(bodyParser.json());

// create database connection
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "valas",
});

//connect to database
conn.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected...");
});

//tampilkan semua data bank
/**
 * @openapi
 * /:
 *   get:
 *     description: Menampilkan Semua Data Bank
 *     responses:
 *       200:
 *         description: Berhasil Menampilkan Semua Data Bank
 */
app.get("/", (req, res) => {
  let sql = "SELECT * FROM tb_bank";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      error: null,
      response: results,
    });
  });
});

// Tambahkan data bank baru
/**
 * @openapi
 * /:
 *   post:
 *     description: Menambahkan Data Bank
 *     responses:
 *       200:
 *         description: Berhasil Menambahkan Semua Data Bank
 */

app.post("/", (req, res) => {
  let data = { nama: req.body.nama, url: req.body.url, logo: req.body.logo, status: req.body.status };
  let sql = "INSERT INTO tb_bank SET ?";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      error: null,
      response: results,
    });
  });
});

// Edit data bank berdasarkan id
/**
 * @openapi
 * /:
 *   put:
 *     description: Menambahkan Data Bank
 *     responses:
 *       200:
 *         description: Berhasil Menambahkan Semua Data Bank
 */

app.put("/bank/:id", (req, res) => {
  let sql = "UPDATE tb_bank SET nama='" + req.body.nama + "', url='" + req.body.url + "', logo='" + req.body.logo + "', status='" + req.body.status + "' WHERE id=" + req.params.id;
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      error: null,
      response: "Success",
    });
  });
});

//Delete data bank berdasarkan id
/**
 * @openapi
 * /:
 *   delete:
 *     description: Menambahkan Data Bank
 *     responses:
 *       200:
 *         description: Berhasil Menambahkan Semua Data Bank
 */

app.delete("/bank/:id", (req, res) => {
  let sql = "DELETE FROM tb_bank WHERE id=" + req.params.id + "";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: "Success" }));
  });
});

// app.get("/bankVerify", verifyToken, (req, res) => {
//   jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
//     if (err) {
//       res.sendStatus(403);
//     } else {
//       let sql = "SELECT * FROM tb_bank";
//       let query = conn.query(sql, (err, results) => {
//         if (err) throw err;
//         res.json({
//           status: 200,
//           error: null,
//           response: results,
//         });
//       });
//     }
//   });
// });

// function verifyToken(req, res, next) {
//   const bearerHeader = req.headers["authorization"];
//   if (typeof bearerHeader !== "undefined") {
//     const bearer = bearerHeader.split(" ");
//     const bearerToken = bearer[1];
//     req.token = bearerToken;
//     next();
//   } else {
//     res.json({
//       message: "Token Expired",
//     });
//   }
// }

//Server listening
app.listen(port, () => {
  console.log(`Server started on ${port}`);
});

// //tampilkan data bank berdasarkan id
// app.get('/bank/:id',(req, res) => {
//   let sql = "SELECT * FROM tb_bank WHERE id="+req.params.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
//   });
// });

// let strategy    = new JwtStrategy (jwtOptions, (jwt_payload, next) => {
//     let user    = getUser({
//         id: jwt_payload.id
//     })
//     if (user) {
//         next (null, user);
//     } else {
//         next (null, false);
//     }
// });

// passport.use (strategy);

// const getUser   = async obj => {
//     return await User.findOne({
//         where:obj
//     })
// }

// app.use(express.urlencoded ({
//     extended    : true
// }) );

// // db
// export const db        = new sequelize("nodelogin", "root", "", {
//     dialect : "mysql"
// });

// db.sync({});

// // User
// export const User  = db.define(
//     "user",
//     {
//         username    : {
//             type    : sequelize.STRING
//         },
//         password    : {
//             type    : sequelize.STRING
//         }
//     }
// );

// User.sync({});

// db.authenticate().then( () => console.log ('Database Terkoneksi') );

// app.get('/', (req, res) => res.send("Node bisa dibuka di REST api"));

// app.post('/login', async (req, res) => {
//     try {
//         const {
//             username, password
//         } = req.body

//         if (username && password) {
//             let user    = await getUser ({
//                 username: username
//             });
//             if (!user) {
//                 res.status(401).json({
//                     message: 'Username Salah Atau Anda Belum Terdaftar'
//                 });
//             }
//             if (user.password === password) {
//                 let payload = {
//                     id: user.id
//                 }
//                 let token   = jwt.sign(payload, jwtOptions.secretOrKey);
//                  res.json({
//                      message: "Berhasil Login",
//                      token  : token
//                  });
//             } else {
//                 res.status(401).json({
//                     message: 'Password Salah'
//                 })
//             }
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// app.get('/verify', verifyToken, (req, res) => {

//     jwt.verify(req.token, jwtOptions.secretOrKey, (err, authData) => {
//         if (err) {
//             res.sendStatus(403);
//         } else {
//             let sql = "SELECT * FROM tb_bank";
//             let query = conn.query(sql, (err, results) => {
//                 if(err) throw err;
//                  res.json({
//                      "status": 200,
//                      "error": null,
//                      "response": results
//                 });
//             });
//         }
//     });
// });

// app.post('/register', async (req, res) => {
//     try {
//         const {
//             username, password
//         } = req.body

//         const newUser   = new User ({
//             username, password
//         })

//         await newUser.save();
//          res.json(newUser);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });
