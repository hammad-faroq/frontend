import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/api";


function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
    setMessage("");

    try {
      const response = await requestPasswordReset(email);

      if (response.ok) {
        setMessage("✅ Password reset email sent successfully!");
        setEmailSent(true);
        setEmail(""); // Clear the form
      } else {
        if (response.status === 404) {
          setError("No account found with this email address");
        } else {
          setError(response.error || "Failed to send reset email. Please try again.");
        }
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user types
    setMessage(""); // Clear previous message
    setEmailSent(false); // Reset email sent status
  };

  const handleTryAgain = () => {
    setEmail("");
    setMessage("");
    setError("");
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Email Sent Successfully!</h2>
          <p style={styles.successMessage}>
            We've sent a password reset link to your email address. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          
          <div style={styles.instructionsBox}>
            <h4>What to do next:</h4>
            <ol style={styles.instructionsList}>
              <li>Check your email inbox (and spam folder)</li>
              <li>Look for an email from TalentMatch AI</li>
              <li>Click the password reset link in the email</li>
              <li>Follow the instructions to create a new password</li>
            </ol>
          </div>

          <div style={styles.actionButtons}>
            <button 
              onClick={() => navigate("/login")}
              style={styles.primaryButton}
            >
              Back to Login
            </button>
            <button 
              onClick={handleTryAgain}
              style={styles.secondaryButton}
            >
              Send Another Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Reset Your Password</h2>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {})
              }}
              disabled={isLoading}
              autoFocus
            />
            {error && (
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
            {isLoading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div style={styles.messageBox}>
            {message}
          </div>
        )}

        {/* Navigation Links */}
        <div style={styles.navigationSection}>
          <div style={styles.navLinks}>
            <button 
              onClick={() => navigate("/login")}
              style={styles.navButton}
              disabled={isLoading}
            >
              ← Back to Login
            </button>
            <button 
              onClick={() => navigate("/register")}
              style={styles.navButton}
              disabled={isLoading}
            >
              Create New Account →
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <h4 style={styles.helpTitle}>Need Help?</h4>
          <div style={styles.helpContent}>
            <p><strong>Don't have an account?</strong> <a href="/register" style={styles.link}>Sign up here</a></p>
            <p><strong>Remember your password?</strong> <a href="/login" style={styles.link}>Sign in instead</a></p>
            <p><strong>Still having trouble?</strong> Contact our support team</p>
          </div>
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
  successContainer: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "600px",
    textAlign: "center"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px"
  },
  title: {
    color: "#333",
    fontSize: "28px",
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
    backgroundColor: "#e67e22",
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
  messageBox: {
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
    textAlign: "center",
    fontWeight: "500"
  },
  navigationSection: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    marginTop: "20px"
  },
  navLinks: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px"
  },
  navButton: {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
    padding: "5px"
  },
  helpSection: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6"
  },
  helpTitle: {
    color: "#495057",
    marginBottom: "15px",
    fontSize: "16px",
    textAlign: "center"
  },
  helpContent: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#6c757d"
  },
  link: {
    color: "#3498db",
    textDecoration: "none"
  },
  successIcon: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  successTitle: {
    color: "#27ae60",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "15px"
  },
  successMessage: {
    color: "#555",
    fontSize: "18px",
    lineHeight: "1.6",
    marginBottom: "30px"
  },
  instructionsBox: {
    backgroundColor: "#e8f5e8",
    padding: "20px",
    borderRadius: "6px",
    marginBottom: "30px",
    textAlign: "left",
    border: "1px solid #c3e6cb"
  },
  instructionsList: {
    margin: "10px 0",
    paddingLeft: "20px",
    color: "#2d5a2d"
  },
  actionButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  primaryButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  },
  secondaryButton: {
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  }
};

export default PasswordResetRequest;