import streamlit as st
import google.generativeai as genai
from PIL import Image
import urllib.parse

st.set_page_config(page_title="Smart Sous-Chef", page_icon="🍳")

with st.sidebar:
    st.title("⚙️ Settings")
    api_key = st.text_input("Enter Gemini API Key", type="password")
    num_people = st.slider("How many people?", 1, 10, 2)

st.title("🍳 Smart Sous-Chef")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    tab1, tab2, tab3 = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal", "🎲 Chef's Choice"])

    # --- TAB 1: ORIGINAL FRIDGE SCAN ---
    with tab1:
        st.subheader("What's in the kitchen?")
        source = st.radio("Upload or Take Photo:", ["Upload Image", "Use Camera"])
        
        if source == "Upload Image":
            img_file = st.file_uploader("Choose a photo...", type=['jpg', 'jpeg', 'png'])
        else:
            img_file = st.camera_input("Take a photo")

        if img_file and st.button("Analyze & Suggest"):
            img = Image.open(img_file)
            with st.spinner("Scanning..."):
                response = model.generate_content([f"Identify ingredients and suggest 3 recipes for {num_people} people.", img])
                st.markdown(response.text)

    # --- TAB 2: ORIGINAL MEAL PLANNER ---
    with tab2:
        meal_request = st.text_input("What do you want to eat?")
        if meal_request and st.button("Get List"):
            with st.spinner("Planning..."):
                response = model.generate_content(f"Recipe for {meal_request} for {num_people} people. End with 'SHOPPING LIST' in bullets.")
                st.markdown(response.text)

    # --- TAB 3: NEW CHEF'S CHOICE ---
    with tab3:
        st.subheader("I'll decide for you!")
        c1, c2, c3 = st.columns(3)
        with c1:
            m_type = st.selectbox("Meal", ["Breakfast", "Lunch", "Dinner"])
        with c2:
            cuisine = st.selectbox("Style", ["Italian", "Japanese", "French", "Mexican", "Mediterranean", "American"])
        with c3:
            health = st.select_slider("Vibe", options=["Greasy", "Balanced", "Healthy"])

        if st.button("Surprise Me!"):
            with st.spinner("Chef is thinking..."):
                prompt = f"Suggest a {health} {cuisine} {m_type} for {num_people}. Include a 'SHOPPING LIST' at the end."
                response = model.generate_content(prompt)
                st.markdown(response.text)
                
                # SMS Link Logic
                if "SHOPPING LIST" in response.text:
                    clean_list = response.text.split("SHOPPING LIST")[-1].strip()
                    encoded = urllib.parse.quote(f"My Shopping List:\n{clean_list}")
                    st.markdown(f"### [📲 Send to Phone](sms:?&body={encoded})")
else:
    st.info("👈 Please enter your API Key in the sidebar.")
    
      
                
