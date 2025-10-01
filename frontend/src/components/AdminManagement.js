import React, {useState,useEffect } from "react";
import API from "../services/api";

function AdminManagement() {
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(false);
  const [rollNoToDelete,setRollNoToDelete]=useState("");
  
  // State for removing late records
  const [removeRecordData,setRemoveRecordData]=useState({
    rollNo:"",
    date:"",
    reason:"",
    authorizedBy:""
  });

  useEffect(()=>{
    fetchSystemStats();
  },[]);

  const fetchSystemStats=async()=>{
    try{
      const res=await API.get("/students/system-stats");
      setStats(res.data);
    } catch(err){
      console.error(err);
    }
  };

  const handleSemesterPromotion=async()=>{
    if (!window.confirm("Are you sure you want to promote ALL students to the next semester? This will reset all late data but keep student information.")){
      return;
    }

    setLoading(true);
    try{
      const res=await API.post("/students/promote-semester",{},{
        timeout:45000 //45 second timeout
      });
      
      const message=res.data.message;
      const promoted=res.data.studentsPromoted;
      const total=res.data.totalStudents;
      
      alert(`✅ ${message}\n📊 Promoted: ${promoted}/${total}students`);
      fetchSystemStats();
    }catch (err){
      console.error('Semester promotion error:',err);
      
      let errorMessage="Failed to promote students";
      
      if (err.code==='ECONNABORTED') {
        errorMessage="⏱️ Operation timed out. Please check your connection and try again.";
      }else if (err.response?.status===503){
        errorMessage=`🔌 ${err.response.data.error}\n💡 ${err.response.data.details}`;
      }else if (err.response?.status===404){
        errorMessage="📚 No students found to promote. Add students first.";
      }else if (err.response?.data?.error){
        errorMessage=`❌ ${err.response.data.error}`;
        if (err.response.data.details) {
          errorMessage+=`\n💡 ${err.response.data.details}`;
        }
      }else if (err.message){
        errorMessage=`❌ Network Error: ${err.message}`;
      }
      
      alert(errorMessage);
    }finally{
      setLoading(false);
    }
  };

  const handleResetAllData=async()=>{
    if (!window.confirm("⚠️ DANGER: This will reset ALL late data for ALL students but keep student records. Are you sure?")) {
      return;
    }

    setLoading(true);
    try {
      const res=await API.post("/students/reset-all-data", {}, {
        timeout:45000 //45 second timeout
      });
      
      const message=res.data.message;
      const reset=res.data.studentsReset;
      const total=res.data.totalStudents;

      alert(`✅ ${message}\n📊 Reset: ${reset}/${total} students`);
      fetchSystemStats();
    } catch (err){
      console.error('Data reset error:', err);
      
      let errorMessage = "Failed to reset data";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "⏱️ Operation timed out. Please check your connection and try again.";
      } else if (err.response?.status === 503) {
        errorMessage = `🔌 ${err.response.data.error}\n💡 ${err.response.data.details}`;
      } else if (err.response?.status === 404) {
        errorMessage = "📚 No students found to reset. Add students first.";
      } else if (err.response?.data?.error) {
        errorMessage = `❌ ${err.response.data.error}`;
        if (err.response.data.details) {
          errorMessage+=`\n💡 ${err.response.data.details}`;
        }
      } else if (err.message) {
        errorMessage=`❌ Network Error: ${err.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent=async()=>{
    if (!rollNoToDelete.trim()) {
      alert("Please enter a roll number");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete student with roll number "${rollNoToDelete}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await API.delete(`/students/student/${rollNoToDelete}`);
      alert(`✅ ${res.data.message}`);
      setRollNoToDelete("");
      fetchSystemStats();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || "Failed to delete student"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllStudents = async () => {
    const confirmText = "DELETE ALL STUDENTS";
    const userInput = window.prompt(`🚨 CRITICAL WARNING: This will permanently delete ALL students from the database!\n\nThis action CANNOT be undone!\n\nType "${confirmText}" to confirm:`);
    
    if (userInput !== confirmText) {
      alert("Deletion cancelled.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.delete("/students/delete-all-students");
      alert(`✅ ${res.data.message}`);
      fetchSystemStats();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || "Failed to delete all students"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLateRecord = async () => {
    const { rollNo, date, reason, authorizedBy } = removeRecordData;
    
    // Validation
    if (!rollNo.trim() || !date || !reason.trim() || !authorizedBy.trim()) {
      alert("❌ All fields are required:\n• Roll Number\n• Date\n• Reason\n• Authorized By");
      return;
    }

    const confirmMessage = `🗑️ Remove Late Record Confirmation:

Student: ${rollNo}
Date: ${new Date(date).toDateString()}
Reason: ${reason}
Authorized By: ${authorizedBy}

⚠️ This will:
• Remove the late record for this specific date
• Recalculate late days, status, and fines
• Create an audit log entry

Are you sure you want to proceed?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const res = await API.delete("/students/remove-late-record", {
        data: removeRecordData,
        timeout: 30000
      });
      
      const { message, student, changes } = res.data;
      
      let alertMessage = `✅ ${message}\n\n`;
      alertMessage += `📊 Updated Student Info:\n`;
      alertMessage += `• Late Days: ${student.lateDays}\n`;
      alertMessage += `• Status: ${student.status}\n`;
      alertMessage += `• Fines: ₹${student.fines}\n\n`;
      
      if (changes.lateDaysChange > 0) {
        alertMessage += `📈 Changes Made:\n`;
        alertMessage += `• Late days reduced by: ${changes.lateDaysChange}\n`;
        alertMessage += `• Fines reduced by: ₹${changes.finesChange}\n`;
        if (changes.statusChange) {
          alertMessage += `• Status updated\n`;
        }
      }
      
      alert(alertMessage);
      
      // Reset form
      setRemoveRecordData({
        rollNo: "",
        date: "",
        reason: "",
        authorizedBy: ""
      });
      
      fetchSystemStats();
    } catch (err) {
      console.error('Remove late record error:', err);
      
      let errorMessage = "Failed to remove late record";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "⏱️ Request timed out. Please try again.";
      } else if (err.response?.status === 404) {
        if (err.response.data.error.includes("Student not found")) {
          errorMessage = `👤 Student with roll number "${rollNo}" not found.`;
        } else {
          errorMessage = `📅 No late record found for ${rollNo} on ${new Date(date).toDateString()}.`;
        }
      } else if (err.response?.status === 400) {
        errorMessage = `📝 ${err.response.data.error}`;
        if (err.response.data.required) {
          errorMessage += `\nRequired: ${err.response.data.required.join(', ')}`;
        }
      } else if (err.response?.data?.error) {
        errorMessage = `❌ ${err.response.data.error}`;
        if (err.response.data.details) {
          errorMessage += `\n💡 ${err.response.data.details}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e9ecef"
    }}>
      {/* System Statistics */}
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "8px",
        marginBottom: "2rem",
        border: "1px solid #dee2e6"
      }}>
        <h3 style={{
          color: "#495057",
          fontSize: "1.3rem",
          fontWeight: "600",
          marginBottom: "1rem"
        }}>
          📊 System Statistics
        </h3>
        
        {stats ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            fontSize: "0.9rem"
          }}>
            <div style={{ padding: "0.5rem", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
              <strong>Total Students:</strong> {stats.totalStudents}
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#fff3e0", borderRadius: "4px" }}>
              <strong>With Late Records:</strong> {stats.studentsWithLateRecords}
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#fce4ec", borderRadius: "4px" }}>
              <strong>In Grace Period:</strong> {stats.studentsInGracePeriod}
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#ffebee", borderRadius: "4px" }}>
              <strong>Being Fined:</strong> {stats.studentsBeingFined}
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#e8f5e8", borderRadius: "4px" }}>
              <strong>Total Fines:</strong> ₹{stats.totalFinesCollected}
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#f3e5f5", borderRadius: "4px" }}>
              <strong>Year Distribution:</strong> 
              {stats.yearDistribution.map(y => ` ${y._id}st: ${y.count}`).join(', ')}
            </div>
          </div>
        ) : (
          <p>Loading statistics...</p>
        )}
        
        <button
          onClick={fetchSystemStats}
          disabled={loading}
          style={{
            marginTop: "1rem",
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Management Actions */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem"
      }}>
        
        {/* Semester Promotion */}
        <div style={{
          padding: "1.5rem",
          border: "2px solid #28a745",
          borderRadius: "8px",
          backgroundColor: "#f8fff9"
        }}>
          <h4 style={{ color: "#28a745", marginBottom: "1rem", fontSize: "1.1rem" }}>
            🎓 Semester Promotion
          </h4>
          <p style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "1rem" }}>
            Promote all students to the next semester. This will:
            <br />• Increment semester number by 1
            <br />• Reset all late days to 0
            <br />• Clear all fines and penalties
            <br />• Remove all late history
            <br />• Keep student information intact
          </p>
          <button
            onClick={handleSemesterPromotion}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            🎓 Promote All Students
          </button>
        </div>

        {/* Data Reset */}
        <div style={{
          padding: "1.5rem",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          backgroundColor: "#fffbf0"
        }}>
          <h4 style={{ color: "#e58e00", marginBottom: "1rem", fontSize: "1.1rem" }}>
            🔄 Reset Late Data
          </h4>
          <p style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "1rem" }}>
            Reset all late-related data for testing:
            <br />• Clear all late days and fines
            <br />• Reset status to normal
            <br />• Remove all late history
            <br />• Keep student info and semester
          </p>
          <button
            onClick={handleResetAllData}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            🔄 Reset All Data
          </button>
        </div>

        {/* Remove Specific Late Record */}
        <div style={{
          padding: "1.5rem",
          border: "2px solid #17a2b8",
          borderRadius: "8px",
          backgroundColor: "#e6fffa"
        }}>
          <h4 style={{ color: "#17a2b8", marginBottom: "1rem", fontSize: "1.1rem" }}>
            🗑️ Remove Late Record
          </h4>
          <p style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "1rem" }}>
            Remove a specific late record for a particular date:
            <br />• Removes late entry for specific date only
            <br />• Recalculates late days and fines
            <br />• Requires proper authorization
            <br />• Creates audit trail
          </p>
          
          <div style={{ display: "grid", gap: "0.8rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Roll Number (e.g., A23126552137 )"
              value={removeRecordData.rollNo}
              onChange={(e) => setRemoveRecordData(prev => ({ ...prev, rollNo: e.target.value }))}
              style={{
                padding: "8px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
            
            <input
              type="date"
              placeholder="Date of late record"
              value={removeRecordData.date}
              onChange={(e) => setRemoveRecordData(prev => ({ ...prev, date: e.target.value }))}
              style={{
                padding: "8px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
            
            <input
              type="text"
              placeholder="Reason (e.g., Faculty error, Medical emergency)"
              value={removeRecordData.reason}
              onChange={(e) => setRemoveRecordData(prev => ({ ...prev, reason: e.target.value }))}
              style={{
                padding: "8px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
            
            <input
              type="text"
              placeholder="Authorized by (Faculty/Admin name)"
              value={removeRecordData.authorizedBy}
              onChange={(e) => setRemoveRecordData(prev => ({ ...prev, authorizedBy: e.target.value }))}
              style={{
                padding: "8px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
          </div>
          
          <button
            onClick={handleRemoveLateRecord}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            🗑️ Remove Late Record
          </button>
        </div>

        {/* Delete Student */}
        <div style={{
          padding: "1.5rem",
          border: "2px solid #fd7e14",
          borderRadius: "8px",
          backgroundColor: "#fff8f0"
        }}>
          <h4 style={{ color: "#fd7e14", marginBottom: "1rem", fontSize: "1.1rem" }}>
            👤 Remove Student
          </h4>
          <p style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "1rem" }}>
            Permanently delete a specific student:
          </p>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Enter roll number"
              value={rollNoToDelete}
              onChange={(e) => setRollNoToDelete(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "0.9rem",
                width: "100%",
                marginBottom: "0.5rem"
              }}
            />
          </div>
          <button
            onClick={handleDeleteStudent}
            disabled={loading || !rollNoToDelete.trim()}
            style={{
              padding: "12px 20px",
              backgroundColor: "#fd7e14",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: (loading || !rollNoToDelete.trim()) ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            🗑️ Delete Student
          </button>
        </div>

        {/* Complete Reset */}
        <div style={{
          padding: "1.5rem",
          border: "2px solid #dc3545",
          borderRadius: "8px",
          backgroundColor: "#fff5f5"
        }}>
          <h4 style={{ color: "#dc3545", marginBottom: "1rem", fontSize: "1.1rem" }}>
            🚨 Complete Database Reset
          </h4>
          <p style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "1rem" }}>
            <strong>⚠️ DANGER ZONE:</strong>
            <br />Permanently delete ALL students from database.
            <br />This action cannot be undone!
            <br />Use only for prototype testing.
          </p>
          <button
            onClick={handleDeleteAllStudents}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            💥 DELETE ALL STUDENTS
          </button>
        </div>
      </div>

      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Processing operation...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;