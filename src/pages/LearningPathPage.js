import  { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { checkResumeStatus, getStoredLearningPath } from "../services/api";

function LearningPathPage() {
  const [path, setPath] = useState({ path_steps: [], target_role: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const status = await checkResumeStatus();
        if (!status.has_resume) {
          setError("Upload a resume to see your learning path.");
          return;
        }
        const response = await getStoredLearningPath();
        if (response.success) {
          setPath(response.learning_path || { path_steps: [], target_role: "" });
        } else {
          setError(response.message || "Failed to load learning path.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load learning path.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6">Loading learning path...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const pathSteps = path.path_steps || path.learning_path || [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <Sidebar /> */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">📘 Your Learning Path</h1>
        <h2 className="text-2xl font-semibold mb-4">Target Role: <span className="text-indigo-600">{path.target_role}</span></h2>
        <div className="space-y-4">
          {pathSteps.map((step, i) => (
            <div key={i} className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-xl font-semibold">{step.title || step.phase}</h4>
              <p className="mt-1 text-gray-700">{step.description}</p>
              {step.topics && (
                <p className="text-sm text-gray-600 mt-2"><strong>Topics:</strong> {step.topics.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default LearningPathPage;