const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path'); 

const app = express();
app.use(bodyParser.json()); // for parsing JSON
app.use(bodyParser.urlencoded({ extended: true })); // for parsing form data
app.use(express.static('public'));

//Database connection
const db = new sqlite3.Database('./userAuthDB.sqlite');

// Create users table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)');

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Auth System!'); // Simple response for the root URL
});

// Signup Route 
app.post('/signup', async (req, res) => {
    console.log('Signup route hit'); // Debugging log
    console.log('Request body:', req.body); // Debugging log

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and Password are required!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).send('Username already exists!');
                }
                return res.status(500).send('Server error');
            }
            res.send('User registered successfully!');
        }
    );
});

//Signin Route
app.post('/signin', (req, res) => {
    console.log('Signin route hit'); // Debugging log
    console.log('Request body:', req.body); // Debugging log

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and Password are required!');
    }

    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, user) => {
            if (err) {
                console.error('Database error:', err); // Debugging log
                return res.status(500).send('Server error');
            }
            if (!user) {
                return res.status(400).send('User not found');
            }

            // Compare password with hashed password in database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send('Invalid credentials');
            }

            res.send('Login successful!');
        }
    );
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Start sever 
app.listen(4500, () => {
    console.log('Server running on port 4500');
    console.log('Visit: http://localhost:4500'); // Updated port
});