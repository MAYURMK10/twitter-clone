document.addEventListener("DOMContentLoaded", function () {
    const feedContainer = document.getElementById("feed-container");
    const tweetBtn = document.getElementById("tweet-btn");
    const inputElement = document.getElementById("post-input");

    // --- Auth Check ---
    const currentUserJson = localStorage.getItem("loopr_current_user");
    if (!currentUserJson) {
        window.location.href = "login.html"; // Enforce login
        return; // Stop execution
    }
    const currentUser = JSON.parse(currentUserJson);

    // Global State
    let currentImages = []; // Array to store multiple images

    // Load Tweets
    let tweets = JSON.parse(localStorage.getItem("loopr_tweets") || "[]"); // Fixed key inconsistency

    // Initial Load - If empty, add dummy data
    if (tweets.length === 0) {
        tweets = [
            {
                id: 1,
                user: "Elon Musk",
                handle: "@elonmusk",
                time: "2h",
                text: "Just bought a new planet. Any name suggestions? 🚀🪐",
                image: null,
                likes: 42000,
                retweets: 6900,
                comments: 1205,
                liked: false,
                retweeted: false,
                isCurrentUser: false // Explicitly false for dummy data
            },
            {
                id: 2,
                user: "Loopr Official",
                handle: "@loopr",
                time: "5h",
                text: "Welcome to Loopr! The future of social media is here. #loopr #tech",
                image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
                likes: 1200,
                retweets: 350,
                comments: 56,
                liked: false,
                retweeted: false,
                isCurrentUser: false
            }
        ];
        saveTweets();
    }

    // --- Update UI with Current User Info ---
    if (currentUser) {
        // Update Sidebar Profile
        const sidebarName = document.getElementById("sidebar-name");
        const sidebarHandle = document.getElementById("sidebar-handle");

        if (sidebarName) sidebarName.textContent = currentUser.fullname;
        if (sidebarHandle) sidebarHandle.textContent = currentUser.username;

        // Update Post Bar Avatar (Optional - using initial)
        const postAvatar = document.querySelector(".post-bar .profile-pic");
        if (postAvatar && currentUser.fullname) {
            postAvatar.src = `https://placehold.co/40x40/1da1f2/ffffff?text=${currentUser.fullname[0].toUpperCase()}`;
        }
    }

    function saveTweets() {
        localStorage.setItem("loopr_tweets", JSON.stringify(tweets)); // Fixed key
    }

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
        tweets.forEach(tweet => {
            const tweetHtml = createTweetHtml(tweet);
            feedContainer.insertAdjacentHTML("beforeend", tweetHtml);
        });
    }

    function createTweetHtml(tweet) {
        // Safe check for missing properties if old data exists
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
            // Simple grid style inline for now
            let gridStyle = "display: grid; gap: 4px; border-radius: 16px; overflow: hidden; margin-top: 12px;";
            if (imgCount === 1) gridStyle += "grid-template-columns: 1fr;";
            else gridStyle += "grid-template-columns: 1fr 1fr;";

            const imgs = tweet.images.map(img => `<img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">`).join("");
            imagesHtml = `<div class="tweet-images-grid" style="${gridStyle}">${imgs}</div>`;
        } else if (tweet.image) {
            // Fallback for old single image
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
                <div class="poll-option" data-tweet-id="${tweet.id}" data-option-index="${index}" style="margin-bottom: 8px; cursor: pointer; position: relative;">
                    <div style="background: rgba(29, 161, 242, 0.2); height: 32px; width: ${barWidth}; border-radius: 4px; position: absolute; transition: width 0.3s;"></div>
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
                <img src="https://placehold.co/40x40/f10d87/ffffff?text=${tweet.user[0]}" class="profile-pic">
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
                        <div class="action-stat comment-stat" data-id="${tweet.id}">
                            <i class="fa-regular fa-comment action-svg"></i> ${comments}
                        </div>
                        <div class="action-stat repost-stat" data-id="${tweet.id}" ${retweetClass}>
                            <i class="fa-solid fa-retweet action-svg"></i> ${retweets}
                        </div>
                        <div class="action-stat like-stat" data-id="${tweet.id}" ${likeColor}>
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

    // --- Image Upload Logic ---
    const imageIcon = document.getElementById("image-icon");
    const imageInput = document.getElementById("image-input");
    const previewContainer = document.getElementById("image-preview-container");
    const imagePreview = document.getElementById("image-preview");
    const removeImageBtn = document.getElementById("remove-image-btn");

    if (imageIcon) {
        imageIcon.addEventListener("click", () => imageInput.click());

        imageInput.addEventListener("change", function () {
            // Handle Multiple Files if input allows, currently we process one by one appends
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const result = e.target.result;
                    currentImages.push(result); // Add to global array

                    // Add to preview UI
                    const img = document.createElement("img");
                    img.src = result;
                    img.style.width = "60px";
                    img.style.height = "60px";
                    img.style.borderRadius = "8px";
                    img.style.objectFit = "cover";
                    img.style.border = "1px solid var(--gray-700)";

                    // Ensure preview container has a grid/flex layout
                    if (previewContainer.children.length === 0 || previewContainer.querySelector("#image-preview")) {
                        // Reset if it was the old single preview
                        previewContainer.innerHTML = "";
                        previewContainer.style.display = "flex";
                        previewContainer.style.gap = "8px";
                        previewContainer.style.flexWrap = "wrap";

                        // Add a clear button (simplified for now)
                        const clearBtn = document.createElement("button");
                        clearBtn.innerText = "❌";
                        clearBtn.style.background = "none";
                        clearBtn.style.border = "none";
                        clearBtn.style.color = "red";
                        clearBtn.style.cursor = "pointer";
                        clearBtn.onclick = () => {
                            currentImages = [];
                            previewContainer.innerHTML = "";
                            previewContainer.style.display = "none";
                            imageInput.value = "";
                        };
                        previewContainer.appendChild(clearBtn);
                    }

                    previewContainer.insertBefore(img, previewContainer.lastChild); // Insert before X button
                    previewContainer.style.display = "flex";
                };
                reader.readAsDataURL(file);
            }
        });

        // Remove Button (Old) - can remove or repurpose
        if (removeImageBtn) {
            removeImageBtn.style.display = "none"; // Hide old button
        }
    }

    // --- Poll Logic ---
    const pollIcon = document.getElementById("poll-icon");
    const pollContainer = document.getElementById("poll-creator-container");
    const pollOption1 = document.getElementById("poll-option-1");
    const pollOption2 = document.getElementById("poll-option-2");
    const removePollBtn = document.getElementById("remove-poll-btn");

    let isPollActive = false;

    if (pollIcon) {
        pollIcon.addEventListener("click", () => {
            isPollActive = true;
            pollContainer.style.display = "block";
            previewContainer.style.display = "none";
            currentImages = [];
        });

        removePollBtn.addEventListener("click", () => {
            isPollActive = false;
            pollContainer.style.display = "none";
            pollOption1.value = "";
            pollOption2.value = "";
        });
    }

    // --- Emoji Picker Logic ---
    const emojiIcon = document.getElementById("emoji-icon");
    const emojiContainer = document.getElementById("emoji-picker-container");

    if (emojiIcon && emojiContainer) {
        emojiIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            const isVisible = emojiContainer.style.display === "block";
            emojiContainer.style.display = isVisible ? "none" : "block";

            // Reposition if needed
            const rect = emojiIcon.getBoundingClientRect();
            // emojiContainer.style.top = (rect.bottom + window.scrollY + 10) + "px"; // Optional absolute positioning logic
        });

        // Add emoji to input
        emojiContainer.querySelectorAll("span").forEach(span => {
            span.addEventListener("click", function () {
                inputElement.value += this.innerText;
                emojiContainer.style.display = "none";
                inputElement.focus();
            });
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
            if (!emojiContainer.contains(e.target) && e.target !== emojiIcon) {
                emojiContainer.style.display = "none";
            }
        });
    }

    // --- Schedule Logic ---
    const scheduleIcon = document.getElementById("schedule-icon");
    const scheduleContainer = document.getElementById("schedule-picker-container");
    const scheduleInput = document.getElementById("schedule-input");
    const confirmScheduleBtn = document.getElementById("confirm-schedule-btn");
    const cancelScheduleBtn = document.getElementById("cancel-schedule-btn");

    if (scheduleIcon && scheduleContainer) {
        scheduleIcon.addEventListener("click", () => {
            const isVisible = scheduleContainer.style.display === "block";
            scheduleContainer.style.display = isVisible ? "none" : "block";

            // Set min date to now
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            scheduleInput.min = now.toISOString().slice(0, 16);
        });

        cancelScheduleBtn.addEventListener("click", () => {
            scheduleContainer.style.display = "none";
            scheduleInput.value = "";
        });

        confirmScheduleBtn.addEventListener("click", () => {
            const dateVal = scheduleInput.value;
            const tweetText = inputElement.value.trim();

            if (!dateVal) {
                alert("Please select a date and time.");
                return;
            }
            if (!tweetText && currentImages.length === 0 && !isPollActive) {
                alert("Cannot schedule an empty tweet!");
                return;
            }

            const scheduledDate = new Date(dateVal);
            const now = new Date();
            const delay = scheduledDate - now;

            if (delay < 0) {
                alert("Please select a future time!");
                return;
            }

            // Success feedback
            alert(`✅ Tweet scheduled for ${scheduledDate.toLocaleTimeString()}! (Keep this tab open)`);

            // Capture state NOW (before cleanup) to ensure it survives the delay
            const capturedImages = [...currentImages];
            const capturedPoll = getPollData();

            // Schedule the tweet
            setTimeout(() => {
                // Use captured values, NOT global variables
                const newTweet = createTweetObject(tweetText, capturedImages, capturedPoll);

                tweets.unshift(newTweet);
                saveTweets();
                renderFeed();

                // Optional: Play a sound or show a notification
                alert(`🚀 Your scheduled tweet has been posted: "${newTweet.text}"`);
            }, delay);

            // Cleanup UI immediately
            scheduleContainer.style.display = "none";
            scheduleInput.value = "";
            inputElement.value = "";
            currentImages = [];
            isPollActive = false;
            pollContainer.style.display = "none";
            if (pollOption1) pollOption1.value = "";
            if (pollOption2) pollOption2.value = "";
            previewContainer.style.display = "none";
        });
    }

    // --- Actions ---

    // Sidebar Tweet Button Focus (Removed)

    // Helper: Get Poll Data
    function getPollData() {
        if (!isPollActive) return null;
        const opt1 = pollOption1.value.trim() || "Yes";
        const opt2 = pollOption2.value.trim() || "No";
        return {
            options: [
                { text: opt1, votes: 0 },
                { text: opt2, votes: 0 }
            ],
            voted: false
        };
    }

    // Helper: Create Tweet Object
    function createTweetObject(text, images, poll) {
        return {
            id: Date.now(),
            text: text,
            images: [...images], // Clone array
            poll: poll,
            user: currentUser.fullname || "Loopr User",    // Dynamic Name
            handle: currentUser.username || "@loopr_user", // Dynamic Handle
            time: new Date().toISOString(),
            likes: 0,
            retweets: 0,
            comments: 0,
            liked: false,
            retweeted: false,
            isCurrentUser: true
        };
    }

    tweetBtn.addEventListener("click", function () {
        const tweetText = inputElement.value.trim();

        // Allow tweet if it has text OR images OR a poll
        if (!tweetText && currentImages.length === 0 && !isPollActive) {
            alert("Tweet cannot be empty!");
            return;
        }

        const pollData = getPollData();
        const newTweet = createTweetObject(tweetText, currentImages, pollData);

        tweets.unshift(newTweet); // Add to beginning

        // Reset state
        currentImages = [];
        if (imageInput) imageInput.value = "";
        if (previewContainer) previewContainer.style.display = "none";

        isPollActive = false;
        if (pollContainer) pollContainer.style.display = "none";
        if (pollOption1) pollOption1.value = "";
        if (pollOption2) pollOption2.value = "";

        saveTweets();
        renderFeed();
        inputElement.value = "";
    });

    feedContainer.addEventListener("click", function (e) {

        // Poll Vote
        const pollOptionBtn = e.target.closest(".poll-option");
        if (pollOptionBtn) {
            const tweetId = parseInt(pollOptionBtn.dataset.tweetId);
            const optionIndex = parseInt(pollOptionBtn.dataset.optionIndex);

            const tweet = tweets.find(t => t.id === tweetId);
            if (tweet && tweet.poll && !tweet.poll.voted) {
                tweet.poll.options[optionIndex].votes++;
                tweet.poll.voted = true;
                saveTweets();
                renderFeed();
            }
            return;
        }

        // Like
        const likeBtn = e.target.closest(".like-stat");
        if (likeBtn) {
            const id = parseInt(likeBtn.dataset.id);
            const tweet = tweets.find(t => t.id === id);
            if (tweet) {
                tweet.liked = !tweet.liked;
                tweet.likes += tweet.liked ? 1 : -1;
                saveTweets();
                renderFeed();
            }
            return;
        }

        // Retweet
        const rtBtn = e.target.closest(".repost-stat");
        if (rtBtn) {
            const id = parseInt(rtBtn.dataset.id);
            const tweet = tweets.find(t => t.id === id);
            if (tweet) {
                tweet.retweeted = !tweet.retweeted;
                tweet.retweets += tweet.retweeted ? 1 : -1;
                saveTweets();
                renderFeed();
            }
            return;
        }

        // Comment (Mock)
        const commentBtn = e.target.closest(".comment-stat");
        if (commentBtn) {
            const id = parseInt(commentBtn.dataset.id);
            const tweet = tweets.find(t => t.id === id);
            if (tweet) {
                // Just increment for visual feedback
                tweet.comments += 1;
                saveTweets();
                renderFeed();
            }
            return;
        }

        // Delete
        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (confirm("Are you sure you want to delete this tweet?")) {
                tweets = tweets.filter(t => t.id !== id);
                saveTweets();
                renderFeed();
            }
            return;
        }
    });

    // Initial Render
    renderFeed();

});
