import os
import tensorflow as tf
import json

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def inspect():
    base_path = os.getcwd()
    model1_path = os.path.join(base_path, 'model_1_best_gatekeeper.h5')
    model2_path = os.path.join(base_path, 'model_2_specialist.keras')

    print("--- Model Inspection ---")
    
    try:
        print(f"Loading {model1_path}...")
        m1 = tf.keras.models.load_model(model1_path)
        print(f"Model 1 (Gatekeeper) Input Shape: {m1.input_shape}")
        print(f"Model 1 (Gatekeeper) Output Shape: {m1.output_shape}")
    except Exception as e:
        print(f"Error loading Model 1: {e}")

    try:
        print(f"Loading {model2_path}...")
        m2 = tf.keras.models.load_model(model2_path)
        print(f"Model 2 (Specialist) Input Shape: {m2.input_shape}")
        print(f"Model 2 (Specialist) Output Shape: {m2.output_shape}")
    except Exception as e:
        print(f"Error loading Model 2: {e}")

if __name__ == "__main__":
    inspect()
