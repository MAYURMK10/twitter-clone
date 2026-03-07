# Loopr Project - Viva Preparation Guide

This document covers the technical details of your project to help you answer questions during your viva.

## 1. Project Overview
*   **Name**: Loopr
*   **Type**: Social Media Platform (Twitter/X Clone)
*   **Architecture**: Frontend-only (Single Page Application feel).
*   **Tech Stack**: HTML5, CSS3, Vanilla JavaScript.
*   **Database**: `localStorage` (Browser-based persistence).

## 2. Key Technical Concepts (The "How It Works")

### A. LocalStorage (The Database)
*   **What is it?** A web API that allows saving key/value pairs in the browser. Data persists even after the browser closes.
*   **Why use it?** To simulate a backend database without needing a server.
*   **Key Methods used**:
    *   `localStorage.getItem('key')`: Retrieve data.
    *   `localStorage.setItem('key', value)`: Save data.
    *   `JSON.stringify(object)`: Converts JS objects (like our tweet array) into a string to save it.
    *   `JSON.parse(string)`: Converts the saved string back into a JS object to use it.

### B. DOM Manipulation (The UI)
*   **What is it?** The Document Object Model. It's how JavaScript interacts with HTML.
*   **Key Methods**:
    *   `document.getElementById()`: finding elements.
    *   `element.addEventListener()`: Reacting to clicks, typing, etc.
    *   `innerHTML` vs `textContent`: We use `innerHTML` to inject complete Tweet cards (divs, images, spans) dynamically.

### C. Authentication (Login/Signup)
*   **How it works**: We store an array of user objects (`users`) in LocalStorage.
*   **Signup**: We create a new object `{ username, password, fullname }` and push it to the array.
*   **Login**: We search the array (`users.find()`) for a match.
*   **Session**: We save the currently logged-in user in a separate key `loopr_current_user`.
*   **Protection**: On `index.html` load, we check if `loopr_current_user` exists. If not -> `window.location.href = 'login.html'`.

### D. Image Uploading
*   **API Used**: `FileReader` API.
*   **Process**:
    1.  User selects file (`<input type="file">`).
    2.  `FileReader` reads the file as a **Data URL** (Base64 string).
    3.  This string converts the image into text characters so it can be saved in LocalStorage directly.

### E. Scheduling Tweets
*   **Concept**: Asynchronous Programming.
*   **Method**: `setTimeout(function, delay)`.
*   **Logic**: We calculate `delay = ScheduledTime - CurrentTime`.
*   **Closure**: We capture the tweet data *before* the timer starts so that even if the user clears the form, the scheduled tweet remembers what to post.

## 3. Potential Viva Questions & Answers

**Q: Why did you choose Vanilla JS instead of React/Angular?**
*   **A:** To demonstrate a strong understanding of core JavaScript fundamentals (DOM manipulation, Event Listeners, State Management) without relying on framework abstractions.

**Q: Does the data persist if I open the app on another computer?**
*   **A:** No. `localStorage` is specific to the browser and device. Since there is no cloud backend, data lives only on this machine.

**Q: How do you handle multiple images?**
*   **A:** I used an array (`[]`) to store base64 strings of images. In the UI, I check the length of this array and apply different CSS grid classes (`one-img`, `two-imgs`) to lay them out correctly.

**Q: How does the search function work?**
*   **A:** (If implemented) It would typically filter the `tweets` array based on the `text` property using `.filter()` and string matching `.includes()`.

**Q: What happens if I refresh the page?**
*   **A:** The `DOMContentLoaded` event fires. It reads the full array of tweets from LocalStorage and re-renders them. This makes the app feel persistent.

**Q: Explain the Poll feature.**
*   **A:** A poll is part of the tweet object. It has an `options` array. When a user specific option, I increment the `vote` count for that index and re-calculate the percentages for the progress bars.

**Q: What triggers the delete button visibility?**
*   **A:** A simple conditional check: `if (tweet.username === currentUser.username)`. If true, I render the delete icon; otherwise, I don't.

## 4. Code Structure
*   **`index.html`**: The skeleton/structure.
*   **`style.css`**: The look and feel (Dark mode variables, Flexbox layouts).
*   **`feed.js`**: The brain. Handles posting, rendering feed, interactions.
*   **`auth.js`**: The bouncer. Handles login, signup, and logout.

## 5. Future Scope & AI Integration (Bonus)
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
### AI Sentiment Analysis (Mood Detector)
*   **Goal**: Detect if a tweet is **Positive** 🟢, **Negative** 🔴, or **Neutral** ⚪ in real-time.
*   **Algorithm**: "Bag of Words" (Token-based analysis).
*   **Logic**:
    1.  Maintain a list of **positive words** (e.g., *good, happy, great, love*) and **negative words** (e.g., *bad, sad, hate, angry*).
    2.  Split user input into an array of words (tokens).
    3.  Count matches against both lists.
    4.  **Score** = `PositiveMatches` - `NegativeMatches`.
    5.  **Result**: 
        *   Score > 0 : **Positive**
        *   Score < 0 : **Negative**
        *   Score = 0 : **Neutral**
*   **Why Client-Side?**: It is fast, privacy-focused (text doesn't leave the browser), and demonstrates efficient string manipulation in JavaScript.
