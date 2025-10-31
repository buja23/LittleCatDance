import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // <-- ADICIONADO deleteField

// Global Firebase variables exposed to the window object
window.db = null;
window.auth = null;
window.userId = null;
window.isAuthReady = false;

// Firestore function exposure (required for non-module script access)
window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc;
window.updateDoc = updateDoc;
window.onSnapshot = onSnapshot;
window.serverTimestamp = serverTimestamp;
window.deleteField = deleteField; // <-- ADICIONADO deleteField


// Configuração do Firebase - SUBSTITUA COM SUAS CREDENCIAIS
const firebaseConfig = {
    apiKey: "AIzaSyCWj6u8HZoscNvResPHXpW_zdjzMNj6Uro",
    authDomain: "littlecatdance-4fb91.firebaseapp.com",
    projectId: "littlecatdance-4fb91",
    storageBucket: "littlecatdance-4fb91.firebasestorage.app",
    messagingSenderId: "649332492545",
    appId: "1:649332492545:web:83168a14d23f222ba67300"
};

// MODO DEMO (sem Firebase real - apenas local)
const DEMO_MODE = false; // Mude para false quando tiver Firebase configurado

try {
    if (!DEMO_MODE) {
        // Modo Firebase real
        const app = initializeApp(firebaseConfig);
        window.db = getFirestore(app);
        window.auth = getAuth(app);

        onAuthStateChanged(window.auth, async (user) => {
            if (user) {
                window.userId = user.uid;
            } else {
                await signInAnonymously(window.auth);
                window.userId = window.auth.currentUser?.uid;
            }
            window.isAuthReady = true;
        });
    } else {
        // Modo DEMO - simula Firebase localmente
        console.log('🎮 MODO DEMO - Funcionando sem Firebase (apenas local)');
        window.userId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
        window.isAuthReady = true;

        // Mock das funções do Firebase
        window.demoDatabase = {};
        window.doc = (db, path) => ({ path });
        window.getDoc = async (docRef) => {
            const data = window.demoDatabase[docRef.path];
            return {
                exists: () => !!data,
                data: () => data
            };
        };
        window.setDoc = async (docRef, data, options) => {
            if (options?.merge) {
                window.demoDatabase[docRef.path] = {
                    ...window.demoDatabase[docRef.path],
                    ...data
                };
            } else {
                window.demoDatabase[docRef.path] = data;
            }
            if (window.demoListeners[docRef.path]) {
                window.demoListeners[docRef.path].forEach(callback => {
                    callback({
                        exists: () => true,
                        data: () => window.demoDatabase[docRef.path]
                    });
                });
            }
        };
        window.updateDoc = async (docRef, updates) => {
            const currentData = window.demoDatabase[docRef.path] || {};
            const updatedData = { ...currentData };
            for (const [key, value] of Object.entries(updates)) {
                const keys = key.split('.');
                let obj = updatedData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) obj[keys[i]] = {};
                    obj = obj[keys[i]];
                }
                obj[keys[keys.length - 1]] = value;
            }
            window.demoDatabase[docRef.path] = updatedData;
            if (window.demoListeners[docRef.path]) {
                window.demoListeners[docRef.path].forEach(callback => {
                    callback({
                        exists: () => true,
                        data: () => window.demoDatabase[docRef.path]
                    });
                });
            }
        };
        window.demoListeners = {};
        window.onSnapshot = (docRef, callback) => {
            if (!window.demoListeners[docRef.path]) {
                window.demoListeners[docRef.path] = [];
            }
            window.demoListeners[docRef.path].push(callback);
            setTimeout(() => {
                const data = window.demoDatabase[docRef.path];
                callback({
                    exists: () => !!data,
                    data: () => data
                });
            }, 100);
            return () => {
                const index = window.demoListeners[docRef.path].indexOf(callback);
                if (index > -1) {
                    window.demoListeners[docRef.path].splice(index, 1);
                }
            };
        };
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
    console.log('⚠️ Ativando modo DEMO...');
    window.userId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
    window.isAuthReady = true;
}