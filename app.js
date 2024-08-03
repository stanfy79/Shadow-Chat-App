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
    const userName = "@" + userNameInput.value;
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
        replyIcon.setAttribute("src", "https://firebasestorage.googleapis.com/v0/b/chatbot-911ad.appspot.com/o/reply-all-svgrepo-com.svg?alt=media&token=d1fd5bc9-2bc1-4ecf-8700-454a6933f267")
        replyIcon.setAttribute("alt", "reply")
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

            newImageName.textContent = "@" + message.user;
            newImageSent.src = message.url;

            newImageContainer.appendChild(newImageName);
            newImageContainer.appendChild(replyIcon)
            newImageContainer.appendChild(newImageSent);
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

            newSpeechBubbleName.textContent = "@" + message.user;
            newSpeechBubble.textContent = message.content;
            newSpeechBubbleTime.textContent = message.timestamp;

            newSpeechBubbleContainer.appendChild(newSpeechBubbleName);
            newSpeechBubbleContainer.appendChild(replyIcon);
            newSpeechBubbleContainer.appendChild(newSpeechBubble);
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


const replySendButtonSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHiSURBVHgBxZVPUsIwFMa/FGYAVxyhnkBcwbgRb6AbFTdyBDwB4QTiCcQFOONKb4AbB91YTyA3sCtFR4gvSdM/ChbGdHwzLS+kfb98ee+lANnWFa/ULrmLjI0piMCzHqFH986owcfIwBxnhnI4EmhKMC3gPAulTN6qff7CWAwazfZgUamjYjrwArJPPxfhrGWlGjbDk46NcrGEFlHXs4AqGAUfmj9eP1CX2zY64k3bUAUrvEew3BR149uGMuPUBlyWvytVEmRn3sNBm3Byj79F6WGJQnJi/q16T6Cy6OG/Kg2VVQe8RYNTtYI8Nu/2uYcUW1VpqCwnoryJzyhvv9mqSln8ZdPcQsCn3vPTcaw3arQ7ZrRIqXDQvT/kJ/GcSZljFUKeJgJu2iWE2J2rVKCTWNKMepcsn1gB08VBcj3yU3PmCNzEx7W+2tI2ZFWbmLRLDtPwfGwL6vIIkTbNofNwwK+xpC2C0KLPSmvoDve4n4DRZMUkMM/0dtqCGAthlK9tKUwexmllvyrkB4xAupmZbm6bkAQsKFk3oA5tQxIweUQJEyRWhbYgCRipqZv2Lhbh2YYkYNThGzJpsjgmb3gkx7UJScCUMugvNfRlFRLC4s2cFSSEFSfwJgWMCVLOCvIv9gV96TMYnLAEUwAAAABJRU5ErkJggg==";
const replyCancelButtonSrc = "https://firebasestorage.googleapis.com/v0/b/chatbot-911ad.appspot.com/o/cancel-svgrepo-com.svg?alt=media&token=70a126da-38e8-47c7-8dcb-f9ace98c6f25"

// reply preview function

chatbotConversation.addEventListener("click", function(e) {
    if (e.target.classList.contains("reply-icon")) {
        const replyPreview = document.createElement("div");
        const replyPreviewName = document.createElement("span");
        const replyPreviewContent = document.createElement("span");
        const replyedMessageAdded = document.createElement("span");
        const replyInputForm = document.createElement("div");
        const replyInput = document.createElement("input");
        const replySendButton = document.createElement("img");
        const replyCancelButton = document.createElement("img");
        const formContainer = document.querySelector(".form-section");
        const replyIcon = e.target
        
        
        replyPreviewName.textContent = "replying " + replyIcon.previousSibling.innerText
        replyPreviewContent.textContent = replyIcon.nextSibling.innerText

        replyPreview.appendChild(replyCancelButton);
        replyPreview.appendChild(replyPreviewName);
        replyPreview.appendChild(replyPreviewContent);
        replyInputForm.appendChild(replyInput)
        replyInputForm.appendChild(replySendButton)
        replyPreview.appendChild(replyInputForm);
        formContainer.appendChild(replyPreview);

        replyPreview.classList.add("reply-preview-container");
        replyInputForm.classList.add("reply-input-form");
        replySendButton.setAttribute("src", replySendButtonSrc)
        replyCancelButton.setAttribute("src", replyCancelButtonSrc)
        replyCancelButton.setAttribute("alt", "Cancel")

        replyCancelButton.addEventListener("click", () => {
            replyPreview.remove()
        })
        replySendButton.addEventListener("click", function() {
            const originalMessage = replyIcon.parentElement
            const replyedMessage = originalMessage.cloneNode(true)
            
            replyedMessageAdded.textContent = `@${userNameInput.value}~ ` + replyInput.value
            replyedMessageAdded.classList.add("replyedMessageAdded")
            replyedMessage.classList.add("replyed-cloned-version")
            replyedMessage.appendChild(replyedMessageAdded)
            chatbotConversation.appendChild(replyedMessage)

            const replyMessageContainer = {
                userName: userNameInput.value,
                blockId: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
                originalMessageUserName: replyPreviewName,
                originalUserMessage: replyInput.value,
            }         

            replyPreview.remove()
        });
    }
});



