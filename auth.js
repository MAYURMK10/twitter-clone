// Initialize Supabase Client
const SUPABASE_URL = 'https://qrubjrlkalevzieuirhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydWJqcmxrYWxldnppZXVpcmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTU1MjAsImV4cCI6MjA4ODQ3MTUyMH0.3U3atlTX_8aTnrSRiUtgL2dEuHkgLFibvvH5MwsS4qY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {

    // --- Sign Up Logic ---
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fullname = document.getElementById("fullname").value.trim();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username.startsWith("@")) {
                alert("Username must start with @");
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullname,
                        username: username
                    }
                }
            });

            if (error) {
                alert("Error during sign up: " + error.message);
            } else {
                alert("Account created! You can now log in.");
                window.location.href = "login.html";
            }
        });
    }

    // --- Login Logic ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert("Invalid email or password: " + error.message);
            } else {
                window.location.href = "index.html";
            }
        });
    }

    // --- Session & Logout Logic ---
    // Only check auth state dynamically when the session logic is active (like index)
    if (window.location.pathname.endsWith("index.html") ||
        window.location.pathname.endsWith("profile.html") ||
        window.location.pathname.endsWith("explore.html") ||
        window.location.pathname === "/") {
        checkSession();
    }
});

async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session) {
        // console.log("No user found, redirecting to login...");
        // window.location.href = "login.html";
    } else {
        const user = session.user;
        const metadata = user.user_metadata || {};
        // console.log("Logged in as:", metadata.username || user.email);

        // Update sidebar profile if elements exist
        const sidebarName = document.getElementById("sidebar-name");
        const sidebarHandle = document.getElementById("sidebar-handle");
        if (sidebarName && metadata.full_name) sidebarName.textContent = metadata.full_name;
        if (sidebarHandle && metadata.username) sidebarHandle.textContent = metadata.username;
    }
}

// Global Logout Function
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
    }
    window.location.href = "login.html";
}
