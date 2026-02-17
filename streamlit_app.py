import streamlit as st
import google.generativeai as genai
from PIL import Image
import urllib.parse

# 1. Page Configuration
st.set_page_config(page_title="Smart Sous-Chef", page_icon="🍳", layout="centered")

# 2. Sidebar Settings
with st.sidebar:
    st.title("⚙️ Settings")
    api_key = st.text_input("Enter Gemini API Key", type="password")
    num_people = st.slider("How many people?", 1, 10, 2)
    st.info("App v1.0 - All Tabs Inclusive")

st.title("🍳 Smart Sous-Chef")

# 3. App Logic
if api_key:
    try:
        genai.configure(api_key=api_key)
        # Using Gemini 3 Flash for 2026 speed and stability
        model = genai.GenerativeModel('gemini-3-flash')

        tabs = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal", "🎲 Chef's Choice", "🗓️ Calendar Planner"])
        tab1, tab2, tab3, tab4 = tabs

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
                with st.spinner("Chef is looking..."):
                    response = model.generate_content([f"Identify ingredients and suggest 3 recipes for {num_people} people.", img])
                    st.markdown(response.text)

        # --- TAB 2: MEAL PLANNER ---
        with tab2:
            st.subheader("Recipe Search")
            meal_request = st.text_input("What do you want to eat?")
            if meal_request and st.button("Get Recipe"):
                with st.spinner("Planning..."):
                    response = model.generate_content(f"Recipe for {meal_request} for {num_people} people. End with 'SHOPPING LIST' in bullets.")
                    st.markdown(response.text)

        # --- TAB 3: CHEF'S CHOICE ---
        with tab3:
            st.subheader("I'll decide for you!")
            c1, c2, c3 = st.columns(3)
            with c1: m_type = st.selectbox("Meal", ["Breakfast", "Lunch", "Dinner"])
            with c2: cuisine = st.selectbox("Style", ["Italian", "Japanese", "French", "Mexican", "Mediterranean", "American"])
            with c3: health = st.select_slider("Vibe", options=["Greasy", "Balanced", "Healthy"])

            if st.button("Surprise Me!"):
                with st.spinner("Consulting cookbooks..."):
                    prompt = f"Suggest a {health} {cuisine} {m_type} for {num_people}. Include a 'SHOPPING LIST' at the end."
                    response = model.generate_content(prompt)
                    st.markdown(response.text)

        # --- TAB 4: CALENDAR PLANNER ---
        with tab4:
            st.subheader("Plan Your Future Meals")
            col_p1, col_p2 = st.columns(2)
            with col_p1: timeframe = st.radio("Timeframe", ["Weekly (7 Days)", "Monthly (4 Weeks)"])
            with col_p2: diet_goal = st.selectbox("Focus", ["Quick & Easy", "High Protein", "Budget Friendly", "Vegetarian"])

            if st.button("Generate Full Plan"):
                with st.spinner("Architecting plan..."):
                    prompt = f"Create a {timeframe} meal plan for {num_people} people focused on {diet_goal}. Use bold headers for each day like **Day 1**, **Day 2**. End with a 'MASTER SHOPPING LIST'."
                    response = model.generate_content(prompt)
                    st.write(response.text)

        # --- UNIVERSAL SMS TOOL (Appears if a list is found) ---
        # This checks the last generated response for a shopping list
        if 'response' in locals() and "SHOPPING LIST" in response.text:
            st.divider()
            shop_list = response.text.split("SHOPPING LIST")[-1].strip()
            clean_list = shop_list.replace("*", "").replace("#", "")
            encoded = urllib.parse.quote(f"Shopping List:\n{clean_list}")
            st.markdown(f'### [📲 Click to Text List](sms:?&body={encoded})')

    except Exception as e:
        st.error(f"Operational Error: {e}")
        st.info("Tip: Double-check your API key and internet connection.")
else:
    st.warning("👈 Please enter your Gemini API Key in the sidebar to begin!")
