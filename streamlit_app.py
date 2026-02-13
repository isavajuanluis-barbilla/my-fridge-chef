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
    # Using 1.5-flash as it is highly stable for vision/text
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Added the third tab: "Chef's Choice"
    tab1, tab2, tab3 = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal", "🎲 Chef's Choice"])

    # --- TAB 1 & 2 remain the same logic as before ---
    with tab1:
        img_file = st.camera_input("Take a photo of your fridge")
        if img_file and st.button("Analyze Fridge"):
            img = Image.open(img_file)
            response = model.generate_content([f"Suggest 3 meals for {num_people} people based on this photo.", img])
            st.markdown(response.text)

    with tab2:
        meal_request = st.text_input("What do you want to eat? (e.g. Lasagna)")
        if meal_request and st.button("Get Recipe & List"):
            response = model.generate_content(f"Recipe for {meal_request} for {num_people} people. Include a 'SHOPPING LIST' at the end.")
            st.markdown(response.text)

    # --- NEW TAB 3: CHEF'S CHOICE ---
    with tab3:
        st.subheader("I'll decide for you!")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            meal_type = st.selectbox("Meal", ["Breakfast", "Lunch", "Dinner", "Snack"])
        with col2:
            cuisine = st.selectbox("Nationality", ["Italian", "Japanese", "French", "Mexican", "Indian", "American", "Mediterranean"])
        with col3:
            health = st.select_slider("Health Level", options=["Greasy Spoon", "Balanced", "Super Healthy"])

        if st.button("Surprise Me!"):
            with st.spinner("Consulting the cookbooks..."):
                prompt = f"Suggest a {health} {cuisine} {meal_type} for {num_people} people. Provide a brief recipe and a 'SHOPPING LIST' with concise bullets."
                response = model.generate_content(prompt)
                full_text = response.text
                st.markdown(full_text)

                if "SHOPPING LIST" in full_text:
                    shop_list = full_text.split("SHOPPING LIST")[-1].strip()
                    encoded_sms = urllib.parse.quote(f"Shopping List:\n{shop_list}")
                    st.markdown(f"### [📲 Send to Phone](sms:?&body={encoded_sms})")
else:
    st.warning("👈 Please enter your API Key in the sidebar.")
 
    
      
                
