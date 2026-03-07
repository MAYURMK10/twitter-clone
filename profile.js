document.addEventListener("DOMContentLoaded", function () {
    // --- Auth Check ---
    const currentUserJson = localStorage.getItem("loopr_current_user");
    if (!currentUserJson) {
        window.location.href = "login.html";
        return;
    }
    const currentUser = JSON.parse(currentUserJson);

    // --- Elements ---
    const feedContainer = document.getElementById("feed-container");
    const headerName = document.getElementById("header-name");
    const headerCount = document.getElementById("header-count");

    // Profile Header Elements
    const mainAvatar = document.getElementById("main-profile-avatar");
    const profileName = document.getElementById("profile-name");
    const profileHandle = document.getElementById("profile-handle");
    const sidebarName = document.getElementById("sidebar-name");
    const sidebarHandle = document.getElementById("sidebar-handle");
    const sidebarAvatar = document.querySelector(".sidebar-profile .profile-pic");

    // --- Load User Info ---
    const fullname = currentUser.fullname || "Loopr User";
    const username = currentUser.username || "@loopr_user";
    const avatarUrl = `https://placehold.co/150x150/1da1f2/ffffff?text=${fullname[0].toUpperCase()}`;

    // Update Text
    headerName.textContent = fullname;
    profileName.textContent = fullname;
    profileHandle.textContent = username;

    // Update Sidebar
    if (sidebarName) sidebarName.textContent = fullname;
    if (sidebarHandle) sidebarHandle.textContent = username;

    // Update Images
    if (mainAvatar) mainAvatar.src = avatarUrl;
    if (sidebarAvatar) sidebarAvatar.src = `https://placehold.co/40x40/1da1f2/ffffff?text=${fullname[0].toUpperCase()}`;


    // --- Load Tweets ---
    let tweets = JSON.parse(localStorage.getItem("loopr_tweets") || "[]");

    // Filter tweets for current user OR mock user tweets if we want to enable that later
    // For now, "Profile" means "Current User's Profile"
    const userTweets = tweets.filter(t => t.isCurrentUser || t.handle === username);

    // Update Count
    headerCount.textContent = `${userTweets.length} tweets`;

    // Render Logic
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }

    function renderFeed() {
        feedContainer.innerHTML = "";

        if (userTweets.length === 0) {
            feedContainer.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: var(--gray-500);">
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">No tweets yet</div>
                    <div>When you post tweets, they will show up here.</div>
                </div>
            `;
            return;
        }

        userTweets.forEach(tweet => {
            const tweetHtml = createTweetHtml(tweet);
            feedContainer.insertAdjacentHTML("beforeend", tweetHtml);
        });
    }

    function createTweetHtml(tweet) {
        const likes = tweet.likes || 0;
        const retweets = tweet.retweets || 0;
        const comments = tweet.comments || 0;
        const likeClass = tweet.liked ? "fa-solid" : "fa-regular";
        const likeColor = tweet.liked ? "style='color: var(--red-400)'" : "";
        const retweetClass = tweet.retweeted ? "style='color: var(--green-400)'" : "";

        // Delete button for current user
        const deleteHtml = tweet.isCurrentUser ?
            `<span class="delete-btn" data-id="${tweet.id}" style="color: var(--gray-500); cursor: pointer; margin-left: auto;">
                <i class="fa-regular fa-trash-can"></i>
            </span>` : "";

        // Logic for ONE or MULTIPLE images
        let imagesHtml = "";
        if (tweet.images && tweet.images.length > 0) {
            const imgCount = tweet.images.length;
            const gridClass = imgCount === 1 ? 'one-img' : (imgCount === 2 ? 'two-imgs' : 'more-imgs');
            let gridStyle = "display: grid; gap: 4px; border-radius: 16px; overflow: hidden; margin-top: 12px;";
            if (imgCount === 1) gridStyle += "grid-template-columns: 1fr;";
            else gridStyle += "grid-template-columns: 1fr 1fr;";

            const imgs = tweet.images.map(img => `<img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">`).join("");
            imagesHtml = `<div class="tweet-images-grid" style="${gridStyle}">${imgs}</div>`;
        } else if (tweet.image) {
            imagesHtml = `<div class="tweet-image" style="margin-top: 12px; margin-bottom: 12px;">
                 <img src="${tweet.image}" style="width: 100%; border-radius: 16px; border: 1px solid var(--gray-800);">
             </div>`;
        }

        let pollHtml = "";
        if (tweet.poll) {
            const totalVotes = tweet.poll.options.reduce((a, b) => a + b.votes, 0);
            const optionsHtml = tweet.poll.options.map((opt, index) => {
                const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                const barWidth = percent + "%";
                return `
                <div class="poll-option" style="margin-bottom: 8px; position: relative;">
                    <div style="background: rgba(29, 161, 242, 0.2); height: 32px; width: ${barWidth}; border-radius: 4px; position: absolute;"></div>
                    <div style="display: flex; justify-content: space-between; padding: 0 12px; line-height: 32px; position: relative; z-index: 1;">
                        <span style="font-weight: 700;">${opt.text}</span>
                        <span>${percent}%</span>
                    </div>
                </div>`;
            }).join("");
            pollHtml = `<div class="tweet-poll" style="margin-top: 12px;">${optionsHtml}<div style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">${totalVotes} votes</div></div>`;
        }

        return `
            <div class="tweet-card" id="tweet-${tweet.id}">
                <img src="https://placehold.co/40x40/1da1f2/ffffff?text=${fullname[0].toUpperCase()}" class="profile-pic">
                <div class="tweet-content">
                    <div class="tweet-meta">
                        <span class="tweet-name">${tweet.user}</span>
                        <span class="tweet-handle">${tweet.handle}</span>
                        <span class="tweet-time">· ${timeAgo(tweet.time)}</span>
                        ${deleteHtml}
                    </div>
                    <div class="tweet-text">${tweet.text}</div>
                    ${imagesHtml}
                    ${pollHtml}
                    <div class="tweet-actions">
                        <div class="action-stat comment-stat">
                            <i class="fa-regular fa-comment action-svg"></i> ${comments}
                        </div>
                        <div class="action-stat repost-stat" ${retweetClass}>
                            <i class="fa-solid fa-retweet action-svg"></i> ${retweets}
                        </div>
                        <div class="action-stat like-stat" ${likeColor}>
                            <i class="${likeClass} fa-heart action-svg"></i> ${likes}
                        </div>
                        <div class="action-stat share-stat">
                            <i class="fa-solid fa-arrow-up-from-bracket action-svg"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFeed();

    // Event Delegation for Deleting own tweets from profile
    feedContainer.addEventListener("click", function (e) {
        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (confirm("Are you sure you want to delete this tweet?")) {
                const globalTweets = JSON.parse(localStorage.getItem("loopr_tweets") || "[]");
                const newTweets = globalTweets.filter(t => t.id !== id);
                localStorage.setItem("loopr_tweets", JSON.stringify(newTweets));
                location.reload(); // Simple reload to refresh
            }
        }
    });

});
