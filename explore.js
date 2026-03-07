document.addEventListener("DOMContentLoaded", function () {
    // --- Auth Check ---
    const currentUserJson = localStorage.getItem("loopr_current_user");
    if (!currentUserJson) {
        window.location.href = "login.html";
        return;
    }
    const currentUser = JSON.parse(currentUserJson);

    // --- Update Sidebar User Info ---
    const sidebarName = document.getElementById("sidebar-name");
    const sidebarHandle = document.getElementById("sidebar-handle");
    const sidebarAvatar = document.querySelector(".sidebar-profile .profile-pic");

    if (sidebarName) sidebarName.textContent = currentUser.fullname;
    if (sidebarHandle) sidebarHandle.textContent = currentUser.username;
    if (sidebarAvatar) sidebarAvatar.src = `https://placehold.co/40x40/1da1f2/ffffff?text=${currentUser.fullname[0].toUpperCase()}`;

    // --- Mock Data ---
    const trendsData = {
        foryou: [
            { category: "Technology • Trending", title: "#AGI", meta: "54.2K Tweets" },
            { category: "Business • Trending", title: "$TSLA", meta: "220K Tweets" },
            { category: "Trending in India", title: "#CricketWorldCup", meta: "1.2M Tweets" },
            { category: "Music • Trending", title: "Taylor Swift", meta: "89K Tweets" },
            { category: "Politics • Trending", title: "#Election2026", meta: "500K Tweets" }
        ],
        trending: [
            { category: "Trending Worldwide", title: "#LooprLaunch", meta: "2.5M Tweets" },
            { category: "Technology", title: "OpenAI", meta: "150K Tweets" },
            { category: "Food", title: "#PizzaDay", meta: "12K Tweets" }
        ],
        news: [
            { category: "US News", title: "Senate passes new bill", meta: "LIVE" },
            { category: "World", title: "Climate Summit 2026", meta: "Top story" }
        ],
        sports: [
            { category: "Basketball", title: "Lakers vs Warriors", meta: "Last night" },
            { category: "Football", title: "Champions League", meta: "Trending" }
        ],
        entertainment: [
            { category: "Movies", title: "Avengers: Secret Wars", meta: "Trailer out now" },
            { category: "K-Pop", title: "BTS Comeback", meta: "Trending" }
        ]
    };

    const suggestedUsers = [
        { name: "TechCrunch", handle: "@TechCrunch", avatar: "TC" },
        { name: "NASA", handle: "@NASA", avatar: "NA" },
        { name: "MrBeast", handle: "@MrBeast", avatar: "MB" }
    ];

    // --- Elements ---
    const exploreContainer = document.getElementById("explore-container");
    const tabs = document.querySelectorAll(".profile-tab");
    const whoToFollowList = document.getElementById("who-to-follow-list");

    // --- Render Functions ---

    function renderTrends(category) {
        exploreContainer.innerHTML = "";
        const data = trendsData[category] || trendsData["foryou"];

        // Feature Image (Hero) for "For You"
        if (category === "foryou") {
            const heroHtml = `
            <div style="position: relative; height: 260px; overflow: hidden; margin-bottom: 0px; cursor: pointer;">
                <img src="https://images.unsplash.com/photo-1546955121-d0ba64964e34?q=80&w=2000&auto=format&fit=crop" 
                    style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white;">
                    <div style="font-size: 13px; font-weight: 500;">Travel • LIVE</div>
                    <div style="font-size: 24px; font-weight: 800; margin-top: 4px;">Explore the unseen wonders of Bali</div>
                </div>
            </div>`;
            exploreContainer.insertAdjacentHTML("beforeend", heroHtml);
        }

        data.forEach((item, index) => {
            const html = `
            <div class="trend-item" style="border-bottom: 1px solid var(--gray-800); padding: 16px;">
                <div class="trend-category" style="font-size: 13px; color: var(--gray-500); display: flex; justify-content: space-between;">
                    <span>${item.category}</span>
                    <i class="fa-solid fa-ellipsis" style="color: var(--gray-500); cursor: pointer;"></i>
                </div>
                <div class="trend-name" style="font-size: 16px; margin: 2px 0;">${item.title}</div>
                <div class="trend-tweets" style="font-size: 13px; color: var(--gray-500);">${item.meta}</div>
            </div>`;
            exploreContainer.insertAdjacentHTML("beforeend", html);
        });
    }

    function renderWhoToFollow() {
        whoToFollowList.innerHTML = "";
        suggestedUsers.forEach(user => {
            const html = `
            <div class="trend-item" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                <img src="https://placehold.co/40x40/333/fff?text=${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%;">
                <div style="flex-grow: 1;">
                    <div style="font-weight: 700; font-size: 15px;">${user.name}</div>
                    <div style="color: var(--gray-500); font-size: 14px;">${user.handle}</div>
                </div>
                <button class="tweet-button" style="padding: 6px 16px; background: white; color: black; font-size: 14px;">Follow</button>
            </div>`;
            whoToFollowList.insertAdjacentHTML("beforeend", html);
        });

        // Add "Show more" link
        whoToFollowList.insertAdjacentHTML("beforeend", `
            <div class="trend-item last-trend-item" style="color: var(--x-pink); font-size: 15px; padding: 16px;">
                Show more
            </div>
        `);
    }

    // --- Event Listeners ---
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove("active"));
            // Add to clicked
            tab.classList.add("active");
            // Render
            renderTrends(tab.dataset.category);
        });
    });

    // --- Init ---
    renderTrends("foryou");
    renderWhoToFollow();

});
