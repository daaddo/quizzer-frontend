# 🧠 Quizzer Frontend

Un sito web React moderno per la gestione di quiz interattivi con pagina di benvenuto e dashboard amministrativa.

## 🚀 Caratteristiche

- **Pagina di Benvenuto**: Homepage accogliente con presentazione delle funzionalità
- **Dashboard Admin**: Pannello amministrativo per gestire quiz, utenti e contenuti
- **Design Responsive**: Ottimizzato per desktop, tablet e mobile
- **Navigazione Fluida**: Routing con React Router
- **Interfaccia Moderna**: Design pulito con animazioni CSS

## 🛠️ Tecnologie Utilizzate

- **React 18** - Libreria UI
- **Vite** - Build tool veloce
- **React Router DOM** - Gestione routing
- **CSS3** - Styling con gradienti e animazioni

## 📁 Struttura del Progetto

```
quizzer_frontend/
├── src/
│   ├── components/          # Componenti riutilizzabili
│   │   ├── Layout.jsx       # Layout principale
│   │   ├── Header.jsx       # Header con navigazione
│   │   ├── Footer.jsx       # Footer
│   │   └── QuestionsList.jsx # Componente per visualizzare domande
│   ├── pages/               # Pagine dell'applicazione
│   │   ├── Welcome.jsx      # Pagina di benvenuto
│   │   └── Admin.jsx        # Dashboard admin
│   ├── services/            # Servizi API
│   │   └── api.js           # Chiamate API REST
│   ├── styles/
│   │   └── index.css        # Stili globali
│   ├── App.jsx              # Componente principale
│   └── main.jsx             # Entry point
├── .env                     # Variabili d'ambiente
├── package.json
├── vite.config.js
└── index.html
```

## ✨ Funzionalità Implementate

- **🏠 Pagina Welcome**: Interfaccia di benvenuto con design moderno e sezioni informative
- **⚙️ Dashboard Admin**: Pannello amministrativo completo
- **📋 Visualizzazione Domande**: Interfaccia per vedere tutte le domande dal database
- **➕ Creazione Domande**: Form completo per aggiungere nuove domande con risposte
- **🔄 Aggiornamento Real-time**: Refresh automatico dopo aggiunta e pulsanti manuali
- **⚡ Stati Dinamici**: Gestione loading, errori e dati vuoti
- **✅ Validazione Form**: Controlli automatici per dati obbligatori e risposte corrette
- **🎯 Gestione Risposte**: Aggiunta/rimozione dinamica di risposte multiple
- **🎨 Design Responsive**: Ottimizzato per tutti i dispositivi
- **🔌 Integrazione API**: Connessione automatica al backend (GET/POST)
- **⚙️ Configurazione Flessibile**: URL API configurabile tramite `.env`

## 🚀 Come Iniziare

### 1. Installare le dipendenze
```bash
npm install
```

### 2. Avviare il server di sviluppo
```bash
npm run dev
```

### 3. Configurare l'API (opzionale)
Se il tuo backend API non è su `http://localhost:8080`, modifica il file `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Aprire il browser
L'applicazione sarà disponibile su `http://localhost:5173`

## 📱 Navigazione

- **/** - Pagina di benvenuto principale
- **/admin** - Dashboard amministrativa con visualizzazione domande

## 🔌 API Integration

Il frontend si collega automaticamente a un backend API per gestire le domande. Gli endpoint utilizzati sono:

- **GET** `/api/questions` - Recupera tutte le domande con risposte
- **POST** `/api/questions` - Crea una nuova domanda

### Formato dati GET (lista domande):
```json
[
  {
    "id": 302,
    "title": "Titolo domanda",
    "question": "Testo della domanda?",
    "answers": [
      {
        "answer": "Risposta corretta",
        "correct": true
      },
      {
        "answer": "Risposta sbagliata",
        "correct": false
      }
    ]
  }
]
```

### Formato dati POST (creazione domanda):
```json
{
  "title": "Titolo domanda",
  "question": "Testo della domanda?",
  "answers": [
    {
      "answer": "Paris",
      "correct": true
    },
    {
      "answer": "London",
      "correct": false
    },
    {
      "answer": "Berlin",
      "correct": false
    }
  ]
}
```

## 🎨 Personalizzazione

I colori e gli stili possono essere modificati nel file `src/styles/index.css`. Il tema utilizza un gradiente blu-viola moderno che può essere facilmente personalizzato.

## 🏗️ Build per Produzione

```bash
npm run build
```

I file ottimizzati saranno generati nella cartella `dist/`.

## 📄 Licenza

Progetto sviluppato per scopi educativi e dimostrativi. 