import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";


function Login() {

  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Input validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await loginUser(formData.email, formData.password);
      
      if (response.token) {
        // ✅ Use context-based login so state updates instantly
        login(response.token, response.role, response.is_superuser);

        setMessage("✅ Login successful! Redirecting...");

        // Wait a tiny bit for context propagation
        setTimeout(() => {
          navigate("/dashboard");
        }, 300);
      }
        else {
        // Handle different error scenarios
        if (response.locked) {
          setMessage(`🔒 ${response.error || "Account is temporarily locked due to multiple failed login attempts."}`);
        } else {
          setMessage(`❌ ${response.error || "Login failed. Please check your credentials."}`);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Network error. Please try again later.");
    } finally {
      setIsLoading(false);

    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Login to TalentMatch AI</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address*</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password*</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {/* Message Display */}
          {message && (
            <div style={{
              ...styles.message,
              ...(message.includes("✅") ? styles.successMessage : styles.errorMessage)
            }}>
              {message}
            </div>
          )}

          {/* Navigation Links */}
          <div style={styles.linkContainer}>
            <button 
              type="button"
              onClick={() => navigate("/password-reset")}
              style={styles.linkButton}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
            <span style={styles.separator}>|</span>
            <button 
              type="button"
              onClick={() => navigate("/register")}
              style={styles.linkButton}
              disabled={isLoading}
            >
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Styles object
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
    maxWidth: "400px"
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold"
  },
  form: {
    display: "flex",
    flexDirection: "column"
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
    backgroundColor: "#3498db",
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
  message: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "4px",
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
  linkContainer: {
    textAlign: "center",
    marginTop: "20px"
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px"
  },
  separator: {
    margin: "0 10px",
    color: "#999"
  }
};

export default Login;