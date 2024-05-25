import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded } from 'firebase/database';
import { SpeedInsights } from "@vercel/speed-insights/next"

// Firebase configuration
const appSettings = {
    apiKey: "AIzaSyDUvqx88wgcMDT7RWktjlYZ62IgA-z0YTk",
    authDomain: "chatbot-911ad.firebaseapp.com",
    databaseURL: "https://chatbot-911ad-default-rtdb.firebaseio.com",
    projectId: "chatbot-911ad",
    storageBucket: "chatbot-911ad.appspot.com",
    messagingSenderId: "591748096374",
    appId: "1:591748096374:web:2f8752ce4db6fcd85e9a57",
    measurementId: "G-GSHM7RB7M0"
};

// Initialize Firebase
const app = initializeApp(appSettings);
const database = getDatabase(app);
const conversationInDb = ref(database, 'messages');
const chatbotConversation = document.querySelector('.chats');
const promptBox = document.querySelector(".prompt-box");
const userNameInput = document.querySelector("#user-name-input");
const acceptButton = document.querySelector(".accept-button");

acceptButton.addEventListener('click', () => {
    const userName = userNameInput.value;
    promptBox.style.display = "none";
    push(conversationInDb, {
        newUsers: `${userName} joins chat`,
        type: 'join'
    });
});

document.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInput = document.querySelector('.user-input');
    push(conversationInDb, {
        user: userNameInput.value,
        content: userInput.value,
        type: 'message'
    });
    userInput.value = '';
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

// Fetch and render messages from Firebase in real-time
function listenForNewMessages() {
    onChildAdded(conversationInDb, (snapshot) => {
        const message = snapshot.val();
        const newSpeechBubbleContainer = document.createElement('div');
        const newSpeechBubbleName = document.createElement('span');
        const newSpeechBubble = document.createElement('div');
        newSpeechBubbleContainer.appendChild(newSpeechBubbleName);
        newSpeechBubbleContainer.appendChild(newSpeechBubble);
        newSpeechBubbleContainer.classList.add('general-speech-container');

        const newlyJoinedUser = document.createElement("div")
        const newlyJoinedUserText = document.createElement("span")
        newlyJoinedUser.appendChild(newlyJoinedUserText)
        newlyJoinedUser.classList.add("newlyjoined")
        if(message.type === 'join') {
            chatbotConversation.appendChild(newlyJoinedUser)
        } else {
            newSpeechBubble.classList.add(
                'speech',
                `speech-${message.user === userNameInput.value ? 'human' : 'ai'}`
            );
            newSpeechBubbleName.classList.add(
                'userName',
                `speech-by-${message.user === userNameInput.value ? 'user' : 'other'}`
            ); 
        
        chatbotConversation.appendChild(newSpeechBubbleContainer);
        }
        newSpeechBubbleName.textContent = message.user;
        newSpeechBubble.textContent = message.content;
        newSpeechBubble.setAttribute('data-user-id', message.userId)
        newlyJoinedUserText.textContent = message.newUsers
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
    });
}

listenForNewMessages();
<SpeedInsights/>