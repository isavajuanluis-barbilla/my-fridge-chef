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
    st.warning("👈 Please enter your API Key in the sidebar.")import streamlit as st
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
    model = genai.GenerativeModel('gemini-2.0-flash')

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
        
        if meal_request and st.button("ur list..."):
                prompt = f"Create a recipe for {meal_request} for {num_people} people. At the end, provide a section clearly labeled 'SHOPPING LIST' with concise bullet points."
                response = model.generate_content(prompt)
                full_text = response.text
                st.markdown(full_text)

                # Extraction for SMS
                if "SHOPPING LIST" in full_text:
                    shop_list = full_text.split("SHOPPING LIST")[-1].strip()
                    # Clean up the text for URL encoding
                    sms_body = f"Shopping List for {meal_request}:\n{shop_list}"
                    encoded_sms = urllib.parse.Generate Shopping List"):
            with st.spinner("Writing yoquote(sms_body)
                    
                    st.markdown("---")
                    st.markdown(f"### [📲 Click to Text Shopping List](sms:?&body={encoded_sms})")
                    st.caption("Note: This works best on mobile devices.")

else:
    st.warning("👈 Please enter your Gemini API Key in the sidebar to start!")

# 4. Footer
st.markdown("---")
st.capefftion("Built for icient cooking. No more 'what's for dinner' stress.
