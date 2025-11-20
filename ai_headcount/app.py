# app.py
# A more advanced Flask web service for video-based headcount using YOLOv5.
# VERSION 5: Upgraded to YOLOv5n (Nano) for much faster loading times.
#
# Installation:
# 1. pip install Flask opencv-python numpy torch torchvision ultralytics
#
# To run:
# python app.py

import cv2
import numpy as np
import os
import torch
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- Configuration ---
UPLOAD_FOLDER = 'temp_uploads'

# --- Initialization ---
# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Load the pre-trained YOLOv5n model from PyTorch Hub
# This is the smallest and fastest version.
# The model will be downloaded automatically the first time this runs.
try:
    # CHANGE: Switched from 'yolov5s' to 'yolov5n' for speed.
    model = torch.hub.load('ultralytics/yolov5', 'yolov5n', pretrained=True)
    print("YOLOv5n (Nano) model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLOv5 model: {e}")
    print("Please ensure you have an active internet connection the first time you run this.")
    # Exit if the model can't be loaded, as the app is useless without it.
    exit()

@app.route('/process_video', methods=['POST'])
def process_video_endpoint():
    """
    This endpoint processes a video to count the maximum number of 'persons'
    detected in any single frame using the YOLOv5n model.
    """
    if 'video' not in request.files:
        return jsonify({'error': 'No video file part in the request'}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    video_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        file.save(video_path)

        video_capture = cv2.VideoCapture(video_path)
        if not video_capture.isOpened():
            return jsonify({'error': 'Could not open video file'}), 500

        max_persons_detected = 0
        frame_limit = 150 # Process up to 150 frames for efficiency

        for _ in range(frame_limit):
            ret, frame = video_capture.read()
            if not ret:
                break # End of video

            # The YOLO model expects images in RGB format, but OpenCV reads them in BGR.
            # So, we convert the color space.
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Perform detection
            results = model(rgb_frame)
            
            # The results object contains the detected objects. We need to count
            # how many of them are labeled as 'person'.
            labels = results.pandas().xyxy[0]['name']
            person_count = (labels == 'person').sum()

            if person_count > max_persons_detected:
                max_persons_detected = person_count

        video_capture.release()
        
        return jsonify({'face_count': int(max_persons_detected)})

    except Exception as e:
        print(f"An error occurred during video processing: {e}")
        return jsonify({'error': 'An internal server error occurred during processing'}), 500
    
    finally:
        # Clean up by deleting the temporary video file
        if os.path.exists(video_path):
            os.remove(video_path)

if __name__ == '__main__':
    # Run the Flask app.
    app.run(host='0.0.0.0', port=5001, debug=True)
