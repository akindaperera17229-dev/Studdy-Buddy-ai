// DOM Elements
const chatBox = document.getElementById("chat-box");
const questionInput = document.getElementById("question");
let chatHistoryForExport = "Studdy Buddy - Study Session\n\n";

// Ensure marked.js doesn't throw errors
marked.setOptions({
    breaks: true,
    gfm: true
});

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
    if(textarea.value === '') textarea.style.height = '50px';
}

// Enter to send
function checkEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askAI();
    }
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    const icon = document.getElementById("theme-icon");
    icon.classList = isDark ? "ph-fill ph-sun" : "ph ph-moon";
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load theme on startup
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    // Default to dark mode if no preference, it looks highly modern
    if (savedTheme === 'dark' || !savedTheme) {
        document.body.classList.add("dark");
        document.getElementById("theme-icon").classList = "ph-fill ph-sun";
    }
}

// Use a quick prompt chip
function usePrompt(text) {
    let currentVal = questionInput.value.trim();
    
    // If the user already typed a topic in the box, replace [topic] with it Automatically!
    if (currentVal !== "") {
        text = text.replace('[topic]', currentVal);
        questionInput.value = text;
        questionInput.focus();
    } else {
        // Otherwise, insert the text and highlight [topic] so they can type over it
        questionInput.value = text;
        questionInput.focus();
        const topicStart = text.indexOf('[topic]');
        if (topicStart !== -1) {
            questionInput.setSelectionRange(topicStart, topicStart + 7);
        }
    }
    autoResize(questionInput);
}

// Voice setup (Speech Recognition)
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        questionInput.value += text;
        autoResize(questionInput);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
        stopVoiceRecording();
    };

    recognition.onend = function() {
        stopVoiceRecording();
    };
}

let isRecording = false;
function toggleVoice() {
    if (!recognition) {
        alert("Voice recognition is not supported in this browser.");
        return;
    }
    const btn = document.getElementById("voice-btn");
    
    if (isRecording) {
        recognition.stop();
        stopVoiceRecording();
    } else {
        recognition.start();
        isRecording = true;
        btn.classList.add("recording");
    }
}

function stopVoiceRecording() {
    isRecording = false;
    document.getElementById("voice-btn").classList.remove("recording");
}

// Pomodoro Timer Logic
let pomodoroInterval;
let timeLeft = 25 * 60; // 25 mins
let isTimerRunning = false;

document.getElementById('pomodoro-timer').addEventListener('click', togglePomodoro);

function togglePomodoro() {
    const display = document.getElementById('time-display');
    const container = document.getElementById('pomodoro-timer');

    if (isTimerRunning) {
        clearInterval(pomodoroInterval);
        isTimerRunning = false;
        container.classList.remove("running");
    } else {
        isTimerRunning = true;
        container.classList.add("running");
        pomodoroInterval = setInterval(() => {
            timeLeft--;
            let m = Math.floor(timeLeft / 60);
            let s = timeLeft % 60;
            display.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            
            if (timeLeft <= 0) {
                clearInterval(pomodoroInterval);
                isTimerRunning = false;
                container.classList.remove("running");
                alert("Pomodoro session complete! Take a 5 minute break ☕");
                timeLeft = 25 * 60;
                display.innerText = "25:00";
            }
        }, 1000);
    }
}

// Export Chat Logic
function exportChat() {
    const blob = new Blob([chatHistoryForExport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Studdy_Buddy_Notes_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Chat Logic
async function askAI() {
    const qValue = questionInput.value.trim();
    if (!qValue) return;

    // Add user message
    addMessage(qValue, "user");
    chatHistoryForExport += `**You:** ${qValue}\n\n`;
    
    questionInput.value = "";
    autoResize(questionInput);

    // Show jumping dots typing indicator
    const typingUI = addTypingIndicator();

    try {
        const res = await fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: qValue })
        });
        const data = await res.json();
        
        typingUI.remove();

        const answer = data.answer || "Sorry, I couldn't process that.";
        chatHistoryForExport += `**Studdy Buddy:** ${answer}\n\n---\n\n`;
        
        typeMessage(answer);
        
        // Pet reacts to successful reply
        animatePetReaction("Here you go!");

    } catch (err) {
        typingUI.remove();
        addMessage("Error connecting to AI. Please try again.", "bot");
    }
}

// UI Helpers
function addMessage(text, sender, isMarkdown = false) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("msg-content");
    
    if(isMarkdown) {
        contentDiv.innerHTML = marked.parse(text);
    } else {
        contentDiv.innerText = text;
    }
    
    msgDiv.appendChild(contentDiv);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return contentDiv;
}

function addTypingIndicator() {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", "bot");
    
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("msg-content", "typing-indicator");
    contentDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    
    msgDiv.appendChild(contentDiv);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

// Typewriter effect for AI responses
function typeMessage(text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", "bot");
    
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("msg-content");
    
    msgDiv.appendChild(contentDiv);
    chatBox.appendChild(msgDiv);
    
    let i = 0;
    let currentHtml = "";
    
    // Smooth markdown typing
    function typeChar() {
        if (i < text.length) {
            currentHtml += text.charAt(i);
            contentDiv.innerHTML = marked.parse(currentHtml);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Adjust speed randomly for human-like feel
            let speed = Math.random() * 10 + 5;
            setTimeout(typeChar, speed);
        } else {
            // Re-parse final logic just to be safe
            contentDiv.innerHTML = marked.parse(text);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
    
    // If response is huge, don't type it all out to avoid locking UI
    if(text.length > 1000) {
        contentDiv.innerHTML = marked.parse(text);
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        typeChar();
    }
}

// === Pet Animations ===
function animatePetReaction(text) {
    const speech = document.getElementById("pet-speech");
    if(speech) {
        speech.innerText = text;
        speech.style.opacity = "1";
        speech.style.transform = "translateY(0) scale(1)";
        setTimeout(() => {
            speech.style.opacity = "";
            speech.style.transform = "";
        }, 3000);
    }
}

// Draggable and Clickable Pet Logic
const petContainer = document.getElementById("pet-container");
if (petContainer) {
    const phrases = ["You got this!", "Keep studying!", "I'm your buddy!", "Stay focused! 🚀", "Boop!", "I love learning!"];
    
    let isDragging = false;
    let hasDragged = false;
    let offsetX, offsetY;

    function startDrag(e) {
        if (e.target.closest('.pet-speech-bubble')) return; // ignore speech bubble clicks
        
        let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        let rect = petContainer.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        
        isDragging = true;
        hasDragged = false;
        petContainer.style.transition = 'none';
        
        document.addEventListener('mousemove', drag, {passive: false});
        document.addEventListener('touchmove', drag, {passive: false});
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        hasDragged = true;
        e.preventDefault(); // prevent scrolling while dragging pet
        
        let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        petContainer.style.left = (clientX - offsetX) + 'px';
        petContainer.style.top = (clientY - offsetY) + 'px';
        petContainer.style.right = 'auto'; 
        petContainer.style.bottom = 'auto'; 
    }

    function endDrag() {
        isDragging = false;
        petContainer.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    }

    petContainer.addEventListener('mousedown', startDrag);
    petContainer.addEventListener('touchstart', startDrag, {passive: false});

    // Handle normal clicks (only if user didn't drag it)
    petContainer.addEventListener("click", (e) => {
        if (hasDragged) {
            hasDragged = false;
            return;
        }
        petContainer.style.transform = "scale(0.9)";
        setTimeout(() => petContainer.style.transform = "", 150);
        animatePetReaction(phrases[Math.floor(Math.random() * phrases.length)]);
    });
}