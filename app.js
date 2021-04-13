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
      swagger: "2.0",
      info: {
         title: "Bank API",
         description: "Dokumentasi REST API Data Bank",
         version: "1.0.0",
         contact: {
            name: "Alifianto Narendra",
         },
         servers: ["http://localhost:3000"],
      },
      schemes: ["http", "https"],
      securityDefinitions: {
         auth: {
            type: "apiKey",
            name: "Authorization",
            scheme: "bearer",
            in: "header",
            bearerFormat: "JWT",
         },
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

const connect = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "nodelogin",
});

//connect to database
conn.connect((err) => {
   if (err) throw err;
   console.log("Mysql1 Connected...");
});

connect.connect((err) => {
   if (err) throw err;
   console.log("Mysql2 Connected...");
});

let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
   let user = getUser({
      id: jwt_payload.id,
   });
   if (user) {
      next(null, user);
   } else {
      next(null, false);
   }
});

passport.use(strategy);

const getUser = async (obj) => {
   return await User.findOne({
      where: obj,
   });
};

app.use(
   express.urlencoded({
      extended: true,
   })
);

// db
export const db = new sequelize("nodelogin", "root", "", {
   dialect: "mysql",
});

db.sync({});

// User
export const User = db.define("user", {
   username: {
      type: sequelize.STRING,
   },
   password: {
      type: sequelize.STRING,
   },
});

User.sync({});

db.authenticate().then(() => console.log("Database Terkoneksi"));

// app.get("/", (req, res) => res.send("Node bisa dibuka di REST api"));

// login
/**
 * @swagger
 * /login:
 *    get:
 *       tags:
 *          - User
 *       summary: Login User
 *       description: Login Untuk mendapatkan token
 *       parameters:
 *        - name: username
 *          description: masukkan username
 *          in: query
 *          type: string
 *          required: true
 *        - name: password
 *          description: masukkan password
 *          in: query
 *          type: string
 *          required: true
 *       responses:
 *          '200':
 *             description: Berhasil Menambahkan Semua Data Bank
 */

app.get("/login", async (req, res) => {
   try {
      const { username, password } = req.query;

      if (username && password) {
         let user = await getUser({
            username: username,
         });
         if (!user) {
            res.status(401).json({
               message: "Username Salah Atau Anda Belum Terdaftar",
            });
         }
         if (user.password === password) {
            let payload = {
               id: user.id,
            };
            let token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({
               message: "Berhasil Login",
               token: token,
            });
         } else {
            res.status(401).json({
               message: "Password Salah",
            });
         }
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// register
/**
 * @swagger
 * /register:
 *    post:
 *       tags:
 *          - User
 *       summary: Register User
 *       description: Register User
 *       parameters:
 *        - name: username
 *          description: masukkan username
 *          in: query
 *          type: string
 *          required: true
 *        - name: password
 *          description: masukkan password
 *          in: query
 *          type: string
 *          required: true
 *       responses:
 *          '200':
 *             description: Berhasil Register
 */

app.post("/register", express.json(), (req, res) => {
   let data = { username: req.query.username, password: req.query.password };
   let sql = "INSERT INTO users SET ?";
   let register = connect.query(sql, data, (err, results) => {
      if (err) throw err;
      res.json({
         status: 200,
         error: null,
         response: "Success",
      });
   });
});

//tampilkan semua data bank
/**
 * @swagger
 * /:
 *   get:
 *     security:
 *       - auth: []
 *     tags:
 *       - Bank
 *     summary: Menampilkan semua Data Bank
 *     description: Menampilkan Semua Data Bank
 *     consumes:
 *        - application/json
 *        - application/xml
 *     responses:
 *       '200':
 *         description: Berhasil Menampilkan Semua Data Bank
 */

app.get("/", verifyToken, (req, res) => {
   jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
      if (err) {
         res.sendStatus(403);
      } else {
         let sql = "SELECT * FROM tb_bank";
         let query = conn.query(sql, (err, results) => {
            if (err) throw err;
            res.json({
               status: 200,
               error: null,
               response: results,
            });
         });
      }
   });
});

//tampilkan data bank berdasarkan id
/**
 * @swagger
 * /{id}:
 *   get:
 *     security:
 *       - auth: []
 *     tags:
 *       - Bank
 *     summary: Menampilkan Data Bank berdasarkan ID
 *     description: Menampilkan Data Bank berdasarkan ID
 *     consumes:
 *        - application/json
 *        - application/xml
 *     parameters:
 *        - name: id
 *          description: masukkan ID untuk menampilkan data berdasarkan ID
 *          in: path
 *          type: integer
 *          required: true
 *     responses:
 *       '200':
 *         description: Berhasil Menampilkan Data Bank berdasarkan id
 */

app.get("/:id", verifyToken, express.json(), (req, res) => {
   jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
      if (err) {
         res.sendStatus(403);
      } else {
         let sql = "SELECT * FROM tb_bank WHERE id=" + req.params.id;
         let query = conn.query(sql, (err, results) => {
            if (err) throw err;
            res.json({
               status: 200,
               error: null,
               response: results,
            });
         });
      }
   });
});

