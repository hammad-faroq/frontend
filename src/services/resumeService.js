// frontend/src/services/ResumeService.js

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  try {
    const response = await fetch("/api/upload_and_parse_resume/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to upload resume");
    }

    // ✅ Optionally redirect to success page
    window.location.href = "/cv_manager/upload_success/";

    return data; // contains parsed_resume JSON if needed
  } catch (err) {
    console.error("Upload error:", err);
    throw err; // frontend can catch this and show error message
  }
}
