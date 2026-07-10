"use client"
import { useState, useEffect } from "react";
import "../../data/data.json"

export default function SearchBar() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Load JSON "database" once
  useEffect(() => {
    fetch("../../data/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Filter whenever query changes
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, data]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

