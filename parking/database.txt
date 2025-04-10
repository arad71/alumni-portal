import sqlite3
import json
from datetime import datetime, timedelta
import os

class ParkingDatabase:
    """
    Database manager for the parking system.
    Handles storage and retrieval of parking data.
    """
    
    def __init__(self, db_path="parking_data.db"):
        """
        Initialize the database connection.
        
        Args:
            db_path (str): Path to the SQLite database file
        """
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize the database schema if it doesn't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create parking spots table to store spot configurations
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS parking_spots (
                id INTEGER PRIMARY KEY,
                coordinates TEXT NOT NULL,
                label TEXT,
                section TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create occupancy data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS occupancy_data (
                id INTEGER PRIMARY KEY,
                timestamp TIMESTAMP NOT NULL,
                total_spots INTEGER NOT NULL,
                occupied_spots INTEGER NOT NULL,
                free_spots INTEGER NOT NULL,
                occupancy_rate REAL NOT NULL,
                spot_details TEXT NOT NULL
            )
        ''')
        
        # Create user table for mobile app users
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        # Create reservations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                spot_id INTEGER,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (spot_id) REFERENCES parking_spots (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_parking_spots(self, spots):
        """
        Save parking spot configurations to database.
        
        Args:
            spots (list): List of spot coordinates
            
        Returns:
            bool: Success status
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Clear existing spots
            cursor.execute("DELETE FROM parking_spots")
            
            # Insert new spots
            for i, spot_coords in enumerate(spots):
                cursor.execute(
                    "INSERT INTO parking_spots (coordinates, label, section) VALUES (?, ?, ?)",
                    (json.dumps(spot_coords), f"Spot {i+1}", "Main")
                )
            
            conn.commit()
            return True
        except Exception as e:
            print(f"Error saving spots: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def get_parking_spots(self):
        """
        Retrieve all parking spot configurations.
        
        Returns:
            list: List of parking spots
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, coordinates, label, section FROM parking_spots")
        rows = cursor.fetchall()
        
        spots = []
        for row in rows:
            spot_id, coords_json, label, section = row
            spots.append({
                "id": spot_id,
                "coordinates": json.loads(coords_json),
                "label": label,
                "section": section
            })
        
        conn.close()
        return spots
        
    def save_occupancy_data(self, data):
        """
        Save parking occupancy data to database.
        
        Args:
            data (dict): Parking occupancy data
            
        Returns:
            int: ID of the inserted record
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                INSERT INTO occupancy_data 
                (timestamp, total_spots, occupied_spots, free_spots, occupancy_rate, spot_details)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    data["timestamp"],
                    data["total_spots"],
                    data["occupied_spots"],
                    data["free_spots"],
                    data["occupancy_rate"],
                    json.dumps(data["spot_details"])
                )
            )
            
            conn.commit()
            last_id = cursor.lastrowid
            return last_id
        except Exception as e:
            print(f"Error saving occupancy data: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def get_latest_occupancy(self):
        """
        Get the most recent occupancy data.
        
        Returns:
            dict: Latest occupancy data
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT timestamp, total_spots, occupied_spots, free_spots, 
                   occupancy_rate, spot_details
            FROM occupancy_data
            ORDER BY timestamp DESC
            LIMIT 1
            """
        )
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        timestamp, total_spots, occupied_spots, free_spots, occupancy_rate, spot_details = row
        
        return {
            "timestamp": timestamp,
            "total_spots": total_spots,
            "occupied_spots": occupied_spots,
            "free_spots": free_spots,
            "occupancy_rate": occupancy_rate,
            "spot_details": json.loads(spot_details)
        }
    
    def get_occupancy_history(self, hours=24):
        """
        Get occupancy history for a specified time period.
        
        Args:
            hours (int): Number of hours to look back
            
        Returns:
            list: Occupancy history data
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()
        
        # Calculate the timestamp for 'hours' ago
        time_ago = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        cursor.execute(
            """
            SELECT timestamp, total_spots, occupied_spots, free_spots, occupancy_rate
            FROM occupancy_data
            WHERE timestamp >= ?
            ORDER BY timestamp ASC
            """,
            (time_ago,)
        )
        
        rows = cursor.fetchall()
        conn.close()
        
        # Convert rows to list of dicts
        history = []
        for row in rows:
            history.append(dict(row))
        
        return history
    
    def register_user(self, username, password_hash, email=None):
        """
        Register a new user.
        
        Args:
            username (str): Username
            password_hash (str): Hashed password
            email (str, optional): User email
            
        Returns:
            int: User ID if successful, None otherwise
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
                (username, password_hash, email)
            )
            
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            # Username or email already exists
            return None
        finally:
            conn.close()
    
    def authenticate_user(self, username, password_hash):
        """
        Authenticate a user.
        
        Args:
            username (str): Username
            password_hash (str): Hashed password
            
        Returns:
            dict: User data if authenticated, None otherwise
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?",
            (username, password_hash)
        )
        
        user = cursor.fetchone()
        
        if user:
            # Update last login time
            current_time = datetime.now().isoformat()
            cursor.execute(
                "UPDATE users SET last_login = ? WHERE id = ?",
                (current_time, user['id'])
            )
            conn.commit()
            
            user_data = dict(user)
            conn.close()
            return user_data
        else:
            conn.close()
            return None
    
    def create_reservation(self, user_id, spot_id, start_time, end_time=None):
        """
        Create a parking spot reservation.
        
        Args:
            user_id (int): User ID
            spot_id (int): Parking spot ID
            start_time (str): ISO format start time
            end_time (str, optional): ISO format end time
            
        Returns:
            int: Reservation ID if successful, None otherwise
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                INSERT INTO reservations 
                (user_id, spot_id, start_time, end_time, status)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user_id, spot_id, start_time, end_time, "active")
            )
            
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            print(f"Error creating reservation: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def get_user_reservations(self, user_id):
        """
        Get all reservations for a user.
        
        Args:
            user_id (int): User ID
            
        Returns:
            list: User's reservations
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT r.id, r.spot_id, p.label as spot_label, r.start_time, 
                   r.end_time, r.status, r.created_at
            FROM reservations r
            JOIN parking_spots p ON r.spot_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.start_time DESC
            """,
            (user_id,)
        )
        
        rows = cursor.fetchall()
        conn.close()
        
        # Convert rows to list of dicts
        reservations = []
        for row in rows:
            reservations.append(dict(row))
        
        return reservations
    
    def cancel_reservation(self, reservation_id, user_id):
        """
        Cancel a reservation.
        
        Args:
            reservation_id (int): Reservation ID
            user_id (int): User ID for verification
            
        Returns:
            bool: Success status
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Verify that the reservation belongs to the user
            cursor.execute(
                "SELECT id FROM reservations WHERE id = ? AND user_id = ?",
                (reservation_id, user_id)
            )
            
            if not cursor.fetchone():
                return False  # Reservation not found or doesn't belong to user
            
            # Update reservation status
            cursor.execute(
                "UPDATE reservations SET status = ? WHERE id = ?",
                ("cancelled", reservation_id)
            )
            
            conn.commit()
            return True
        except Exception as e:
            print(f"Error cancelling reservation: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def backup_database(self, backup_dir="backups"):
        """
        Create a backup of the database.
        
        Args:
            backup_dir (str): Directory to store backups
            
        Returns:
            str: Path to backup file if successful, None otherwise
        """
        try:
            # Create backup directory if it doesn't exist
            os.makedirs(backup_dir, exist_ok=True)
            
            # Generate backup filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"parking_backup_{timestamp}.db"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            # Connect to source database
            source_conn = sqlite3.connect(self.db_path)
            
            # Create backup connection
            backup_conn = sqlite3.connect(backup_path)
            
            # Copy data
            source_conn.backup(backup_conn)
            
            # Close connections
            source_conn.close()
            backup_conn.close()
            
            return backup_path
        except Exception as e:
            print(f"Backup failed: {e}")
            return None


# Usage example
if __name__ == "__main__":
    # Create database manager
    db = ParkingDatabase()
    
    # Example: Save some test spots
    test_spots = [
        [(100, 100), (200, 100), (200, 200), (100, 200)],
        [(210, 100), (310, 100), (310, 200), (210, 200)],
        [(320, 100), (420, 100), (420, 200), (320, 200)]
    ]
    db.save_parking_spots(test_spots)
    
    # Example: Save occupancy data
    test_data = {
        "timestamp": datetime.now().isoformat(),
        "total_spots": 3,
        "occupied_spots": 1,
        "free_spots": 2,
        "occupancy_rate": 0.33,
        "spot_details": {
            "0": {"occupied": True, "confidence": 0.8},
            "1": {"occupied": False, "confidence": 0.2},
            "2": {"occupied": False, "confidence": 0.1}
        }
    }
    db.save_occupancy_data(test_data)
    
    # Retrieve and print latest occupancy
    latest = db.get_latest_occupancy()
    if latest:
        print("Latest parking data:")
        print(f"Time: {latest['timestamp']}")
        print(f"Free spots: {latest['free_spots']}/{latest['total_spots']}")
        print(f"Occupancy rate: {latest['occupancy_rate'] * 100:.1f}%")
