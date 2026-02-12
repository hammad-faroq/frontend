import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmPasswordReset } from "../services/api";

function PasswordResetConfirm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const validatePassword = (password) => {
    // Password strength: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    setMessage(""); // Clear any previous messages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await confirmPasswordReset(uidb64, token, formData.password);
      
      if (response.ok) {
        setMessage("✅ Password reset successful!");
        setResetSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        if (response.status === 400) {
          if (response.error.includes("Invalid or expired")) {
            setMessage("❌ This password reset link has expired or is invalid. Please request a new one.");
          } else {
            setMessage(`❌ ${response.error}`);
          }
        } else {
          setMessage("❌ Failed to reset password. Please try again.");
        }
      }
    } catch (error) {
      console.error("Password reset confirm error:", error);
      setMessage("❌ Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Password Reset Successful!</h2>
          <p style={styles.successMessage}>
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <div style={styles.countdown}>
            Redirecting to login page in 3 seconds...
          </div>
          <button 
            onClick={() => navigate("/login")}
            style={styles.primaryButton}
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Set New Password</h2>
          <p style={styles.subtitle}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* New Password Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
            <small style={styles.helpText}>
              8+ characters with uppercase, lowercase, and number
            </small>
          </div>

          {/* Confirm Password Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span style={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {})
            }}
            disabled={isLoading || !formData.password || !formData.confirmPassword}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>

          {/* Message Display */}
          {message && (
            <div style={{
              ...styles.messageBox,
              ...(message.includes("✅") ? styles.successMessage : styles.errorMessage)
            }}>
              {message}
            </div>
          )}
        </form>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div style={styles.passwordStrength}>
            <h4 style={styles.strengthTitle}>Password Strength:</h4>
            <div style={styles.strengthChecks}>
              <div style={{
                ...styles.strengthCheck,
                ...(formData.password.length >= 8 ? styles.strengthCheckPass : {})
              }}>
                {formData.password.length >= 8 ? "✅" : "❌"} At least 8 characters
              </div>
              <div style={{
                ...styles.strengthCheck,
                ...(/[A-Z]/.test(formData.password) ? styles.strengthCheckPass : {})
              }}>
                {/[A-Z]/.test(formData.password) ? "✅" : "❌"} Uppercase letter
              </div>
              <div style={{
                ...styles.strengthCheck,
                ...(/[a-z]/.test(formData.password) ? styles.strengthCheckPass : {})
              }}>
                {/[a-z]/.test(formData.password) ? "✅" : "❌"} Lowercase letter
              </div>
              <div style={{
                ...styles.strengthCheck,
                ...(/\d/.test(formData.password) ? styles.strengthCheckPass : {})
              }}>
                {/\d/.test(formData.password) ? "✅" : "❌"} Number
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div style={styles.navigationSection}>
          <p style={styles.navText}>
            Remember your password? 
            <button 
              onClick={() => navigate("/login")}
              style={styles.navButton}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </p>
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
    maxWidth: "500px",
    textAlign: "center"
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
    marginBottom: "20px"
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
  helpText: {
    color: "#666",
    fontSize: "12px",
    marginTop: "5px",
    display: "block"
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#8e44ad",
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
    marginTop: "15px",
    textAlign: "center",
    fontWeight: "500"
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb"
  },
  errorMessage: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb"
  },
  passwordStrength: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #dee2e6"
  },
  strengthTitle: {
    color: "#495057",
    marginBottom: "10px",
    fontSize: "14px"
  },
  strengthChecks: {
    fontSize: "13px"
  },
  strengthCheck: {
    color: "#dc3545",
    marginBottom: "5px"
  },
  strengthCheckPass: {
    color: "#28a745"
  },
  navigationSection: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    marginTop: "20px",
    textAlign: "center"
  },
  navText: {
    color: "#666",
    fontSize: "14px"
  },
  navButton: {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
    marginLeft: "5px"
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
    marginBottom: "20px"
  },
  countdown: {
    color: "#666",
    fontSize: "16px",
    marginBottom: "30px",
    fontStyle: "italic"
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
  }
};

export default PasswordResetConfirm;
