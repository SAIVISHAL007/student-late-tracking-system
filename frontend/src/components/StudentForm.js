import { useState } from "react";
import API from "../services/api";

function StudentForm() {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState(""); // default to empty for placeholder

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!rollNo.trim()) {
      alert("❌ Roll number is required");
      return;
    }
    
    try {
      // Prepare payload dynamically
      const payload = { rollNo: rollNo.trim() };
      // Include name/year only if filled (for new student)
      if (name.trim()) payload.name = name.trim();
      if (year) payload.year = parseInt(year);

      const res = await API.post("/students/mark-late", payload, {
        timeout: 15000 // 15 second timeout
      });
      
      // Create dynamic alert based on response
      const { message, alertType, daysRemaining, graceDaysRemaining } = res.data;
      
      // Show detailed feedback
      let displayMessage = message;
      if (daysRemaining !== undefined && graceDaysRemaining !== undefined) {
        displayMessage += `\n📊 Days remaining: ${daysRemaining}/10 | Grace days: ${graceDaysRemaining}/4`;
      }
      
      // Show styled alert based on alert type
      if (alertType === "error") {
        alert(`🚨 ${displayMessage}`);
      } else if (alertType === "warning") {
        alert(`⚠️ ${displayMessage}`);
      } else {
        alert(`✅ ${displayMessage}`);
      }

      // Reset inputs
      setRollNo(""); setName(""); setYear("");

    } catch (err) {
      console.error('Mark late error:', err);
      
      let errorMessage = "Error marking student late";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "⏱️ Request timed out. Please check your connection and try again.";
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        
        // Special handling for new student registration
        if (errorData.required && errorData.required.includes('name')) {
          errorMessage = `� New Student Detected!\n\nRoll Number: ${errorData.rollNo || rollNo}\n\nPlease fill in the Name and Year fields to register this student.`;
          
          // Don't clear the roll number so user can just add name/year
          setName(""); 
          setYear("");
          // Keep rollNo as is
        } else {
          errorMessage = `📝 ${errorData.error}`;
          if (errorData.required) {
            errorMessage += `\nRequired fields: ${errorData.required.join(', ')}`;
          }
          if (errorData.details) {
            errorMessage += `\n💡 ${errorData.details}`;
          }
        }
      } else if (err.response?.status === 503) {
        errorMessage = `🔌 ${err.response.data.error}\n💡 ${err.response.data.details}`;
      } else if (err.response?.data?.error) {
        errorMessage = `❌ ${err.response.data.error}`;
        if (err.response.data.details) {
          errorMessage += `\n💡 ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage = `❌ Network Error: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e9ecef",
      maxWidth: "500px",
      margin: "0 auto"
    }}>
      <h2 style={{
        color: "#343a40",
        marginBottom: "1rem",
        fontSize: "1.5rem",
        fontWeight: "600",
        textAlign: "center"
      }}>
        🕐 Mark Student Late
      </h2>
      
      <div style={{
        backgroundColor: "#e7f3ff",
        padding: "1rem",
        borderRadius: "6px",
        border: "1px solid #b3d7ff",
        marginBottom: "1.5rem",
        fontSize: "0.9rem",
        color: "#0056b3"
      }}>
        💡 <strong>How it works:</strong>
        <br />• <strong>Existing students:</strong> Just enter roll number
        <br />• <strong>New students:</strong> Fill all fields for registration
      </div>
      
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#495057"
          }}>
            Roll Number *
          </label>
          <input
            placeholder="Enter roll number"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            style={{
              padding: "12px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
              transition: "all 0.2s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#007bff"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#6c757d"
          }}>
            Student Name (only required for new students)
          </label>
          <input
            placeholder="Enter student name (required for new students only)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
              transition: "all 0.2s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#007bff"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#6c757d"
          }}>
            Year (only required for new students)
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#007bff"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          >
            <option value="">Select Year (for new students only)</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "14px 24px",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginTop: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#c82333";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 8px rgba(220, 53, 69, 0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#dc3545";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          ⚠️ Mark as Late
        </button>
      </form>
    </div>
  );
}

export default StudentForm;
