import { useState, useEffect } from 'react';

function App() {
  // Zde ukládáme data z databáze do tzv. "stavu" (state)
  const [uzivatele, setUzivatele] = useState([]);

  // useEffect se spustí automaticky hned po načtení stránky
  useEffect(() => {
    // Tady React "volá" na tvůj backend
    fetch('http://localhost:3001/api/uzivatele')
      .then(odpoved => odpoved.json())
      .then(data => {
        // Data, která přišla z backendu, uložíme do stavu
        setUzivatele(data.data); 
      })
      .catch(chyba => console.error("Něco se pokazilo:", chyba));
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Moje první Fullstack aplikace! 🚀</h1>
      <h2>Seznam uživatelů:</h2>
      
      {/* Podmínka: Pokud je pole prázdné, vypiš text. Jinak vypiš seznam. */}
      {uzivatele.length === 0 ? (
        <p style={{ color: "gray" }}>Zatím v databázi nikdo není.</p>
      ) : (
        <ul>
          {uzivatele.map(uzivatel => (
            <li key={uzivatel.id} style={{ marginBottom: "10px" }}>
              <strong>{uzivatel.jmeno}</strong> (Věk: {uzivatel.vek})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;