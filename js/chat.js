// Firebase の設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, // Firestoreデータベースの取得
  collection, // コレクションの参照
  addDoc, // ドキュメントの追加
  serverTimestamp, // サーバー側のタイムスタンプ
  onSnapshot, // リアルタイムアップデートの監視
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebaseプロジェクトの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyA_vMbR6ZcgGDEphgONLv_vNMKVbelzdUo",
  authDomain: "chatapp03-49e65.firebaseapp.com",
  projectId: "chatapp03-49e65",
  storageBucket: "chatapp03-49e65.firebasestorage.app",
  messagingSenderId: "723473268903",
  appId: "1:723473268903:web:8437de077a03b8c9fe5b82",
};

// Firebaseアプリケーションの初期化
const app = initializeApp(firebaseConfig);
// Firestoreデータベースのインスタンスを取得
const db = getFirestore(app);

// DOMの要素を取得
const sendButton = document.querySelector("#sendButton"); // 送信ボタン
const messagesContainer = document.getElementById("messages"); // メッセージ表示領域
const messageArea = document.querySelector(".messageArea"); // メッセージ入力エリア

// Firestoreから取得したドキュメントを整形する関数
function chatDocuments(fireStoreDocs) {
  const documents = [];
  fireStoreDocs.forEach(function (doc) {
    const document = {
      id: doc.id, // ドキュメントID
      data: doc.data(), // ドキュメントデータ
    };
    // ユニークキーのプッシュ
    documents.push(document);
  });
  return documents;
}

// 一時的なメッセージを表示する関数
function showMessage(messageText) {
  const messageElement = document.querySelector(".message");
  messageElement.textContent = messageText;

  // 3秒後にメッセージを自動的に消去
  setTimeout(() => {
    messageElement.textContent = "";
  }, 3000);
}

// メッセージ送信処理を行う非同期関数
async function handleClick() {
  // フォームの値を取得し、前後の空白を削除
  const username = document.getElementById("username").value.trim();
  const messageText = document.getElementById("message").value.trim();

  // 入力値のバリデーション
  if (!username || !messageText) {
    showMessage("必要な情報を入力してください");
    return;
  }

  try {
    // 送信するデータの構造を定義
    const postData = {
      name: username,
      text: messageText,
      time: serverTimestamp(),
    };
    // chatコレクションに新しいドキュメントを追加
    await addDoc(collection(db, "chat"), postData);
    document.getElementById("message").value = "";
    showMessage("送信しました");
  } catch (error) {
    showMessage(`エラーが発生しました: ${error.message}`);
    console.error("送信エラー:", error);
  }
}
// リアルタイムでメッセージを監視・表示
onSnapshot(collection(db, "chat"), (querySnapshot) => {
  messagesContainer.innerHTML = "";
  const documents = chatDocuments(querySnapshot.docs);

  // メッセージを時系列順にソート
  documents.sort((a, b) => {
    const timeA = a.data.time?.toDate().getTime() || 0;
    const timeB = b.data.time?.toDate().getTime() || 0;
    return timeB - timeA;
  });

  // メッセージのHTML構築
  let messagesHTML = "";
  documents.forEach((document) => {
    messagesHTML += `
            <div class="message">
                <strong>${document.data.name}</strong>: 
                <span>${document.data.text}</span>
                <small>${new Date(
                  document.data.time?.toDate()
                ).toLocaleString()}</small>
            </div>
        `;
  });

  // DOMの更新とスクロール位置の調整
  messagesContainer.innerHTML = messagesHTML;
  messagesContainer.scrollTop = 0;
});

// イベントリスナーの設定
// Enterキーでの送信
document.getElementById("message").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handleClick();
  }
});

// 送信ボタンのクリックイベント
sendButton.addEventListener("click", handleClick);
