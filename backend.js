const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "student.veleri.hr",
  user: "srajko",
  password: "277",
  database: "srajko",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/api/status", (req, res) => {
  res.send("the backend works");
});

app.get("/api/franchises", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  pool.query("SELECT id, name FROM FranchiseQuasar WHERE user_id = ?", [userId], (error, results) => {
    if (error) {
      console.error("Failed to fetch franchises:", error);
      return res.status(500).json({ error: "Failed to fetch franchises" });
    }
    res.json(results);
  });
});

app.post("/api/login", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Missing name or password" });
  }

  const sql = "SELECT user_id FROM UserQuasar WHERE name = ? AND password = ?";
  pool.query(sql, [name, password], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Database query failed" });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ user_id: results[0].user_id });
  });
});

app.post("/api/register", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Missing name or password" });
  }

  pool.query("SELECT user_id FROM UserQuasar WHERE name = ?", [name], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    if (results.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    pool.query(
      "INSERT INTO UserQuasar (name, password) VALUES (?, ?)",
      [name, password],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to register user" });
        }
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  });
});

app.get("/api/legosets", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  const query = `
    SELECT LegoSetQuasar.id, LegoSetQuasar.name, LegoSetQuasar.year, LegoSetQuasar.piece_count, LegoSetQuasar.price_usd,
           CategoryQuasar.name AS category_name,
           FranchiseQuasar.name AS franchise_name
    FROM LegoSetQuasar
    LEFT JOIN CategoryQuasar ON LegoSetQuasar.category_id = CategoryQuasar.id
    LEFT JOIN FranchiseQuasar ON LegoSetQuasar.franchise_id = FranchiseQuasar.id
    WHERE LegoSetQuasar.user_id = ?
  `;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

app.get("/api/legosets/expensive", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;

  const query = `
    SELECT
      LegoSetQuasar.id, LegoSetQuasar.name, LegoSetQuasar.year, LegoSetQuasar.piece_count, LegoSetQuasar.price_usd,
      CategoryQuasar.name AS category_name,
      FranchiseQuasar.name AS franchise_name
    FROM LegoSetQuasar
    LEFT JOIN CategoryQuasar ON LegoSetQuasar.category_id = CategoryQuasar.id
    LEFT JOIN FranchiseQuasar ON LegoSetQuasar.franchise_id = FranchiseQuasar.id
    WHERE LegoSetQuasar.user_id = ? AND LegoSetQuasar.year >= ?
    ORDER BY LegoSetQuasar.price_usd DESC
    LIMIT 3;

  `;

  pool.query(query, [userId, minYear], (error, results) => {
    if (error) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

app.get("/api/categories/top", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  const query = `
    SELECT CategoryQuasar.id, CategoryQuasar.name, CategoryQuasar.description,
           SUM(LegoSetQuasar.piece_count) AS total_piece_count
    FROM CategoryQuasar
    JOIN LegoSetQuasar ON CategoryQuasar.id = LegoSetQuasar.category_id
    WHERE CategoryQuasar.user_id = ?
    GROUP BY CategoryQuasar.id, CategoryQuasar.name, CategoryQuasar.description
    ORDER BY total_piece_count DESC
    LIMIT 5
  `;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

app.get("/api/popular-category-by-country", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  const query = `
    SELECT
      FranchiseQuasar.country_of_origin AS country,
      CategoryQuasar.name AS category,
      COUNT(LegoSetQuasar.id) AS set_count
    FROM LegoSetQuasar
    JOIN FranchiseQuasar ON LegoSetQuasar.franchise_id = FranchiseQuasar.id
    JOIN CategoryQuasar ON LegoSetQuasar.category_id = CategoryQuasar.id
    WHERE LegoSetQuasar.user_id = ?
    GROUP BY country, category
    ORDER BY country, set_count DESC
  `;

  pool.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Database query failed:", error);
      return res.status(500).json({ error: "Database query failed" });
    }

    const topCategoriesByCountry = {};
    results.forEach(row => {
      const country = row.country;
      if (!topCategoriesByCountry[country] || row.set_count > topCategoriesByCountry[country].count) {
        topCategoriesByCountry[country] = {
          country,
          category: row.category,
          count: row.set_count
        };
      }
    });

    res.json(Object.values(topCategoriesByCountry));
  });
});


app.post("/api/addfranchise", (req, res) => {
  const { name, description, country_of_origin, founder, user_id } = req.body;
  if (!name || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    INSERT INTO FranchiseQuasar (name, description, country_of_origin, founder, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  pool.query(sql, [name, description || "", country_of_origin || "", founder || "", user_id], (error, result) => {
    if (error) {
      console.error("Failed to add franchise:", error);
      return res.status(500).json({ error: "Failed to add franchise" });
    }
    res.status(201).json({ message: "Franchise added", franchise_id: result.insertId });
  });
});


app.post("/api/addcategory", (req, res) => {
  const { name, description, user_id } = req.body;
  if (!name || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    INSERT INTO CategoryQuasar (name, description, user_id)
    VALUES (?, ?, ?)
  `;
  pool.query(sql, [name, description || "", user_id], (error, result) => {
    if (error) {
      console.error("Failed to add category:", error);
      return res.status(500).json({ error: "Failed to add category" });
    }
    res.status(201).json({ message: "Category added", category_id: result.insertId });
  });
});

// Add a new Lego Set
app.post("/api/addlegoset", (req, res) => {
  const { name, year, piece_count, price_usd, franchise_id, category_id, user_id } = req.body;
  if (!name || !year || !piece_count || !price_usd || !franchise_id || !category_id || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    INSERT INTO LegoSetQuasar (name, year, piece_count, price_usd, franchise_id, category_id, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  pool.query(sql, [name, year, piece_count, price_usd, franchise_id, category_id, user_id], (error, result) => {
    if (error) {
      console.error("Failed to add lego set:", error);
      return res.status(500).json({ error: "Failed to add lego set" });
    }
    res.status(201).json({ message: "Lego set added", legoset_id: result.insertId });
  });
});


app.get("/api/franchises", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  const sql = "SELECT id, name FROM FranchiseQuasar WHERE user_id = ?";
  pool.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Failed to fetch franchises:", error);
      return res.status(500).json({ error: "Failed to fetch franchises" });
    }
    res.json(results);
  });
});

app.get("/api/categories", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  const sql = "SELECT id, name FROM CategoryQuasar WHERE user_id = ?";
  pool.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Failed to fetch categories:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
