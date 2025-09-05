import mysql.connector


def create_lego_database_and_tables():
    # Connect to MySQL server
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="asdf"
    )

    cursor = db.cursor()
    cursor.execute("USE legodb")
    # Drop tables if they exist (in order to respect foreign key constraints, drop LegoSet, Franchise, Category, User)
    cursor.execute("DROP TABLE IF EXISTS LegoSet")
    cursor.execute("DROP TABLE IF EXISTS Franchise")
    cursor.execute("DROP TABLE IF EXISTS Category")
    cursor.execute("DROP TABLE IF EXISTS User")

    # Create database
    cursor.execute("CREATE DATABASE IF NOT EXISTS LegoDB")
    cursor.execute("USE LegoDB")

    # Create User table
    cursor.execute("""
    CREATE TABLE User (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL
    )
    """)

    # Insert one user Samanta
    cursor.execute("INSERT INTO User (name, password) VALUES (%s, %s)", ("Samanta", "123"))
    db.commit()

    # Get Samanta's user_id to link FK
    cursor.execute("SELECT user_id FROM User WHERE name = %s", ("Samanta",))
    samanta_id = cursor.fetchone()[0]

    # Create Franchise table with a foreign key to user_id
    cursor.execute("""
    CREATE TABLE Franchise (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        country_of_origin VARCHAR(100),
        founder VARCHAR(100),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    """)

    # Create Category table
    cursor.execute("""
    CREATE TABLE Category (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    """)

    # Create LegoSet table with additional details and foreign key to Franchise, Category, and User
    cursor.execute("""
    CREATE TABLE LegoSet (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        year INT,
        piece_count INT,
        price_usd DECIMAL(7,2),
        franchise_id INT,
        category_id INT,
        user_id INT,
        FOREIGN KEY (franchise_id) REFERENCES Franchise(id),
        FOREIGN KEY (category_id) REFERENCES Category(id),
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    """)

    # Insert franchise data linked to Samanta
    franchises = [
        ("Star Wars", "Famous sci-fi franchise", "USA", "George Lucas", samanta_id),
        ("Harry Potter", "Magical world theme", "UK", "J.K. Rowling", samanta_id),
        ("Marvel", "Superhero comic universe", "USA", "Stan Lee", samanta_id),
        ("Technic", "Advanced building sets", "Denmark", "Ole Kirk Christiansen", samanta_id),
        ("City", "City life and vehicles", "Denmark", "Ole Kirk Christiansen", samanta_id)
    ]
    cursor.executemany(
        "INSERT INTO Franchise (name, description, country_of_origin, founder, user_id) VALUES (%s, %s, %s, %s, %s)",
        franchises)
    db.commit()

    # Insert category data linked to Samanta
    categories = [
        ("Space", "Space themed LEGO sets", samanta_id),
        ("Fantasy", "Fantasy themed LEGO sets", samanta_id),
        ("Superheroes", "Superhero themed LEGO sets", samanta_id),
        ("Vehicles", "Vehicle themed LEGO sets", samanta_id),
        ("City Life", "City life themed LEGO sets", samanta_id)
    ]
    cursor.executemany(
        "INSERT INTO Category (name, description, user_id) VALUES (%s, %s, %s)",
        categories)
    db.commit()

    # Retrieve franchise IDs again to insert Lego sets correctly
    cursor.execute("SELECT id, name FROM Franchise WHERE user_id = %s", (samanta_id,))
    franchise_map = {name: fid for fid, name in cursor.fetchall()}

    # Retrieve category IDs to link sets
    cursor.execute("SELECT id, name FROM Category WHERE user_id = %s", (samanta_id,))
    category_map = {name: cid for cid, name in cursor.fetchall()}

    # Insert lego sets data linked to Samanta with category
    lego_sets = [
        ("Millennium Falcon", 2015, 7541, 799.99, franchise_map["Star Wars"], category_map["Space"], samanta_id),
        ("Hogwarts Castle", 2018, 6020, 399.99, franchise_map["Harry Potter"], category_map["Fantasy"], samanta_id),
        ("Iron Man Armor", 2019, 1200, 149.99, franchise_map["Marvel"], category_map["Superheroes"], samanta_id),
        ("Bugatti Chiron", 2020, 3599, 349.99, franchise_map["Technic"], category_map["Vehicles"], samanta_id),
        ("Fire Station", 2017, 400, 59.99, franchise_map["City"], category_map["City Life"], samanta_id)
    ]
    cursor.executemany(
        "INSERT INTO LegoSet (name, year, piece_count, price_usd, franchise_id, category_id, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        lego_sets)
    db.commit()

    cursor.close()
    db.close()


# Run the function
create_lego_database_and_tables()
