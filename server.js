const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // for parsing JSON
app.use(bodyParser.urlencoded({ extended: true })); // for parsing form data

//Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ballzy",
  database: "userAuthDB",
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Signup Route 
app.post('/signup', async (req, res) => {
    const { username, password} = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and Password are required!');
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Username already exists!');
                }
                return res.status(500).send('Server error');
            }
            res.send('User registered successfully!');
        }

    );
});