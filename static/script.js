async function askAI() {
    const question = document.getElementById("question").value;

    const chatBox = document.getElementById("chat-box");

    if (!question) return;

    // 🟢 Add user message
    addMessage(question, "user");
    question.value = "";

    // 🤖 Typing indicator
    const typing = addMessage("Typing...", "bot");

    try {
        const res = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        const data = await res.json();

        // remove typing
        typing.remove();

        // 🟢 Add AI message with typing effect
        typeMessage(data.answer, chatBox);

    } catch (err) {
        typing.remove();
        addMessage("Error connecting to AI", "bot");
    }
}

//dark mode toggle
function toggleDark() {
    document.body.classList.toggle("dark");
}

// Add message bubble
function addMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");

    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerText = text;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    return msg;
}

// Typing animation
function typeMessage(text, chatBox) {
    const msg = document.createElement("div");
    msg.classList.add("message", "bot");
    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;

    let i = 0;
    let rawText = "";

    function typing() {
        if (i < text.length) {
            rawText += text.charAt(i);
            msg.innerHTML = marked.parse(rawText); // 🔥 Markdown rendering
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(typing, 8);
        }
    }

    typing();
}