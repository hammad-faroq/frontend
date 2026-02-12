import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

const Register = () => {
  // State management

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password strength: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateName = (name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (!validateName(formData.first_name)) {
      newErrors.first_name = "First name must be at least 2 characters and contain only letters";
    }

    // Last Name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (!validateName(formData.last_name)) {
      newErrors.last_name = "Last name must be at least 2 characters and contain only letters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
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
      // Prepare data for API (exclude confirmPassword)
      const apiData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      };

      const response = await registerUser(apiData);

      if (response.message && response.message.includes("successfully")) {
        setMessage("✅ Registration successful! Redirecting to login...");
        
        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "job_seeker",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Handle API errors
        setMessage(`❌ ${response.error || "Registration failed. Please try again."}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("❌ Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Join TalentMatch AI</h2>
        <p style={styles.subtitle}>Create your account to get started</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* First Name Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>First Name*</label>
            <input
              type="text"
              name="first_name"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.first_name ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.first_name && <span style={styles.errorText}>{errors.first_name}</span>}
          </div>

          {/* Last Name Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Last Name*</label>
            <input
              type="text"
              name="last_name"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.last_name ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.last_name && <span style={styles.errorText}>{errors.last_name}</span>}
          </div>

          {/* Email Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address*</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            <small style={styles.helpText}>
              8+ characters with uppercase, lowercase, and number
            </small>
          </div>

          {/* Confirm Password Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password*</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          {/* Role Selection */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>I am a*</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{
                ...styles.select,
                ...(errors.role ? styles.inputError : {})
              }}
              disabled={isLoading}
            >
              <option value="">Select your role</option>
              <option value="job_seeker">Job Seeker - Looking for opportunities</option>
              <option value="hr">HR Professional - Hiring candidates</option>
            </select>
            {errors.role && <span style={styles.errorText}>{errors.role}</span>}
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
            {isLoading ? "Creating Account..." : "Create Account"}
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

          {/* Navigation Link */}
          <div style={styles.linkContainer}>
            <span>Already have an account? </span>
            <button 
              type="button"
              onClick={() => navigate("/login")}
              style={styles.linkButton}
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
    maxWidth: "500px"
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#333",
    fontSize: "28px",
    fontWeight: "bold"
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#666",
    fontSize: "16px"
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
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    boxSizing: "border-box",
    backgroundColor: "white"
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
    backgroundColor: "#27ae60",
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
    marginTop: "20px",
    color: "#666"
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px"
  }
};

export default Register;

