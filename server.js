const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 🔥 Supabase connection
const supabaseUrl = 'https://dfywwxmmfdqgjhkpltfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeXd3eG1tZmRxZ2poa3BsdGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTIzOTMsImV4cCI6MjA2MTQyODM5M30.83hRCloNkDNevhYoNy_uHT0zVgStVB3i82ZrIbXr-cM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve signup and signin pages
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Signup Route
app.post('/signup', async (req, res) => {
    console.log('Request body:', req.body); // Debugging log

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and Password are required!');
    }

    try {
        // Check if user already exists
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).send('Username already exists!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([
                { username: username, password: hashedPassword }
            ]);

        if (error) {
            console.error('Error inserting user:', error);
            return res.status(500).send('Failed to register user');
        }

        console.log('User registered:', data);
        res.send('User registered successfully!');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Server error');
    }
});

// Signin Route
app.post('/signin', async (req, res) => {
    console.log('Request body:', req.body); // Debugging log

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and Password are required!');
    }

    try {
        // Find user in Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (!user) {
            console.log('User not found');
            return res.status(400).send('Invalid credentials');
        }

        console.log('User found:', user);

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        res.status(200).send('Sign-in successful');
    } catch (err) {
        console.error('Error during signin:', err);
        res.status(500).send('Server error');
    }
});

// Start server
app.listen(4500, () => {
    console.log('Server running on port 4500');
    console.log('Visit: http://localhost:4500');
});
