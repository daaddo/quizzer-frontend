import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="container policy-page" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1rem' }}>Informativa Privacy</h1>
      <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
        La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che
        utilizzano l'applicazione web "Quizzer" (di seguito, l'"Applicazione"). Il trattamento avviene nel
        rispetto del Regolamento (UE) 2016/679 ("GDPR") e della normativa nazionale applicabile.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Titolare del trattamento</h2>
      <p style={{ color: '#4b5563' }}>
        Titolare del trattamento è il soggetto che gestisce l'Applicazione.
        Inserire i riferimenti corretti del Titolare (nome/denominazione, indirizzo, email):
        <br/>
        <strong>[Titolare]</strong> – <strong>[Indirizzo]</strong> – <strong>[Email di contatto]</strong>.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Tipologie di dati trattati</h2>
      <ul style={{ color: '#4b5563', paddingLeft: '1.25rem' }}>
        <li><strong>Dati identificativi</strong>: es. username, nome, cognome (se richiesti).</li>
        <li><strong>Dati di contatto</strong>: es. email (se richiesti).</li>
        <li><strong>Dati tecnici di sessione</strong>: indirizzo IP, user agent, log tecnici.</li>
        <li><strong>Dati necessari all'erogazione del servizio</strong>: esiti dei quiz, risposte fornite.</li>
      </ul>

      <h2 style={{ marginTop: '1.5rem' }}>Finalità e basi giuridiche</h2>
      <ul style={{ color: '#4b5563', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Erogazione del servizio</strong> (creazione/gestione account, autenticazione, fruizione dei quiz):
          esecuzione di misure precontrattuali o contrattuali ex art. 6(1)(b) GDPR.
        </li>
        <li>
          <strong>Sicurezza e prevenzione abusi</strong>: legittimo interesse del Titolare ex art. 6(1)(f) GDPR.
        </li>
        <li>
          <strong>Adempimenti di legge</strong>: obbligo legale ex art. 6(1)(c) GDPR ove applicabile.
        </li>
      </ul>

      <h2 style={{ marginTop: '1.5rem' }}>Conservazione</h2>
      <p style={{ color: '#4b5563' }}>
        I dati sono conservati per il tempo strettamente necessario alle finalità indicate. I cookie tecnici di
        sessione (es. <code>JSESSIONID</code>) scadono con la chiusura del browser. Le informazioni salvate in
        archiviazione locale del browser (localStorage) restano sul dispositivo finché non vengono eliminate
        dall'utente o dall'Applicazione.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Destinatari e trasferimenti</h2>
      <p style={{ color: '#4b5563' }}>
        I dati possono essere trattati da fornitori di servizi IT/hosting (responsabili del trattamento) che
        forniscono infrastruttura, manutenzione e sicurezza. L'elenco aggiornato dei responsabili può essere
        richiesto al Titolare. Eventuali trasferimenti extra-UE avvengono nel rispetto del Capo V del GDPR
        (es. clausole contrattuali standard della Commissione UE).
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Diritti degli interessati</h2>
      <p style={{ color: '#4b5563' }}>
        Gli interessati possono esercitare i diritti previsti dagli artt. 15-22 GDPR (accesso, rettifica,
        cancellazione, limitazione, portabilità, opposizione) scrivendo al Titolare ai recapiti sopra indicati.
        È inoltre possibile proporre reclamo all'Autorità Garante competente.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Cookie e tecnologie similari</h2>
      <p style={{ color: '#4b5563' }}>
        L'Applicazione utilizza esclusivamente cookie tecnici necessari alla fruizione del servizio e
        archiviazione locale per funzionalità applicative. Per maggiori dettagli consultare la
        <a href="/cookie-policy" style={{ marginLeft: 4 }}>Cookie Policy</a>.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Sicurezza</h2>
      <p style={{ color: '#4b5563' }}>
        Sono adottate misure tecniche e organizzative adeguate per proteggere i dati personali trattati,
        tenendo conto dello stato dell'arte e della natura del trattamento.
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>Modifiche</h2>
      <p style={{ color: '#4b5563' }}>
        La presente informativa può essere soggetta a aggiornamenti. La versione corrente è indicata dalla
        data di aggiornamento riportata di seguito.
      </p>

      <p style={{ marginTop: '2rem', color: '#6b7280' }}>
        Ultimo aggiornamento: 09/10/2025
      </p>
    </div>
  )
}

export default PrivacyPolicy



