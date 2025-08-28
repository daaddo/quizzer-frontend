# 🧠 Quizzer Frontend

Un'applicazione React moderna per la gestione e svolgimento di quiz interattivi.

## 🚀 Features

- **🔐 Sistema di Autenticazione**: Login con username/email e gestione sessioni
- **🍪 Remember Me**: Cookie automatico per sessioni persistenti
- **🛡️ Route Protette**: Accesso controllato a Admin e Quiz
- **👤 Gestione Utenti**: Dashboard personalizzata con informazioni utente
- **📊 Dashboard Admin**: Gestione completa delle domande (CRUD)
- **🧠 Sistema Quiz**: Quiz casuali con correzione automatica
- **🔗 API Integration**: Integrazione completa con backend REST autenticato
- **📱 Responsive Design**: Ottimizzato per desktop e mobile
- **🐳 Docker Ready**: Deployment facile con Docker e Docker Compose

## 📋 Prerequisiti

- Node.js 18+ (per development)
- Docker & Docker Compose (per deployment)
- Backend API running su porta configurabile

## 🛠 Development Setup

### 1. Installazione dipendenze

```bash
npm install
```

### 2. Configurazione Environment

Crea un file `.env` nella root del progetto:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Avvio Development Server

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 🐳 Deployment con Docker

### Deployment rapido (Development)

```bash
# Build e avvio
docker-compose up -d

# Controlla i logs
docker-compose logs -f
```

L'app sarà disponibile su `http://localhost:3000`

### Deployment Produzione

1. **Configura l'URL API** in `docker-compose.prod.yml`:

```yaml
environment:
  - VITE_API_BASE_URL=https://your-api-domain.com
```

2. **Deploy in produzione**:

```bash
# Build e avvio per produzione
docker-compose -f docker-compose.prod.yml up -d

# Verifica status
docker-compose -f docker-compose.prod.yml ps
```

### 🔧 Configurazione Environment Variables

Le seguenti variabili possono essere configurate a runtime:

| Variabile | Descrizione | Default | Esempio |
|-----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | URL base dell'API backend | `http://localhost:8080` | `https://api.yourdomain.com` |

#### Esempi di configurazione:

```bash
# Local development
VITE_API_BASE_URL=http://localhost:8080

# Production con dominio
VITE_API_BASE_URL=https://api.yourdomain.com

# Production con IP
VITE_API_BASE_URL=http://192.168.1.100:8080

# Con diversa porta
VITE_API_BASE_URL=http://localhost:3001
```

### 🚀 Comandi Docker Utili

```bash
# Build dell'immagine
docker build -t quizzer-frontend .

# Run container singolo
docker run -d \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://localhost:8080 \
  --name quizzer-frontend \
  quizzer-frontend

# Verifica health check
docker exec quizzer-frontend wget -qO- http://localhost/health

# Aggiorna configurazione API (richiede restart)
docker-compose down
docker-compose up -d

# Visualizza logs
docker-compose logs -f quizzer-frontend

# Accesso al container
docker exec -it quizzer-frontend sh
```

### 🔍 Troubleshooting Docker

#### Container non si avvia

```bash
# Controlla logs
docker-compose logs quizzer-frontend

# Verifica variabili d'ambiente
docker exec quizzer-frontend env | grep VITE
```

#### API non raggiungibile

1. Verifica che l'URL API sia corretto
2. Controlla che il backend sia in running
3. Verifica la rete Docker:

```bash
# Test connessione dall'interno del container
docker exec quizzer-frontend wget -qO- $VITE_API_BASE_URL/api/questions
```

#### Problemi di CORS

Configura il backend per accettare richieste dall'origine del frontend:
- Development: `http://localhost:5173`
- Production: `http://your-domain.com`

## 📚 API Endpoints utilizzati

L'applicazione utilizza i seguenti endpoint del backend:

### 🔐 Autenticazione
- `POST /login` - Effettua login con credenziali (username/email + password)
- `POST /logout` - Effettua logout e pulizia sessione
- `GET /api/v1/users/remember-me-status` - Verifica stato autenticazione e cookie

### 📝 Gestione Domande (Richiedono Autenticazione)
- `GET /api/questions` - Lista tutte le domande
- `POST /api/questions` - Crea nuova domanda  
- `PUT /api/questions/{id}` - Aggiorna domanda esistente
- `DELETE /api/questions/{id}` - Elimina domanda
- `GET /api/questions/random?size={n}` - Domande casuali per quiz

