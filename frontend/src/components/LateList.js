import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDate, isToday } from "../utils/dateUtils";
import { downloadCSV, downloadTextReport, formatStudentDataForExport, getTimestamp } from "../utils/exportUtils";

function LateList() {
  const [students, setStudents] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    const fetchLateStudents = async () => {
      try {
        console.log('🔄 Fetching late students for today...');
        const res = await API.get("/students/late-today", { timeout: 15000 });
        
        console.log('📡 API Response:', res.data);
        
        // Handle both old and new response formats
        const studentsData = res.data.students || res.data;
        
        console.log(`📋 Processing ${studentsData.length} students late today`);
        console.log('� Students data:', studentsData);
        
        setStudents(studentsData);
        setLoading(false);
        
      } catch (err) {
        console.error('❌ Error loading late students:', err);
        console.error('❌ Error details:', err.response?.data);
        
        let errorMessage = "Failed to load today's late students";
        if (err.code === 'ECONNABORTED') {
          errorMessage = "⏱️ Request timed out. Please refresh the page.";
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = `Network Error: ${err.message}`;
        }
        
        setError(errorMessage);
        setStudents([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchLateStudents();
  }, []);

  const toggleExpanded = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const getLateDatesForToday = (lateLogs) => {
    return lateLogs.filter(log => isToday(log.date));
  };

  const getRecentLateDates = (lateLogs, limit = 5) => {
    return lateLogs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      alert("⚠️ No data to export");
      return;
    }
    
    const exportData = formatStudentDataForExport(students);
    const timestamp = getTimestamp();
    const success = downloadCSV(exportData, `late_students_today_${timestamp}`);
    
    if (success) {
      alert("✅ CSV export successful!");
    } else {
      alert("❌ Export failed. Please try again.");
    }
  };

  const handleExportReport = () => {
    if (students.length === 0) {
      alert("⚠️ No data to export");
      return;
    }
    
    const exportData = formatStudentDataForExport(students);
    const timestamp = getTimestamp();
    const title = `Late Students Report - ${new Date().toDateString()}`;
    const success = downloadTextReport(exportData, `late_students_report_${timestamp}`, title);
    
    if (success) {
      alert("✅ Report export successful!");
    } else {
      alert("❌ Export failed. Please try again.");
    }
  };

  // Filter students based on search term and year
  const filteredStudents = students.filter(student => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Year filter
    const matchesYear = selectedYear === "all" || 
      student.year?.toString() === selectedYear;
    
    return matchesSearch && matchesYear;
  });

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e9ecef"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{
          color: "#343a40",
          fontSize: "1.5rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          margin: 0
        }}>
          📋 Late Students Today
        </h2>
        
        {/* Export Buttons */}
        {students.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleExportCSV}
              style={{
                padding: "8px 12px",
                backgroundColor: "#28a745",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
            >
              📊 Export CSV
            </button>
            <button
              onClick={handleExportReport}
              style={{
                padding: "8px 12px",
                backgroundColor: "#007bff",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
            >
              📄 Export Report
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      {students.length > 0 && (
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="🔍 Search by roll number or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007bff"}
              onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
            />
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "2px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "0.9rem",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">🎓 All Years</option>
              <option value="1">🟢 1st Year</option>
              <option value="2">🟡 2nd Year</option>
              <option value="3">🟠 3rd Year</option>
              <option value="4">🔴 4th Year</option>
            </select>
          </div>

          {/* Results Counter */}
          <div style={{
            color: "#6c757d",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            {filteredStudents.length === students.length 
              ? `${students.length} students`
              : `${filteredStudents.length} of ${students.length} students`
            }
          </div>
        </div>
      )}
      
      {loading ? (
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{
            color: "#6c757d",
            fontSize: "1.1rem",
            margin: "0"
          }}>
            Loading late students...
          </p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          backgroundColor: "#f8d7da",
          borderRadius: "8px",
          border: "2px solid #f5c6cb"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
          <p style={{
            color: "#721c24",
            fontSize: "1.1rem",
            margin: "0"
          }}>
            {error}
          </p>
        </div>
      ) : students.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <p style={{
            color: "#28a745",
            fontSize: "1.2rem",
            fontWeight: "500",
            margin: "0"
          }}>
            No students were late today!
          </p>
          <p style={{
            color: "#6c757d",
            fontSize: "0.9rem",
            margin: "0.5rem 0 0 0"
          }}>
            Great attendance record!
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          backgroundColor: "#fff3cd",
          borderRadius: "8px",
          border: "2px dashed #ffeaa7"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
          <p style={{
            color: "#856404",
            fontSize: "1.1rem",
            fontWeight: "500",
            margin: "0"
          }}>
            No students match your search criteria
          </p>
          <p style={{
            color: "#6c757d",
            fontSize: "0.9rem",
            margin: "0.5rem 0 0 0"
          }}>
            Try adjusting your search term or year filter
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredStudents.map(s => (
            <li key={s._id} style={{
              marginBottom: "1rem",
              padding: "1.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }} onClick={() => toggleExpanded(s._id)}>
                <div>
                  <div style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#343a40",
                    marginBottom: "0.5rem"
                  }}>
                    {s.rollNo} - {s.name}
                  </div>
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap"
                  }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      backgroundColor: s.lateDays > 10 ? "#dc3545" : s.lateDays > 7 ? "#fd7e14" : "#28a745",
                      color: "white"
                    }}>
                      {s.lateDays}/10 late days
                    </span>
                    
                    {/* Status indicators */}
                    {s.status === 'approaching_limit' && (
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        backgroundColor: "#ffc107",
                        color: "#212529"
                      }}>
                        ⚠️ Approaching Limit
                      </span>
                    )}
                    
                    {s.status === 'grace_period' && (
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        backgroundColor: "#fd7e14",
                        color: "white"
                      }}>
                        🔶 Grace Period ({s.gracePeriodUsed}/4)
                      </span>
                    )}
                    
                    {s.status === 'fined' && (
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        backgroundColor: "#dc3545",
                        color: "white"
                      }}>
                        💸 Being Fined
                      </span>
                    )}
                    
                    {s.fines > 0 && (
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        backgroundColor: "#e74c3c",
                        color: "white"
                      }}>
                        ₹{s.fines} Total Fines
                      </span>
                    )}
                  </div>
                </div>
                <button style={{
                  backgroundColor: expandedStudent === s._id ? "#007bff" : "#f8f9fa",
                  color: expandedStudent === s._id ? "white" : "#007bff",
                  border: "2px solid #007bff",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span>{expandedStudent === s._id ? "▼" : "▶"}</span>
                  View Dates
                </button>
              </div>

              {expandedStudent === s._id && (
                <div style={{ 
                  marginTop: "1.5rem", 
                  paddingTop: "1.5rem", 
                  borderTop: "1px solid #e9ecef",
                  animation: "fadeIn 0.3s ease"
                }}>
                  <h4 style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1rem",
                    color: "#495057",
                    fontWeight: "600"
                  }}>
                    📅 Today's Late Entries:
                  </h4>
                  {getLateDatesForToday(s.lateLogs).length > 0 ? (
                    <ul style={{
                      margin: "0 0 1.5rem 0",
                      padding: "1rem",
                      backgroundColor: "#fff5f5",
                      borderRadius: "8px",
                      border: "1px solid #fecaca",
                      listStyle: "none"
                    }}>
                      {getLateDatesForToday(s.lateLogs).map((log, index) => (
                        <li key={index} style={{
                          color: "#dc3545",
                          fontWeight: "500",
                          padding: "0.25rem 0"
                        }}>
                          🔴 {formatDate(log.date)} (Today)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{
                      margin: "0 0 1.5rem 0",
                      padding: "1rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      color: "#6c757d",
                      fontSize: "0.9rem",
                      fontStyle: "italic"
                    }}>
                      No entries for today
                    </p>
                  )}

                  <h4 style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1rem",
                    color: "#495057",
                    fontWeight: "600"
                  }}>
                    📝 Recent Late History:
                  </h4>
                  <ul style={{
                    margin: "0 0 1rem 0",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    listStyle: "none",
                    maxHeight: "150px",
                    overflowY: "auto"
                  }}>
                    {getRecentLateDates(s.lateLogs).map((log, index) => (
                      <li key={index} style={{
                        color: isToday(log.date) ? "#dc3545" : "#6c757d",
                        fontSize: "0.85rem",
                        padding: "0.25rem 0",
                        fontWeight: isToday(log.date) ? "500" : "normal"
                      }}>
                        {isToday(log.date) ? "🔴" : "⭕"} {formatDate(log.date)}
                        {isToday(log.date) && " (Today)"}
                      </li>
                    ))}
                  </ul>
                  
                  {s.fines > 0 && (
                    <div style={{ 
                      marginTop: "1rem", 
                      padding: "1rem", 
                      backgroundColor: "#fff8e1",
                      border: "1px solid #ffcc02",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      <span style={{ fontSize: "1.5rem" }}>💰</span>
                      <strong style={{ color: "#f57c00", fontSize: "1.1rem" }}>
                        Total Fines: ${s.fines}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LateList;
