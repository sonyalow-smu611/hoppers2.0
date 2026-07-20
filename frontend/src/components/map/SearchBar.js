"use client";
import { useState, useEffect } from "react";
// import "../../../public/data.json"

export default function SearchBar() {
  const [cafes, setCafes] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("../../../public/data.json")
      .then((res) => res.json())
      .then((json) => setCafes(json));
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const filtered = cafes.filter((cafe) =>
      cafe.displayName.text.toLowerCase().includes(query.toLowerCase()),
    );
    setResults(filtered);
  }, [query, cafes]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search cafes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="font-medium">
        {results.map((cafe) => (
          <li key={cafe.id}>
            {cafe.displayName.text} — {cafe.formattedAddress} (⭐ {cafe.rating})
          </li>
        ))}
      </ul>
    </div>
  );
}