import streamlit as st
import google.generativeai as genai
from PIL import Image
import urllib.parse
from ical.calendar import Calendar
from ical.event import Event
from datetime import datetime, timedelta

# --- 1. Page Configuration ---
st.set_page_config(page_title="Smart Sous-Chef", page_icon="🍳", layout="centered")

# --- 2. Sidebar Settings ---
with st.sidebar:
    st.title("⚙️ Settings")
    api_key = st.text_input("Enter Gemini API Key", type="password")
    num_people = st.slider("How many people?", 1, 10, 2)
    st.markdown("---")
    st.info("MVP v1.2 | Python 3.13 Stable")

st.title("🍳 Smart Sous-Chef")

# --- 3. App Logic ---
if api_key:
    try:
        genai.configure(api_key=api_key)
        # Using Gemini 3 Flash (The 2026 Standard)
        model = genai.GenerativeModel('gemini-3-flash')

        tabs = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal", "🎲 Chef's Choice", "🗓️ Calendar Planner"])
        tab1, tab2, tab3, tab4 = tabs

        # --- TAB 1: FRIDGE SCAN ---
        with tab1:
            st.subheader("What's in the kitchen?")
            source = st.radio("Upload or Take Photo:", ["Upload Image", "Use Camera"])
            if source == "Upload Image":
                img_file = st.file_uploader("Choose a photo...", type=['jpg', 'jpeg', 'png'])
            else:
                img_file = st.camera_input("Take a photo")

            if img_file and st.button("Analyze & Suggest"):
                img = Image.open(img_file)
                with st.spinner("Scanning ingredients..."):
                    response = model.generate_content([f"Identify ingredients and suggest 3 recipes for {num_people} people.", img])
                    st.markdown(response.text)
                    st.session_state['last_res'] = response.text

        # --- TAB 2: MEAL PLANNER ---
        with tab2:
            st.subheader("Specific Recipe Search")
            meal_request = st.text_input("What do you want to eat?")
            if meal_request and st.button("Get Recipe"):
                with st.spinner("Planning..."):
                    response = model.generate_content(f"Recipe for {meal_request} for {num_people} people. End with 'SHOPPING LIST' in bullets.")
                    st.markdown(response.text)
                    st.session_state['last_res'] = response.text

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
                    st.session_state['last_res'] = response.text

        # --- TAB 4: CALENDAR PLANNER ---
        with tab4:
            st.subheader("Plan Your Future Meals")
            
            selected_meals = st.multiselect(
                "Which meals should I plan?",
                ["Breakfast", "Lunch", "Dinner"],
                default=["Lunch", "Dinner"]
            )
            
            col_p1, col_p2 = st.columns(2)
            with col_p1: 
                timeframe = st.radio("Timeframe", ["Weekly (7 Days)", "Monthly (4 Weeks)"])
            with col_p2: 
                diet_goal = st.selectbox("Focus", ["Quick & Easy", "High Protein", "Budget Friendly", "Vegetarian"])

            if st.button("Generate Full Plan") and selected_meals:
                with st.spinner("Architecting plan..."):
                    meals_str = ", ".join(selected_meals)
                    prompt = f"Create a {timeframe} meal plan for {num_people} people focused on {diet_goal}. \
                              ONLY plan these meals: {meals_str}. Use bold headers for each day like **Day 1**, **Day 2**. \
                              End with a 'MASTER SHOPPING LIST'."
                    
                    response = model.generate_content(prompt)
                    plan_text = response.text
                    st.markdown(plan_text)
                    st.session_state['last_res'] = plan_text

                    # Calendar (.ics) Export Logic
                    try:
                        calendar = Calendar()
                        days_split = plan_text.split("**Day")
                        
                        for i, content in enumerate(days_split[1:], 1):
                            event = Event(
                                summary=f"🍴 {meals_str} (Day {i})",
                                description=content.strip()[:300],
                                start=(datetime.now() + timedelta(days=i)).date(),
                            )
                            calendar.events.append(event)
                        
                        # Generate ICS string without the extra serialize module
                        ics_data = "\n".join(calendar.ics())
                        
                        st.download_button(
                            label="📅 Download .ics Calendar File", 
                            data=ics_data, 
                            file_name="my_meal_plan.ics",
                            mime="text/calendar"
                        )
                    except Exception as cal_e:
                        st.error(f"Calendar error: {cal_e}")

        # --- UNIVERSAL SMS TOOL ---
        if 'last_res' in st.session_state and "SHOPPING LIST" in st.session_state['last_res']:
            st.divider()
            full_text = st.session_state['last_res']
            # Find everything after 'SHOPPING LIST'
            parts = full_text.split("SHOPPING LIST")
            shop_list = parts[-1].strip()
            # Basic cleanup of AI formatting
            clean_list = shop_list.replace("*", "").replace("#", "")
            encoded = urllib.parse.quote(f"Shopping List:\n{clean_list}")
            
            st.markdown(f'### [📲 Send List to Phone via SMS](sms:?&body={encoded})')

    except Exception as e:
        st.error(f"Something went wrong: {e}")
else:
    st.warning("👈 Please enter your Gemini API Key in the sidebar to begin!")
