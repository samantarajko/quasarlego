import mysql.connector
from mysql.connector import Error

def create_lego_tables_only():
    try:
        db = mysql.connector.connect(
            host="student.veleri.hr",
            user="srajko",
            password="277",
            port=3306,
            database="srajko"
        )
        if not db.is_connected():
            raise ConnectionError("Failed to connect to the MySQL server")

        cursor = db.cursor()
        try:
            cursor.execute("DROP TABLE IF EXISTS LegoSetQuasar")
            cursor.execute("DROP TABLE IF EXISTS FranchiseQuasar")
            cursor.execute("DROP TABLE IF EXISTS CategoryQuasar")
            cursor.execute("DROP TABLE IF EXISTS UserQuasar")
        except Error as e:
            raise RuntimeError(f"Failed to drop tables: {e}")

        try:
            cursor.execute("""
            CREATE TABLE UserQuasar (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL
            )
            """)
        except Error as e:
            raise RuntimeError(f"Failed to create UserQuasar table: {e}")

        # Insert user Samanta and verify commit
        try:
            cursor.execute("INSERT INTO UserQuasar (name, password) VALUES (%s, %s)", ("Samanta", "123"))
            db.commit()
        except Error as e:
            raise RuntimeError(f"Failed to insert user Samanta: {e}")

        # Retrieve Samanta's ID with check
        cursor.execute("SELECT user_id FROM UserQuasar WHERE name = %s", ("Samanta",))
        samanta_id = cursor.fetchone()
        if samanta_id is None:
            raise RuntimeError("Failed to retrieve Samanta's user_id after insertion")
        samanta_id = samanta_id[0]

        try:
            cursor.execute("""
            CREATE TABLE FranchiseQuasar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                country_of_origin VARCHAR(100),
                founder VARCHAR(100),
                user_id INT,
                FOREIGN KEY (user_id) REFERENCES UserQuasar(user_id)
            )
            """)
        except Error as e:
            raise RuntimeError(f"Failed to create FranchiseQuasar table: {e}")

        # Create CategoryQuasar table
        try:
            cursor.execute("""
            CREATE TABLE CategoryQuasar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                user_id INT,
                FOREIGN KEY (user_id) REFERENCES UserQuasar(user_id)
            )
            """)
        except Error as e:
            raise RuntimeError(f"Failed to create CategoryQuasar table: {e}")

        # Create LegoSetQuasar table
        try:
            cursor.execute("""
            CREATE TABLE LegoSetQuasar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                year INT,
                piece_count INT,
                price_usd DECIMAL(7,2),
                franchise_id INT,
                category_id INT,
                user_id INT,
                FOREIGN KEY (franchise_id) REFERENCES FranchiseQuasar(id),
                FOREIGN KEY (category_id) REFERENCES CategoryQuasar(id),
                FOREIGN KEY (user_id) REFERENCES UserQuasar(user_id)
            )
            """)
        except Error as e:
            raise RuntimeError(f"Failed to create LegoSetQuasar table: {e}")

        # Insert franchise data with error check
        franchises = [
            ("Star Wars", "Famous sci-fi franchise", "USA", "George Lucas", samanta_id),
            ("Harry Potter", "Magical world theme", "UK", "J.K. Rowling", samanta_id),
            ("Marvel", "Superhero comic universe", "USA", "Stan Lee", samanta_id),
            ("Technic", "Advanced building sets", "Denmark", "Ole Kirk Christiansen", samanta_id),
            ("City", "City life and vehicles", "Denmark", "Ole Kirk Christiansen", samanta_id)
        ]
        try:
            cursor.executemany(
                "INSERT INTO FranchiseQuasar (name, description, country_of_origin, founder, user_id) VALUES (%s, %s, %s, %s, %s)",
                franchises
            )
            db.commit()
        except Error as e:
            raise RuntimeError(f"Failed to insert franchise data: {e}")

        # Insert category data with error check
        categories = [
            ("Space", "Space themed LEGO sets", samanta_id),
            ("Fantasy", "Fantasy themed LEGO sets", samanta_id),
            ("Superheroes", "Superhero themed LEGO sets", samanta_id),
            ("Vehicles", "Vehicle themed LEGO sets", samanta_id),
            ("City Life", "City life themed LEGO sets", samanta_id)
        ]
        try:
            cursor.executemany(
                "INSERT INTO CategoryQuasar (name, description, user_id) VALUES (%s, %s, %s)",
                categories
            )
            db.commit()
        except Error as e:
            raise RuntimeError(f"Failed to insert category data: {e}")

        cursor.execute("SELECT id, name FROM FranchiseQuasar WHERE user_id = %s", (samanta_id,))
        franchise_map_raw = cursor.fetchall()
        if not franchise_map_raw:
            raise RuntimeError("No franchises found after insertion")
        franchise_map = {name: fid for fid, name in franchise_map_raw}

        cursor.execute("SELECT id, name FROM CategoryQuasar WHERE user_id = %s", (samanta_id,))
        category_map_raw = cursor.fetchall()
        if not category_map_raw:
            raise RuntimeError("No categories found after insertion")
        category_map = {name: cid for cid, name in category_map_raw}

        lego_sets = [
            ("Millennium Falcon", 2021, 7541, 799.99, franchise_map["Star Wars"], category_map["Space"], samanta_id),
            ("Hogwarts Castle", 2024, 6020, 399.99, franchise_map["Harry Potter"], category_map["Fantasy"], samanta_id),
            ("Iron Man Armor", 2022, 1200, 149.99, franchise_map["Marvel"], category_map["Superheroes"], samanta_id),
            ("Bugatti Chiron", 2020, 3599, 349.99, franchise_map["Technic"], category_map["Vehicles"], samanta_id),
            ("Fire Station", 2017, 400, 59.99, franchise_map["City"], category_map["City Life"], samanta_id)
        ]
        try:
            cursor.executemany(
                "INSERT INTO LegoSetQuasar (name, year, piece_count, price_usd, franchise_id, category_id, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                lego_sets
            )
            db.commit()
        except Error as e:
            raise RuntimeError(f"Failed to insert lego set data: {e}")

        cursor.close()
        db.close()

    except (Error, ConnectionError, RuntimeError) as e:
        raise RuntimeError(f"Database operation failed: {e}")

create_lego_tables_only()