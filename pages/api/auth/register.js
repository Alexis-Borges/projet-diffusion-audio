import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg'; // Import the pg library

// Create a connection pool to PostgreSQL
const pool = new Pool();

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (req.url.endsWith('/register')) {
            try {
                // Check if the user already exists
                const existingUser = await pool.query('SELECT * FROM user WHERE email = $1', [email]);
                if (existingUser.rows.length > 0) {
                    return res.status(409).json({ error: 'User already exists' });
                }

                // Hash the password and insert the new user into the database
                const hashedPassword = bcrypt.hashSync(password, 10);
                await pool.query('INSERT INTO user (email, password) VALUES ($1, $2)', [email, password]);
                return res.status(201).json({ message: 'User registered successfully' });
            } catch (error) {
                console.error('Error inserting into the database:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
}