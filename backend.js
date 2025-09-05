const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const port = 3000;

// Enable CORS for all requests
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "asdf",
  database: "legodb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Simple status endpoint
app.get("/api/status", (req, res) => {
  res.send("the backend works");
});

// Get all franchises
app.get("/api/franchises", (req, res) => {
  pool.query("SELECT * FROM Franchise", (error, results) => {
    if (error) {
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
    }
  });
});

// Get all lego sets with franchise details
app.get("/api/legosets", (req, res) => {
  const query = `
    SELECT LegoSet.id, LegoSet.name, LegoSet.year, LegoSet.piece_count, LegoSet.price_usd,
           Franchise.name as franchise_name, Franchise.description as franchise_description
    FROM LegoSet
    JOIN Franchise ON LegoSet.franchise_id = Franchise.id
  `;
  pool.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
    }
  });
});

app.post("/api/login", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Missing name or password" });
  }

  const sql = "SELECT user_id FROM User WHERE name = ? AND password = ?";
  pool.query(sql, [name, password], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database query failed" });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Return user ID on successful login
    res.json({ user_id: results[0].user_id });
  });
});

app.post("/api/register", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Missing name or password" });
  }

  // Check if username already exists
  pool.query("SELECT user_id FROM User WHERE name = ?", [name], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    if (results.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Insert new user
    pool.query(
      "INSERT INTO User (name, password) VALUES (?, ?)",
      [name, password],
      (err, insertResult) => {
        if (err) {
          return res.status(500).json({ error: "Failed to register user" });
        }
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  });

});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
