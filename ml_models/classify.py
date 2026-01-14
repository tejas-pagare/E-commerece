import sys
import os
import json
import numpy as np
from PIL import Image
import io

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import tensorflow as tf

def load_models():
    # Paths to models - assuming they are in the root directory
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model1_path = os.path.join(base_path, 'model_1_best_gatekeeper.h5')

    try:
        gatekeeper = tf.keras.models.load_model(model1_path)
        return gatekeeper
    except Exception as e:
        print(json.dumps({"error": f"Failed to load models: {str(e)}"}))
        sys.exit(1)

def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # 1. Resize to 224x224 (Matching your target_size=(224, 224))
        img = img.resize((224, 224)) 
        
        # 2. Convert to Array
        img_array = np.array(img)
        
        # NOTE: In your reference code, you did NOT divide by 255.0.
        # tf.keras.utils.img_to_array keeps values 0-255.
        # Therefore, we keep values 0-255 here to match the reference.
        # img_array = img_array / 255.0  <-- REMOVED TO MATCH REFERENCE
        
        # 3. Add Batch Dimension (Matching tf.expand_dims(img_array, 0))
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(json.dumps({"error": f"Image processing failed: {str(e)}"}))
        sys.exit(1)

def main():
    try:
        # Read image bytes from stdin (Node.js buffer)
        image_bytes = sys.stdin.buffer.read()
        
        if not image_bytes:
            print(json.dumps({"error": "No image data received"}))
            sys.exit(1)

        gatekeeper = load_models()
        
        processed_img = preprocess_image(image_bytes)

        # --- MAKE PREDICTION ---
        prediction = gatekeeper.predict(processed_img, verbose=0)
        
        # Get the sigmoid score (0 to 1)
        # Matches reference: score = prediction[0][0]
        score = float(prediction[0][0]) 

        # --- INTERPRET THE RESULT ---
        # Reference Logic: 
        # Class 0 = 'cloth'
        # Class 1 = 'no-cloth'
        # If score < 0.5, it is Class 0 (Cloth)
        
        is_cloth = score < 0.5

        # Debug logs for your server console
        print(json.dumps({
            "debug": f"Raw Score: {score:.4f} (Threshold 0.5)"
        }))

        if is_cloth:
            # It is Cloth (Score was low, e.g., 0.01)
            # Calculate confidence: if score is 0.1, confidence it IS cloth is 0.9
            confidence = 1.0 - score
            
            print(json.dumps({
                "is_cloth": True,
                "category": "Cloth",
                "confidence": confidence,
                "raw_score": score,
                "message": "Gatekeeper passed"
            }))
        else:
            # It is Not Cloth (Score was high, e.g., 0.9)
            print(json.dumps({
                "is_cloth": False,
                "category": "No-Cloth",
                "confidence": score, # Confidence that it is NOT cloth
                "raw_score": score,
                "message": f"Image rejected. Identified as No-Cloth (Score: {score:.4f})"
            }))

    except Exception as e:
        print(json.dumps({"error": f"Inference error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()