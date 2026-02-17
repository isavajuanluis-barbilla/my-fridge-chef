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
    st.info("MVP v1.7 | The 'Perfect' Version")

st.title("🍳 Smart Sous-Chef")

# --- 3. App Logic ---
if api_key:
    try:
        genai.configure(api_key=api_key)
        # Using the specific 2.5 Flash model confirmed for your key
        model = genai.GenerativeModel('gemini-2.5-flash')

        tabs = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal", "🎲 Chef's Choice", "🗓️ Calendar Planner"])
        tab1, tab2, tab3, tab4 = tabs

        # --- TAB 1: FRIDGE SCAN ---
        with tab1:
            st.subheader("What's in the kitchen?")
            source = st.radio("Source:", ["Upload Image", "Use Camera"])
            img_file = st.file_uploader("Photo", type=['jpg','png']) if source == "Upload Image" else st.camera_input("Scan")

            if img_file and st.button("Analyze & Suggest"):
                img = Image.open(img_file)
                with st.spinner("Analyzing ingredients..."):
                    response = model.generate_content([f"Identify ingredients and suggest 3 recipes for {num_people} people. For each, list ingredients and quantities.", img])
                    st.markdown(response.text)
                    st.session_state['last_res'] = response.text

        # --- TAB 2: MEAL PLANNER ---
        with tab2:
            st.subheader("Specific Recipe Search")
            meal_req = st.text_input("What are you craving?")
            if meal_req and st.button("Get Recipe"):
                with st.spinner("Generating..."):
                    response = model.generate_content(f"Full recipe for {meal_req} scaled for {num_people} people. Include specific quantities and a SHOPPING LIST.")
                    st.markdown(response.text)
                    st.session_state['last_res'] = response.text

        # --- TAB 3: CHEF'S CHOICE ---
        with tab3:
            st.subheader("Let the AI Decide")
            c1, c2, c3 = st.columns(3)
            with c1: m_type = st.selectbox("Meal", ["Breakfast", "Lunch", "Dinner"])
            with c2: cuisine = st.selectbox("Style", ["Italian", "Japanese", "Mexican", "Mediterranean"])
            with c3: health = st.select_slider("Vibe", options=["Greasy", "Balanced", "Healthy"])

            if st.button("Surprise Me!"):
                with st.spinner("Thinking..."):
                    prompt = f"Suggest a {health} {cuisine} {m_type} for {num_people}. Include ingredients and quantities and a SHOPPING LIST."
                    response = model.generate_content(prompt)
                    st.markdown(response.text)
                    st.session_state['last_res'] = response.text

        # --- TAB 4: CALENDAR PLANNER (WITH SHOPPING LINKS) ---
        with tab4:
            st.subheader("Plan Your Future Meals")
            selected_meals = st.multiselect("Which meals?", ["Breakfast", "Lunch", "Dinner"], default=["Lunch", "Dinner"])
            
            col_p1, col_p2 = st.columns(2)
            with col_p1: timeframe = st.radio("Timeframe", ["Weekly (7 Days)", "Monthly (4 Weeks)"])
            with col_p2: diet_goal = st.selectbox("Focus", ["Quick & Easy", "High Protein", "Budget Friendly", "Vegetarian"])

            if st.button("Generate Full Plan") and selected_meals:
                with st.spinner(f"Architecting {timeframe} plan..."):
                    meals_str = ", ".join(selected_meals)
                    # Prompt designed to force the links you wanted
                    prompt = f"""Create a {timeframe} meal plan for {num_people} people focused on {diet_goal}. 
                              ONLY plan: {meals_str}. 
                              FOR EACH DAY: 
                              1. List the meals.
                              2. Under the meals, list the exact INGREDIENTS and QUANTITIES needed.
                              3. Provide a '🛒 Quick Google Shop' link that searches for those ingredients.
                              Use headers like **Day 1**, **Day 2**. End with 'MASTER SHOPPING LIST'."""
                    
                    response = model.generate_content(prompt)
                    plan_text = response.text
                    st.markdown(plan_text)
                    st.session_state['last_res'] = plan_text

                    try:
                        calendar = Calendar()
                        days_split = plan_text.split("**Day")
                        for i, content in enumerate(days_split[1:], 1):
                            event = Event(
                                summary=f"🍴 {meals_str} (Day {i})",
                                description=content.strip()[:500], # Puts ingredients/quantities in calendar notes
                                start=(datetime.now() + timedelta(days=i)).date(),
                            )
                            calendar.events.append(event)
                        
                        ics_data = "\n".join(calendar.ics())
                        st.download_button("📅 Download .ics Calendar File", data=ics_data, file_name="my_meal_plan.ics", mime="text/calendar")
                    except Exception as cal_e:
                        st.error(f"Calendar error: {cal_e}")

        # --- UNIVERSAL SMS TOOL ---
        if 'last_res' in st.session_state and "SHOPPING LIST" in
