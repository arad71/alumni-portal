import cv2
import numpy as np
import json
import time
import os
from datetime import datetime

class ParkingSpotDetector:
    """
    A class to detect and monitor parking spots using computer vision.
    """
    
    def __init__(self, config_path="parking_config.json", threshold=0.6):
        """
        Initialize the parking spot detector.
        
        Args:
            config_path (str): Path to the parking spot configuration file
            threshold (float): Occupancy threshold (0-1)
        """
        self.threshold = threshold
        self.spots = []
        self.spot_status = {}
        self.load_config(config_path)
        
    def load_config(self, config_path):
        """Load parking spot coordinates from config file"""
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.spots = config.get("spots", [])
                print(f"Loaded {len(self.spots)} parking spots from configuration")
        else:
            print(f"Config file {config_path} not found. No spots loaded.")
    
    def save_config(self, config_path="parking_config.json"):
        """Save parking spot coordinates to config file"""
        with open(config_path, 'w') as f:
            json.dump({"spots": self.spots}, f)
        print(f"Saved {len(self.spots)} parking spots to configuration")
    
    def define_spots(self, frame):
        """
        Interactive function to define parking spots on a frame.
        
        Args:
            frame: The video frame to define spots on
        """
        spots = []
        
        def mouse_callback(event, x, y, flags, param):
            nonlocal spots
            if event == cv2.EVENT_LBUTTONDOWN:
                if len(spots) % 4 < 4:
                    spots.append((x, y))
                    print(f"Point added: {x}, {y}")
                
                # When 4 points are collected, we have a complete parking spot
                if len(spots) % 4 == 0:
                    print(f"Parking spot {len(spots) // 4} defined")
        
        clone = frame.copy()
        cv2.namedWindow("Define Parking Spots")
        cv2.setMouseCallback("Define Parking Spots", mouse_callback)
        
        while True:
            display = clone.copy()
            
            # Draw the points and connect them to form polygons for each parking spot
            for i in range(0, len(spots), 4):
                if i + 3 < len(spots):
                    spot_points = spots[i:i+4]
                    pts = np.array(spot_points, np.int32)
                    pts = pts.reshape((-1, 1, 2))
                    cv2.polylines(display, [pts], True, (0, 255, 0), 2)
                    
                    # Add spot number
                    centroid_x = sum(p[0] for p in spot_points) // 4
                    centroid_y = sum(p[1] for p in spot_points) // 4
                    cv2.putText(display, str(i//4 + 1), (centroid_x, centroid_y), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            
            # Draw points
            for i, point in enumerate(spots):
                cv2.circle(display, point, 5, (0, 0, 255), -1)
            
            cv2.imshow("Define Parking Spots", display)
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('s'):  # Save the spots
                self.spots = []
                # Convert the list of points into list of parking spots
                for i in range(0, len(spots), 4):
                    if i + 3 < len(spots):
                        self.spots.append(spots[i:i+4])
                self.save_config()
                break
            elif key == ord('q'):  # Quit without saving
                break
        
        cv2.destroyAllWindows()
        return self.spots
    
    def detect_occupancy(self, frame):
        """
        Detect if parking spots are occupied.
        
        Args:
            frame: The video frame to analyze
            
        Returns:
            dict: Dictionary of spot IDs and their occupancy status
        """
        results = {}
        
        # Convert frame to grayscale for processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        for i, spot in enumerate(self.spots):
            # Create a mask for this parking spot
            mask = np.zeros_like(gray)
            points = np.array(spot, np.int32)
            points = points.reshape((-1, 1, 2))
            cv2.fillPoly(mask, [points], 255)
            
            # Apply the mask
            spot_img = cv2.bitwise_and(gray, mask)
            
            # Calculate the percentage of non-black pixels
            total_pixels = cv2.countNonZero(mask)
            if total_pixels == 0:  # Avoid division by zero
                continue
                
            # Apply adaptive thresholding to identify features in the spot
            thresh = cv2.adaptiveThreshold(
                spot_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # Count white pixels (features) in the thresholded image
            white_pixels = cv2.countNonZero(thresh)
            
            # Calculate feature density
            feature_density = white_pixels / total_pixels
            
            # Determine if the spot is occupied based on feature density
            is_occupied = feature_density > self.threshold
            
            results[i] = {
                "occupied": is_occupied,
                "confidence": feature_density
            }
        
        self.spot_status = results
        return results
    
    def visualize(self, frame):
        """
        Draw parking spots and their status on the frame.
        
        Args:
            frame: The video frame to visualize on
            
        Returns:
            The visualized frame
        """
        vis = frame.copy()
        
        for spot_id, spot in enumerate(self.spots):
            status = self.spot_status.get(spot_id, {})
            is_occupied = status.get("occupied", False)
            
            # Draw polygon around parking spot
            points = np.array(spot, np.int32)
            points = points.reshape((-1, 1, 2))
            
            # Red for occupied, green for free
            color = (0, 0, 255) if is_occupied else (0, 255, 0)
            cv2.polylines(vis, [points], True, color, 2)
            
            # Fill with semi-transparent color
            overlay = vis.copy()
            cv2.fillPoly(overlay, [points], color)
            cv2.addWeighted(overlay, 0.3, vis, 0.7, 0, vis)
            
            # Add spot ID and status
            centroid_x = sum(p[0] for p in spot) // 4
            centroid_y = sum(p[1] for p in spot) // 4
            status_text = "Occupied" if is_occupied else "Free"
            
            cv2.putText(vis, f"#{spot_id+1}: {status_text}", 
                       (centroid_x - 40, centroid_y), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(vis, timestamp, (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add occupancy stats
        total_spots = len(self.spots)
        if total_spots > 0:
            occupied = sum(1 for spot in self.spot_status.values() if spot.get("occupied", False))
            free = total_spots - occupied
            
            cv2.putText(vis, f"Free: {free}/{total_spots}", (10, 70), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(vis, f"Occupied: {occupied}/{total_spots}", (10, 100), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        return vis
    
    def get_parking_data(self):
        """
        Get the current parking data in a format suitable for database storage.
        
        Returns:
            dict: Parking data with timestamp
        """
        occupied_count = sum(1 for spot in self.spot_status.values() if spot.get("occupied", False))
        free_count = len(self.spots) - occupied_count
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_spots": len(self.spots),
            "occupied_spots": occupied_count,
            "free_spots": free_count,
            "occupancy_rate": occupied_count / len(self.spots) if len(self.spots) > 0 else 0,
            "spot_details": self.spot_status
        }

# Usage example
if __name__ == "__main__":
    # Initialize detector
    detector = ParkingSpotDetector()
    
    # Open video capture (0 for webcam, or provide video file path)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open video source")
        exit()
    
    # Get first frame for spot definition
    ret, first_frame = cap.read()
    if not ret:
        print("Error: Could not read from video source")
        exit()
    
    # Define spots if none are loaded
    if len(detector.spots) == 0:
        print("No parking spots defined. Please define spots on the image.")
        print("Click to mark the 4 corners of each parking spot.")
        print("Press 's' to save the configuration or 'q' to quit.")
        detector.define_spots(first_frame)
    
    print(f"Monitoring {len(detector.spots)} parking spots...")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("End of video stream")
                break
            
            # Detect parking spot occupancy
            detector.detect_occupancy(frame)
            
            # Visualize results
            vis_frame = detector.visualize(frame)
            
            # Display the frame
            cv2.imshow("Parking Spot Monitor", vis_frame)
            
            # Get parking data (could be saved to database)
            parking_data = detector.get_parking_data()
            
            # Press 'q' to exit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("Monitoring interrupted")
    finally:
        cap.release()
        cv2.destroyAllWindows()