### Formato dati API

#### Login (POST /login):
```json
{
  "username": "user@email.com",  // Può essere username o email
  "password": "password123"
}
```

#### Status Autenticazione (GET /api/v1/users/remember-me-status):
```json
{
  "authenticated": true,
  "username": "user123",
  "hasRememberMeCookie": true,
  "message": "User is authenticated"
}
```

#### Domanda (GET/POST):
```json
{
  "id": 302,
  "title": "Titolo domanda",
  "question": "Testo della domanda?",
  "answers": [
    {"answer": "Risposta 1", "correct": true},
    {"answer": "Risposta 2", "correct": false}
  ]
}
```

#### Quiz Random (GET):
```json
[
  {
    "id": 402,
    "title": "Titolo",
    "question": "Testo domanda?",
    "answers": [
      {"id": 52, "answer": "Risposta 1", "correct": false},
      {"id": 53, "answer": "Risposta 2", "correct": true}
    ]
  }
]
```

## 🎯 Struttura del Progetto

```
quizzer_frontend/
├── src/
│   ├── components/         # Componenti React
│   │   ├── AddQuestionForm.jsx
│   │   ├── Quiz.jsx
│   │   ├── QuestionsList.jsx
│   │   ├── EditQuestionModal.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx    # 🔐 HOC per route protette
│   ├── pages/             # Pagine principali
│   │   ├── Welcome.jsx
│   │   ├── Admin.jsx
│   │   └── Login.jsx            # 🔐 Pagina di login
│   ├── contexts/          # React Context
│   │   └── AuthContext.jsx      # 🔐 Context autenticazione
│   ├── hooks/             # Custom Hooks
│   │   └── useAuth.js           # 🔐 Hook autenticazione
│   ├── services/          # Servizi API
│   │   ├── api.js               # Client API domande
│   │   └── auth.js              # 🔐 Client API autenticazione
│   └── styles/           # CSS styles
│       └── index.css
├── public/               # Asset statici
├── Dockerfile           # Configurazione Docker
├── docker-compose.yml   # Docker Compose per dev
├── docker-compose.prod.yml # Docker Compose per prod
├── nginx.conf          # Configurazione Nginx
└── docker-entrypoint.sh # Script configurazione runtime
```

## 🌟 Features del Sistema

### 🔐 Sistema di Autenticazione
- ✅ Login con username o email
- ✅ Cookie remember-me automatico
- ✅ Auto-login alla riapertura dell'app
- ✅ Protezione route admin e quiz
- ✅ Logout sicuro con pulizia sessione
- ✅ Gestione errori di autenticazione
- ✅ UI condizionale basata su stato auth

### 📊 Dashboard Admin (Protetta)
- ✅ Visualizzazione lista domande con paginazione
- ✅ Aggiunta nuove domande con risposte multiple
- ✅ Modifica domande esistenti con modal
- ✅ Eliminazione domande con conferma
- ✅ Refresh automatico dopo operazioni
- ✅ Gestione errori e stati di loading

### 🧠 Sistema Quiz (Protetto)
- ✅ Selezione numero domande personalizzabile (1-50)
- ✅ Domande casuali dal database
- ✅ Interfaccia intuitiva per risposte
- ✅ Correzione automatica con dettagli
- ✅ Punteggio percentuale e analisi risultati
- ✅ Salvataggio stato durante il quiz

### 🎨 UI/UX
- ✅ Design moderno e responsive
- ✅ Animazioni e transizioni fluide
- ✅ Stati di loading e feedback utente
- ✅ Gestione errori user-friendly
- ✅ Dashboard personalizzata per utenti autenticati
- ✅ Accessibilità e usabilità ottimizzate

## 🔒 Considerazioni di Sicurezza

- Headers di sicurezza configurati in Nginx
- Validazione input lato client
- Gestione errori sicura senza esposizione di dettagli
- CORS da configurare sul backend

## 📱 Responsive Design

L'applicazione è completamente responsive:
- 📱 Mobile (320px+)
- 📊 Tablet (768px+) 
- 💻 Desktop (1200px+)

## 🚀 Performance

- Build ottimizzato con Vite
- Compressione Gzip attivata
- Caching degli asset statici
- Bundle splitting automatico
- Lazy loading dei componenti

## 📄 Licenza

MIT License - Vedi file LICENSE per dettagli

---

**Developed with ❤️ using React 18 + Vite + Docker** 