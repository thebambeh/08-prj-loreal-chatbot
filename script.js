const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

const WORKER_URL = "https://loreal-chatbot.pram-wardhana12.workers.dev/";

const messages = [
  {
  role: "system",
  content: "You are a L'Oréal beauty assistant. Only answer questions about L'Oréal products, skincare, makeup, haircare, fragrances, beauty routines, and recommendations. Be helpful, concise, and clear. Do not invent product names or product lines that were not mentioned by the user or provided in context. If you are unsure, say you are not sure and give a general beauty recommendation instead. If the user asks something unrelated, politely redirect them back to L'Oréal beauty topics."
  },
];

addAssistantMessage(
  "👋 Hello! This is your L'Oréal beauty assistant. How can I help you today?",
);

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  addConversationTurn(userText);
  messages.push({
    role: "user",
    content: userText,
  });

  userInput.value = "";
  sendBtn.disabled = true;

  const typingBubble = addTypingBubble();

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const data = await res.json();
    typingBubble.remove();

    if (!res.ok) {
      addErrorMessage(data.error || "Request failed.");
      sendBtn.disabled = false;
      return;
    }

    const reply = data.choices[0].message.content;

    messages.push({
      role: "assistant",
      content: reply,
    });

    appendReplyToLatestTurn(reply);
  } catch (err) {
    console.error(err);
    typingBubble.remove();
    addErrorMessage("Error connecting to chatbot.");
  }

  sendBtn.disabled = false;
});

function addAssistantMessage(text) {
  const bubble = document.createElement("div");
  bubble.className = "msg ai";
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  scrollChatToBottom();
}

function addErrorMessage(text) {
  const bubble = document.createElement("div");
  bubble.className = "msg error";
  bubble.textContent = `Error: ${text}`;
  chatWindow.appendChild(bubble);
  scrollChatToBottom();
}

function addConversationTurn(userText) {
  const row = document.createElement("div");
  row.className = "chat-row";

  const questionBubble = document.createElement("div");
  questionBubble.className = "latest-question";
  questionBubble.textContent = userText;

  row.appendChild(questionBubble);
  chatWindow.appendChild(row);
  chatWindow.dataset.lastTurn = chatWindow.children.length - 1;

  scrollChatToBottom();
}

function appendReplyToLatestTurn(replyText) {
  const rowIndex = Number(chatWindow.dataset.lastTurn);
  const row = chatWindow.children[rowIndex];

  if (!row) return;

  const replyBubble = document.createElement("div");
  replyBubble.className = "msg ai";
  replyBubble.textContent = replyText;

  row.appendChild(replyBubble);
  scrollChatToBottom();
}

function addTypingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "typing";
  bubble.textContent = "Typing...";
  chatWindow.appendChild(bubble);
  scrollChatToBottom();
  return bubble;
}

function scrollChatToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
