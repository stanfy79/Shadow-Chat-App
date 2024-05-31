import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);
const conversationInDb = ref(database, 'messages');
const chatbotConversation = document.querySelector('.chats');
const sendImageButton = document.getElementById("send-image-button")
const promptBox = document.querySelector(".prompt-box");
const userNameInput = document.querySelector("#user-name-input");
const acceptButton = document.querySelector(".accept-button");
const fileInput = document.getElementById('file-upload');

acceptButton.addEventListener('click', () => {
    const userName = userNameInput.value;
    promptBox.style.display = "none";
    push(conversationInDb, {
        user: userName,
        content: `${userName} joins chat`,
        type: 'join'
    });
});

document.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInput = document.querySelector('.user-input');
    push(conversationInDb, {
        user: userNameInput.value,
        content: userInput.value,
        timestamp: Date.now(),
        blockId: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        type: 'message'
    });
    userInput.value = '';
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

// Fetch and render messages from Firebase in real-time
function listenForNewMessages() {
    onChildAdded(conversationInDb, (snapshot) => {
        const message = snapshot.val();
        const replyIcon = document.createElement("img");
        replyIcon.setAttribute("src", "reply-all-svgrepo-com.svg")
        replyIcon.classList.add("reply-icon")

        if (message.type === 'join') {
            const newlyJoinedUser = document.createElement("div");
            const newlyJoinedUserText = document.createElement("span");
            newlyJoinedUser.classList.add("newlyjoined");
            newlyJoinedUserText.textContent = message.content;
            newlyJoinedUser.appendChild(newlyJoinedUserText);
            chatbotConversation.appendChild(newlyJoinedUser);
        } else if (message.type === 'image') {
            const newImageContainer = document.createElement('div');
            const newImageName = document.createElement('span');
            const newImageSent = document.createElement("img");

            newImageContainer.classList.add('general-speech-container');
            newImageName.classList.add('userName', `speech-by-${message.user === userNameInput.value ? 'user' : 'other'}`);
            newImageSent.classList.add("new-image-sent");

            newImageName.textContent = message.user;
            newImageSent.src = message.url;

            newImageContainer.appendChild(newImageName);
            newImageContainer.appendChild(newImageSent);
            newImageContainer.appendChild(replyIcon)
            chatbotConversation.appendChild(newImageContainer);
        } else {
            const newSpeechBubbleContainer = document.createElement('div');
            const newSpeechBubbleName = document.createElement('span');
            const newSpeechBubble = document.createElement('div');
            const newSpeechBubbleTime = document.createElement('span');

            newSpeechBubbleTime.classList.add("messages-timestamp")

            newSpeechBubbleContainer.classList.add('general-speech-container');
            newSpeechBubble.classList.add('speech', `speech-${message.user === userNameInput.value ? 'human' : 'ai'}`);
            newSpeechBubbleName.classList.add('userName', `speech-by-${message.user === userNameInput.value ? 'user' : 'other'}`);

            newSpeechBubbleName.textContent = message.user;
            newSpeechBubble.textContent = message.content;
            newSpeechBubbleTime.textContent = message.timestamp;

            newSpeechBubbleContainer.appendChild(newSpeechBubbleName);
            newSpeechBubbleContainer.appendChild(newSpeechBubble);
            newSpeechBubbleContainer.appendChild(replyIcon);
            newSpeechBubbleContainer.appendChild(newSpeechBubbleTime);
            chatbotConversation.appendChild(newSpeechBubbleContainer);
        }

        chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
    });
}

listenForNewMessages();

// Image upload function
function uploadImage() {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }
    imagePreviewContainer.style.display = "none"
    const storageReference = storageRef(storage, `images/${file.name}`);
    uploadBytes(storageReference, file).then((snapshot) => {
        console.log('Uploaded a blob or file!', snapshot);
        getDownloadURL(snapshot.ref).then((downloadURL) => {
            const userName = userNameInput.value;
            const imageMessage = {
                user: userName,
                blockId: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
                url: downloadURL,
                type: 'image'
            };
            push(conversationInDb, imageMessage);
        });
    }).catch((error) => {
        console.error('Upload failed', error);
    });
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
}

closeImagePreview.addEventListener("click", () => {
    imagePreviewContainer.style.display = "none"
})

sendImageButton.addEventListener('click', uploadImage);

// Image preview function
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});


// reply preview function
const replyButton = document.querySelector(".reply-icon")
const replySendButton = document.querySelector(".submit-btn")

replyButton.addEventListener("click", function() {
    const replyPreview = document.createElement("div")
    const replyPreviewName = document.createElement("span")
    const replyPreviewContent = document.createElement("span")

    replyPreview.appendChild(replyPreviewName)
    replyPreview.appendChild(replyPreviewContent)
    chatbotConversation.appendChild(replyPreview)

    replyPreview.classList.add("reply-preview-container")
    replySendButton.classList.add("reply-sender")
})

replySendButton.addEventListener("click", function() {
    this.classList.remove("reply-sender")
})



