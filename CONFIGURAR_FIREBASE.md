# 🔥 Como Configurar o Firebase para Multiplayer Online

## 📌 Status Atual

Seu jogo está rodando em **MODO DEMO** - funciona apenas localmente (mesma aba do navegador).

Para jogar com amigos pela internet, você precisa configurar o Firebase (grátis).

---

## ✅ Passo a Passo para Configurar Firebase

### 1️⃣ Criar Conta Firebase (GRÁTIS)

1. Acesse: **https://console.firebase.google.com/**
2. Faça login com sua conta Google
3. Clique em **"Adicionar projeto"** ou **"Create a project"**
4. Dê um nome ao projeto (ex: `little-cat-dance`)
5. **Desative** o Google Analytics (opcional)
6. Clique em **"Criar projeto"**

---

### 2️⃣ Ativar o Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"** / **"Create database"**
3. Escolha **"Modo de produção"** / **"Production mode"**
4. Escolha a localização: **us-central1** (ou mais próxima de você)
5. Clique em **"Ativar"** / **"Enable"**

---

### 3️⃣ Configurar Regras de Segurança

1. Ainda no **Firestore Database**, clique na aba **"Regras"** / **"Rules"**
2. Substitua TODO o conteúdo por este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite ler e escrever em salas de jogo
    match /game_rooms/{roomId} {
      allow read, write: if true;
    }
    
    // Permite cada usuário acessar seus próprios dados
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clique em **"Publicar"** / **"Publish"**

---

### 4️⃣ Ativar Autenticação Anônima

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Vamos começar"** / **"Get started"**
3. Vá na aba **"Sign-in method"**
4. Clique em **"Anônimo"** / **"Anonymous"**
5. Ative o switch e clique em **"Salvar"** / **"Save"**

---

### 5️⃣ Obter as Credenciais

1. Clique no ícone de **engrenagem ⚙️** ao lado de "Visão geral do projeto"
2. Clique em **"Configurações do projeto"** / **"Project settings"**
3. Role até **"Seus apps"** / **"Your apps"**
4. Clique no ícone **`</>`** (Web)
5. Dê um nome ao app (ex: `LittleCatDance`)
6. **NÃO** marque Firebase Hosting
7. Clique em **"Registrar app"** / **"Register app"**
8. Copie APENAS a parte do `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 6️⃣ Colar as Credenciais no Código

1. Abra o arquivo **`index.html`**
2. Procure pela linha **33** (aproximadamente)
3. Encontre este trecho:

```javascript
// Configuração do Firebase - SUBSTITUA COM SUAS CREDENCIAIS
const firebaseConfig = {
    apiKey: "AIzaSyDEMOKEY-REPLACE-WITH-YOUR-KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

4. **Substitua** pelos dados que você copiou do Firebase
5. Mude a linha do DEMO_MODE para **false**:

```javascript
const DEMO_MODE = false; // ← MUDE DE true PARA false
```

6. **Salve** o arquivo

---

### 7️⃣ Testar o Jogo

1. Abra o **`index.html`** no navegador
2. Se não aparecer mais o aviso amarelo "MODO DEMO", funcionou! ✅
3. Crie uma sala e compartilhe o código
4. Abra outra aba/navegador e entre com o código
5. Os dois devem estar na mesma sala!

---

## 🎯 Exemplo Completo (Visual)

```
ANTES (Modo Demo):
┌────────────────────────────────────┐
│ ⚠️ MODO DEMO ATIVO                 │
│ Multiplayer apenas local...        │
└────────────────────────────────────┘

DEPOIS (Firebase Configurado):
┌────────────────────────────────────┐
│ 🌐 Modo Multiplayer Online         │
│ Digite seu nome: [João]            │
│ Código da sala: [ABC123]           │
│ [Criar] [Entrar]                   │
└────────────────────────────────────┘
```

---

## 💰 Quanto Custa?

**TOTALMENTE GRÁTIS** para uso pessoal!

O plano Spark (gratuito) do Firebase permite:
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia  
- ✅ 1 GB de armazenamento
- ✅ Conexões ilimitadas

Para jogar com amigos, isso é **MAIS que suficiente**!

---

## 🔧 Problemas Comuns

### "Permissão negada"
→ Verifique as regras do Firestore (Passo 3)

### "Firebase não encontrado"
→ Verifique se copiou as credenciais corretamente (Passo 6)

### "Ainda aparece MODO DEMO"
→ Verifique se mudou `DEMO_MODE` para `false` e salvou o arquivo

### "Sala não sincroniza"
→ Abra o Console do navegador (F12) e veja se há erros

---

## 📚 Links Úteis

- **Console Firebase**: https://console.firebase.google.com/
- **Documentação**: https://firebase.google.com/docs
- **Firestore**: https://firebase.google.com/docs/firestore

---

## ✅ Checklist Rápido

- [ ] Criar projeto no Firebase
- [ ] Ativar Firestore Database
- [ ] Configurar regras de segurança
- [ ] Ativar autenticação anônima
- [ ] Copiar credenciais (firebaseConfig)
- [ ] Colar credenciais no index.html
- [ ] Mudar DEMO_MODE para false
- [ ] Salvar e testar!

---

**Boa sorte! Se tiver dúvidas, releia este guia. 🚀**