app.get("/:id", (req, res) => {
   let sql = "SELECT * FROM tb_bank WHERE id=" + req.params.id;
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
 * @swagger
 * /:
 *    post:
 *       security:
 *          - auth: []
 *       tags:
 *          - Bank
 *       summary: Tambah Data Bank
 *       description: Tambah Data Bank
 *       parameters:
 *        - name: body
 *          description: Tambah Data Bank
 *          in: body
 *          required: true
 *          schema:
 *             properties:
 *                nama:
 *                   type: string
 *                url:
 *                   type: string
 *                logo:
 *                   type: string
 *                status:
 *                   type: string
 *       responses:
 *          '200':
 *             description: Berhasil Menambahkan Data Bank
 */

app.post("/", verifyToken, express.json(), (req, res) => {
   jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
      if (err) {
         res.sendStatus(403);
      } else {
         let data = { nama: req.body.nama, url: req.body.url, logo: req.body.logo, status: req.body.status };
         let sql = "INSERT INTO tb_bank SET ?";
         let query = conn.query(sql, data, (err, results) => {
            if (err) throw err;
            res.json({
               status: 200,
               error: null,
               response: "Success",
            });
         });
      }
   });
});

// Edit data bank berdasarkan id
/**
 * @swagger
 * /{id}:
 *    put:
 *       security:
 *          - auth: []
 *       tags:
 *          - Bank
 *       summary: Edit Data Bank
 *       description: Tambah Data Bank
 *       parameters:
 *        - name: id
 *          description: masukkan id untuk edit data
 *          in: path
 *          type: integer
 *          required: true
 *        - name: body
 *          description: Tambah Data Bank
 *          in: body
 *          required: true
 *          schema:
 *             properties:
 *                nama:
 *                   type: string
 *                url:
 *                   type: string
 *                logo:
 *                   type: string
 *                status:
 *                   type: string
 *       responses:
 *          '200':
 *             description: Berhasil edit Data Bank berdasarkan id
 */

app.put("/:id", verifyToken, express.json(), (req, res) => {
   jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
      if (err) {
         res.sendStatus(403);
      } else {
         let sql = "UPDATE tb_bank SET nama='" + req.body.nama + "', url='" + req.body.url + "', logo='" + req.body.logo + "', status='" + req.body.status + "' WHERE id=" + req.params.id;
         let query = conn.query(sql, (err, results) => {
            if (err) throw err;
            res.json({
               status: 200,
               error: null,
               response: "Success",
            });
         });
      }
   });
});

//Delete data bank berdasarkan id
/**
 * @swagger
 * /{id}:
 *   delete:
 *       security:
 *          - auth: []
 *       tags:
 *         - Bank
 *       summary: Hapus Data Bank
 *       description: Menghapus Data Bank
 *       parameters:
 *          - name: id
 *            description: masukkan id untuk menghapus data
 *            in: path
 *            type: integer
 *            required: true
 *       responses:
 *          '200':
 *             description: Berhasil Menghapus Data Bank berdasarkan id
 */

app.delete("/:id", verifyToken, express.json(), (req, res) => {
   jwt.verify(req.token, jwtOptions.secretOrKey, (err) => {
      if (err) {
         res.sendStatus(403);
      } else {
         let sql = "DELETE FROM tb_bank WHERE id=" + req.params.id + "";
         let query = conn.query(sql, (err, results) => {
            if (err) throw err;
            res.json({
               status: 200,
               error: null,
               response: "Success",
            });
         });
      }
   });
});

function verifyToken(req, res, next) {
   const bearerHeader = req.headers["authorization"];
   if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
   } else {
      res.json({
         message: "Token Expired",
      });
   }
}

//Server listening
app.listen(port, () => {
   console.log(`Server started on ${port}`);
});
