import streamlit as st
import google.generativeai as genai
from PIL import Image
import urllib.parse

# 1. Page Configuration
st.set_page_config(page_title="Smart Sous-Chef", page_icon="🍳", layout="centered")

# 2. Sidebar for API Key & Settings
with st.sidebar:
    st.title("⚙️ Settings")
    api_key = st.text_input("Enter Gemini API Key", type="password")
    st.info("Get a key at [Google AI Studio](https://aistudio.google.com/)")
    num_people = st.slider("How many people are we cooking for?", 1, 10, 2)

st.title("🍳 Smart Sous-Chef")
st.markdown("Scan your fridge or plan a meal. I'll handle the rest!")

# 3. AI Setup Logic
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    tab1, tab2 = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal"])

    # --- TAB 1: FRIDGE SCAN ---
    with tab1:
        st.subheader("What's in the kitchen?")
        source = st.radio("Upload or Take Photo:", ["Upload Image", "Use Camera"])
        
        if source == "Upload Image":
            img_file = st.file_uploader("Choose a photo...", type=['jpg', 'jpeg', 'png'])
        else:
            img_file = st.camera_input("Take a photo of your fridge")

        if img_file:
            img = Image.open(img_file)
            if st.button("Analyze & Suggest Meals"):
                with st.spinner("Chef is looking..."):
                    prompt = f"Identify the food in this photo. Suggest 3 meals for {num_people} people. For each, list ingredients found and a 'Shopping List' for what is missing."
                    response = model.generate_content([prompt, img])
                    st.markdown(response.text)

    # --- TAB 2: MEAL PLANNER ---
    with tab2:
        st.subheader("Craving something specific?")
        meal_request = st.text_input("What would you like to eat? (e.g. 'Healthy Tacos')")
        
        if meal_request and st.button("Generate Shopping List"):
            with st.spinner("Writing your list..."):
                prompt = f"Create a recipe for {meal_request} for {num_people} people. At the end, provide a section clearly labeled 'SHOPPING LIST' with concise bullet points."
                response = model.generate_content(prompt)
                full_text = response.text
                st.markdown(full_text)

                # Extraction for SMS
                if "SHOPPING LIST" in full_text:
                    shop_list = full_text.split("SHOPPING LIST")[-1].strip()
                    # Clean up the text for URL encoding
                    sms_body = f"Shopping List for {meal_request}:\n{shop_list}"
                    encoded_sms = urllib.parse.quote(sms_body)
                    
                    st.markdown("---")
                    st.markdown(f"### [📲 Click to Text Shopping List](sms:?&body={encoded_sms})")
                    st.caption("Note: This works best on mobile devices.")

else:
    st.warning("👈 Please enter your Gemini API Key in the sidebar to start!")

# 4. Footer
st.markdown("---")
st.caption("Built for efficient cooking. No more 'what's for dinner' stress.")
