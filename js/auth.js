import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged 
} from "firebase/auth";

const firebaseConfig = {
    // あなたのFirebase設定
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const userInfo = document.getElementById('userInfo');

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.classList.add('hide');
        logoutBtn.classList.remove('hide');
        userInfo.textContent = `${user.email}としてログイン中`;
    } else {
        loginBtn.classList.remove('hide');
        logoutBtn.classList.add('hide');
        userInfo.textContent = '';
    }
});

// ログイン処理
loginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('ログインエラー:', error.message);
        alert('ログインに失敗しました');
    }
});

// ログアウト処理
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('ログアウトエラー:', error.message);
        alert('ログアウトに失敗しました');
    }
});