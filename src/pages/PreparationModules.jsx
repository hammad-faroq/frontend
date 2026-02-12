import React, { useEffect, useState } from "react";
import { getPreparationModules } from "../services/interviewApi";

const PreparationModules = () => {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getPreparationModules();
        setModules(data);
      } catch (err) {
        console.error("Failed to fetch preparation modules:", err);
      }
    };
    fetchModules();
  }, []);

  return (
    <div>
      <h2>Preparation Modules</h2>
      <ul>
        {modules.map((mod) => (
          <li key={mod.id}>{mod.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default PreparationModules;
