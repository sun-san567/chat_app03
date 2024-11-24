// firebaseの設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_vMbR6ZcgGDEphgONLv_vNMKVbelzdUo",
    authDomain: "chatapp03-49e65.firebaseapp.com",
    projectId: "chatapp03-49e65",
    storageBucket: "chatapp03-49e65.firebasestorage.app",
    messagingSenderId: "723473268903",
    appId: "1:723473268903:web:8437de077a03b8c9fe5b82"
};

// データに接続
const app = initializeApp(firebaseConfig);
// リアルタイムデータベース
const db = getFirestore(app);

// 要素の取得
const sendButton = document.querySelector('#sendButton');
const messagesContainer = document.getElementById('messages');
const messageArea = document.querySelector('.messageArea');


function chatDocuments(fireStoreDocs) {
    const documents = [];
    fireStoreDocs.forEach(function (doc) {
        const document = {
            id: doc.id,
            data: doc.data(),
        };
        // ユニークキー
        documents.push(document);
    });
    return documents;
}

function showMessage(messageText) {
    const messageElement = document.querySelector('.message');
    messageElement.textContent = messageText;

    setTimeout(() => {
        messageElement.textContent = '';
    }, 3000);
}

async function handleClick() {
    const username = document.getElementById('username').value.trim();
    const messageText = document.getElementById('message').value.trim();

    if (!username) {
        showMessage('ユーザー名を入力してください');
        document.getElementById('username').focus();
        return;
    }

    if (!messageText) {
        showMessage('メッセージを入力してください');
        document.getElementById('message').focus();
        return;
    }

    try {
        const postData = {
            name: username,
            text: messageText,
            time: serverTimestamp()
        };
// どこに飛ばすか
        await addDoc(collection(db, "chat"), postData);
        document.getElementById('message').value = '';
        showMessage('送信しました');
    } catch (error) {
        showMessage(`エラーが発生しました: ${error.message}`);
        console.error('送信エラー:', error);
    }
}

onSnapshot(collection(db, "chat"), (querySnapshot) => {
    messagesContainer.innerHTML = '';

    const documents = chatDocuments(querySnapshot.docs);

    // タイムスタンプで並び替え（新しい順）
    documents.sort((a, b) => {
        const timeA = a.data.time?.toDate().getTime() || 0;
        const timeB = b.data.time?.toDate().getTime() || 0;
        return timeB - timeA;  // 降順（新しい順）
    });

    let messagesHTML = '';  // メッセージを一時的に格納

    documents.forEach((document) => {
        messagesHTML += `
            <div class="message">
                <strong>${document.data.name}</strong>: 
                <span>${document.data.text}</span>
                <small>${new Date(document.data.time?.toDate()).toLocaleString()}</small>
            </div>
        `;
    });

    // まとめてDOMを更新
    messagesContainer.innerHTML = messagesHTML;
    messagesContainer.scrollTop = 0;  // 最新メッセージ（上部）にスクロール
});

// エンターキーでの送信
document.getElementById('message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleClick();
    }
});

sendButton.addEventListener('click', handleClick);