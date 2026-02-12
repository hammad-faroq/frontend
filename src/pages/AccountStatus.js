import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAccountStatus } from "../services/api";

function AccountStatus() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("");

    try {
      // FIXED: api.js already returns parsed JSON with status and ok fields
      const response = await checkAccountStatus(email);
      
      console.log("API Response:", response); // Debug log

      if (response.ok) {
        // Response is successful, use the status from backend
        setStatus(response.status || "Unknown status");
      } else {
        // Handle API errors (400, 404, etc.)
        const errorMsg = response.error || "Failed to check account status";
        setError(errorMsg);
      }

    } catch (error) {
      console.error("Status check error:", error);
      setError(error.message || "Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user types
    setStatus(""); // Clear previous status
  };

  const getStatusDisplay = (statusText) => {
    if (!statusText || typeof statusText !== "string") return null;

    let statusStyle = { ...styles.statusMessage };
    let icon = "";

    const lower = statusText.toLowerCase();

    if (lower.includes("active")) {
      statusStyle = { ...statusStyle, ...styles.successStatus };
      icon = "✅";
    } else if (lower.includes("locked")) {
      statusStyle = { ...statusStyle, ...styles.errorStatus };
      icon = "🔒";
    } else if (lower.includes("not found") || lower.includes("does not exist")) {
      statusStyle = { ...statusStyle, ...styles.warningStatus };
      icon = "⚠️";
    } else {
      statusStyle = { ...statusStyle, ...styles.infoStatus };
      icon = "ℹ️";
    }

    return (
      <div style={statusStyle}>
        <span style={styles.statusIcon}>{icon}</span>
        <span>{statusText}</span>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Account Status Checker</h2>
          <p style={styles.subtitle}>
            Check if an account is active or locked due to failed login attempts
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter email to check status"
              value={email}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(error && !status ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {error && !status && (
              <span style={styles.errorText}>{error}</span>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {})
            }}
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {/* Status Display */}
        {status && getStatusDisplay(status)}

        {/* Error Display */}
        {error && status === "" && (
          <div style={styles.errorMessage}>
            <span style={styles.statusIcon}>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.navigationSection}>
          <h3 style={styles.navTitle}>Quick Actions</h3>
          <div style={styles.navButtons}>
            <button 
              onClick={() => navigate("/login")}
              style={styles.navButton}
              disabled={isLoading}
            >
              🔐 Login
            </button>
            <button 
              onClick={() => navigate("/register")}
              style={styles.navButton}
              disabled={isLoading}
            >
              📝 Register
            </button>
            <button 
              onClick={() => navigate("/password-reset")}
              style={styles.navButton}
              disabled={isLoading}
            >
              🔄 Reset Password
            </button>
          </div>
        </div>

        {/* Information Section */}
        <div style={styles.infoSection}>
          <h4 style={styles.infoTitle}>About Account Status</h4>
          <ul style={styles.infoList}>
            <li><strong>Active:</strong> Account is working normally and can login</li>
            <li><strong>Locked:</strong> Account temporarily locked due to failed login attempts</li>
            <li><strong>Not Found:</strong> No account exists with this email address</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  formContainer: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "500px"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px"
  },
  title: {
    color: "#333",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px"
  },
  subtitle: {
    color: "#666",
    fontSize: "16px",
    lineHeight: "1.4"
  },
  form: {
    marginBottom: "30px"
  },
  fieldGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    color: "#555",
    fontWeight: "500"
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  inputError: {
    borderColor: "#e74c3c",
    boxShadow: "0 0 0 2px rgba(231, 76, 60, 0.2)"
  },
  errorText: {
    color: "#e74c3c",
    fontSize: "14px",
    marginTop: "5px",
    display: "block"
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#2980b9",
    color: "white",
    padding: "14px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s"
  },
  submitButtonDisabled: {
    backgroundColor: "#bdc3c7",
    cursor: "not-allowed"
  },
  statusMessage: {
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "500"
  },
  statusIcon: {
    marginRight: "10px",
    fontSize: "18px"
  },
  successStatus: {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb"
  },
  errorStatus: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb"
  },
  warningStatus: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    border: "1px solid #ffeaa7"
  },
  infoStatus: {
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
    border: "1px solid #bee5eb"
  },
  errorMessage: {
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "500",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb"
  },
  navigationSection: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    marginTop: "20px"
  },
  navTitle: {
    textAlign: "center",
    marginBottom: "15px",
    color: "#333",
    fontSize: "18px"
  },
  navButtons: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  navButton: {
    backgroundColor: "#34495e",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.3s"
  },
  infoSection: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6"
  },
  infoTitle: {
    color: "#495057",
    marginBottom: "10px",
    fontSize: "16px"
  },
  infoList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#6c757d",
    fontSize: "14px",
    lineHeight: "1.5"
  }
};

export default AccountStatus;