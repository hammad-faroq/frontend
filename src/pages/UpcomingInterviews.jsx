import React, { useEffect, useState } from "react";
import { getHRJobs } from "../services/interviewApi"; // example API, replace with correct one

const UpcomingInterviews = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getHRJobs(); // or candidate-specific API
        setInterviews(data);
      } catch (err) {
        console.error("Failed to fetch upcoming interviews:", err);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div>
      <h2>Upcoming Interviews</h2>
      {interviews.length === 0 ? (
        <p>No upcoming interviews.</p>
      ) : (
        <ul>
          {interviews.map((intv) => (
            <li key={intv.id}>
              {intv.title} - {new Date(intv.date).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingInterviews;
