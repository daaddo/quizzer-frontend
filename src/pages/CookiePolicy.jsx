import React from 'react'

const CookiePolicy = () => {
  return (
    <div className="container policy-page" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1rem' }}>Cookie Policy</h1>
      <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
        La presente Cookie Policy descrive l'uso di cookie e tecnologie similari da parte dell'Applicazione
        "Quizzer". L'Applicazione utilizza esclusivamente cookie tecnici necessari e tecnologie di
        archiviazione locale per finalità strettamente connesse all'erogazione del servizio.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Cosa sono i cookie</h2>
      <p style={{ color: '#4b5563' }}>
        I cookie sono piccoli file di testo che i siti inviano al terminale dell'utente, dove vengono
        memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Tecnologie similari
        (es. localStorage) consentono di memorizzare informazioni direttamente nel browser.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Cookie utilizzati</h2>
      <p style={{ color: '#4b5563' }}>
        L'Applicazione non utilizza cookie di profilazione, marketing o analitici di terze parti. Sono
        impiegati esclusivamente cookie tecnici necessari al corretto funzionamento della piattaforma.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-gray" style={{ marginTop: '1rem', width: '100%' }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipologia</th>
              <th>Finalità</th>
              <th>Durata</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>JSESSIONID</code></td>
              <td>Tecnico/necessario (prima parte)</td>
              <td>Mantenere la sessione autenticata dell'utente con il server</td>
              <td>Sessione (si cancella alla chiusura del browser)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '1.5rem' }}>Altre tecnologie (archiviazione locale)</h2>
      <p style={{ color: '#4b5563' }}>
        L'Applicazione utilizza l'archiviazione locale del browser (<code>localStorage</code>) per memorizzare
        preferenze e informazioni tecniche indispensabili all'esperienza d'uso (es. autenticazione tramite
        token JWT o salvataggio temporaneo dello stato del quiz). Questi dati non sono utilizzati per scopi
        di profilazione.
      </p>
      <ul style={{ color: '#4b5563', paddingLeft: '1.25rem' }}>
        <li><code>quizzer_jwt_token</code>: mantiene il token di autenticazione JWT (fino a cancellazione).</li>
        <li><code>postLoginRedirect</code> / <code>pendingTakingQuizToken</code>: supporto al flusso di login.</li>
        <li><code>issued:required_details:{'{tokenId}'}</code>: preferenze visualizzazione in pagine issued.</li>
        <li>
          Chiavi temporanee legate ai quiz: <code>takingquiz:test:{'{token}'}</code>, <code>takingquiz:answers:{'{token}'}</code>,
          <code>takingquiz:results:{'{token}'}</code>, <code>takingquiz:timer:{'{token}'}</code>, <code>takingquiz:viewmode:{'{token}'}</code>.
        </li>
      </ul>
      <p style={{ color: '#4b5563' }}>
        Le informazioni salvate in <code>localStorage</code> restano sul dispositivo finché non vengono
        eliminate dall'utente (es. tramite impostazioni del browser) o dall'Applicazione.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Gestione dei cookie</h2>
      <p style={{ color: '#4b5563' }}>
        È possibile gestire e/o eliminare i cookie e i dati di navigazione anche tramite le impostazioni del
        browser. La disabilitazione dei cookie tecnici potrebbe impedire il corretto funzionamento
        dell'Applicazione.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Aggiornamenti</h2>
      <p style={{ color: '#4b5563' }}>
        Potremmo aggiornare la presente Cookie Policy per riflettere modifiche tecniche o normative.
        Le modifiche saranno pubblicate in questa pagina.
      </p>

      <p style={{ marginTop: '2rem', color: '#6b7280' }}>
        Ultimo aggiornamento: 09/10/2025
      </p>
    </div>
  )
}

export default CookiePolicy



