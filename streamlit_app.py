import streamlit as st
import google.generativeai as genai
from PIL import Image
import urllib.parse
from ics import Calendar, Event
from datetime import datetime, timedelta

st.set_page_config(page_title="Smart Sous-Chef", page_icon="🍳")

# 1. Sidebar
with st.sidebar:
    st.title("⚙️ Settings")
    api_key = st.text_input("Enter Gemini API Key", type="password")
    num_people = st.slider("How many people?", 1, 10, 2)

st.title("🍳 Smart Sous-Chef")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3-flash')

    tabs = st.tabs(["📸 Fridge Scan", "📝 Plan a Meal", "🎲 Chef's Choice", "🗓️ Calendar Planner"])
    tab1, tab2, tab3, tab4 = tabs

    # Tabs 1, 2, 3 logic remains standard...
    with tab1:
        source = st.radio("Source:", ["Upload Image", "Use Camera"])
        img_file = st.file_uploader("Photo", type=['jpg', 'png']) if source == "Upload Image" else st.camera_input("Scan")
        if img_file and st.button("Analyze"):
            img = Image.open(img_file)
            res = model.generate_content([f"Suggest recipes for {num_people} based on this.", img])
            st.markdown(res.text)

    with tab2:
        meal_req = st.text_input("Specific craving?")
        if meal_req and st.button("Get Recipe"):
            res = model.generate_content(f"Recipe for {meal_req} for {num_people}. Include SHOPPING LIST.")
            st.markdown(res.text)

    with tab3:
        c1, c2, c3 = st.columns(3)
        with c1: m_type = st.selectbox("Meal", ["Breakfast", "Lunch", "Dinner"])
        with c2: cuisine = st.selectbox("Style", ["Italian", "Japanese", "French", "Mexican", "Indian"])
        with c3: health = st.select_slider("Vibe", options=["Greasy", "Balanced", "Healthy"])
        if st.button("Surprise Me"):
            res = model.generate_content(f"Suggest {health} {cuisine} {m_type} for {num_people}. Include SHOPPING LIST.")
            st.markdown(res.text)

    # --- TAB 4: CALENDAR PLANNER (UPDATED) ---
    with tab4:
        st.subheader("Plan Your Future Meals")
        
        # New Multi-select for meal types
        selected_meals = st.multiselect(
            "Which meals should I plan?",
            ["Breakfast", "Lunch", "Dinner"],
            default=["Lunch", "Dinner"] # Sets your preference as the default
        )
        
        col_p1, col_p2 = st.columns(2)
        with col_p1:
            timeframe = st.radio("Timeframe", ["Weekly (7 Days)", "Monthly (4 Weeks)"])
        with col_p2:
            diet_goal = st.selectbox("Focus", ["Quick & Easy", "High Protein", "Budget Friendly", "Vegetarian"])

        if st.button("Generate Full Plan") and selected_meals:
            with st.spinner("Generating..."):
                meals_str = ", ".join(selected_meals)
                prompt = f"Create a {timeframe} meal plan for {num_people} people. Focus: {diet_goal}. \
                          ONLY plan these meals: {meals_str}. \
                          Format: Bold headers like **Day 1**, **Day 2**. End with 'MASTER SHOPPING LIST'."
                
                response = model.generate_content(prompt)
                plan_text = response.text
                st.markdown(plan_text)

                # Calendar (.ics) Export
                try:
                    c = Calendar()
                    days = plan_text.split("**Day")
                    for i, content in enumerate(days[1:], 1):
                        e = Event()
                        e.name = f"🍴 {meals_str} (Day {i})"
                        e.description = content.strip()[:300]
                        e.begin = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d 12:00:00")
                        c.events.add(e)
                    
                    st.download_button("📅 Download .ics Calendar File", data=str(c), file_name="meals.ics")
                except:
                    st.write("Plan ready! (Calendar file error - check formatting)")

else:
    st.info("👈 Enter API Key to start.")
