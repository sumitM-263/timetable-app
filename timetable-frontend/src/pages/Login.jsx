import { useState } from "react";
import API from "../services/api";

function Login({ setToken }) {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("professor");
  const [department, setDepartment] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 Validation
  const validate = () => {
    if (!email || !password) {
      return "Email and password are required";
    }

    if (isRegister) {
      if (!name) return "Name is required";
      if (role === "professor" && !department) {
        return "Department is required for professor";
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await API.post("/auth/register", {
          name,
          email,
          password,
          role,
          department
        });

        setSuccess("Registered successfully. Please login.");
        setIsRegister(false);

      } else {
        const res = await API.post("/auth/login", { email, password });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("department", res.data.user.department);
        localStorage.setItem("name", res.data.user.name);

        setToken(res.data.token);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{isRegister ? "Register" : "Login"}</h2>

        {/* Messages */}
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        {/* REGISTER FIELDS */}
        {isRegister && (
          <>
            <input
              style={styles.input}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />

            <select
              style={styles.input}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>

            {role === "professor" && (
              <input
                style={styles.input}
                placeholder="Department (CSE/ECE/ME)"
                onChange={(e) => setDepartment(e.target.value)}
              />
            )}
          </>
        )}

        {/* COMMON FIELDS */}
        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : (isRegister ? "Register" : "Login")}
        </button>

        <p
          style={styles.toggle}
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
            setSuccess("");
          }}
        >
          Switch to {isRegister ? "Login" : "Register"}
        </p>
      </div>
    </div>
  );
}

// 🔥 Basic styling (no drama)
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px"
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px"
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  toggle: {
    color: "#007bff",
    cursor: "pointer",
    textAlign: "center"
  },
  error: {
    color: "red",
    fontSize: "14px"
  },
  success: {
    color: "green",
    fontSize: "14px"
  }
};

export default Login;