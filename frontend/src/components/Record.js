import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { downloadCSV, downloadTextReport, formatLateRecordsForExport, getTimestamp } from "../utils/exportUtils";

function Record() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedYear, setSelectedYear] = useState("all");
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords(selectedPeriod);
    setSelectedYear("all"); // Reset year filter when period changes
  }, [selectedPeriod]);

  const fetchRecords = async (period) => {
    setLoading(true);
    try {
      const res = await API.get(`/students/records/${period}`);
      setRecordData(res.data);
    } catch (err) {
      console.error(err);
      setRecordData(null);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodTitle = (period) => {
    switch (period) {
      case "weekly": return "📅 Weekly Records";
      case "monthly": return "📊 Monthly Records";
      case "semester": return "🎓 Semester Records";
      default: return "Records";
    }
  };

  const groupStudentsByYear = (students) => {
    const grouped = {
      1: [], 2: [], 3: [], 4: []
    };
    
    students.forEach(student => {
      if (grouped[student.year]) {
        grouped[student.year].push(student);
      }
    });

    // Sort by late count in period (descending)
    Object.keys(grouped).forEach(year => {
      grouped[year].sort((a, b) => b.lateCountInPeriod - a.lateCountInPeriod);
    });

    return grouped;
  };

  const getYearLabel = (year) => {
    const labels = {
      1: "1st Year Students",
      2: "2nd Year Students", 
      3: "3rd Year Students",
      4: "4th Year Students"
    };
    return labels[year] || `Year ${year}`;
  };

  const getFilteredStudents = (students) => {
    if (selectedYear === "all") {
      return students;
    }
    return students.filter(student => student.year.toString() === selectedYear);
  };

  const getYearOptions = () => [
    { value: "all", label: "All Years", icon: "🎓" },
    { value: "1", label: "1st Year", icon: "🟢" },
    { value: "2", label: "2nd Year", icon: "🟡" },
    { value: "3", label: "3rd Year", icon: "🟠" },
    { value: "4", label: "4th Year", icon: "🔴" }
  ];

  const handleExportCSV = () => {
    if (!recordData || !recordData.students || recordData.students.length === 0) {
      alert("⚠️ No data to export");
      return;
    }
    
    const filteredStudents = getFilteredStudents(recordData.students);
    const exportData = formatLateRecordsForExport(filteredStudents, selectedPeriod);
    const timestamp = getTimestamp();
    const yearFilter = selectedYear === "all" ? "all_years" : `year_${selectedYear}`;
    const success = downloadCSV(exportData, `late_records_${selectedPeriod}_${yearFilter}_${timestamp}`);
    
    if (success) {
      alert("✅ CSV export successful!");
    } else {
      alert("❌ Export failed. Please try again.");
    }
  };

  const handleExportReport = () => {
    if (!recordData || !recordData.students || recordData.students.length === 0) {
      alert("⚠️ No data to export");
      return;
    }
    
    const filteredStudents = getFilteredStudents(recordData.students);
    const exportData = formatLateRecordsForExport(filteredStudents, selectedPeriod);
    const timestamp = getTimestamp();
    const yearFilter = selectedYear === "all" ? "All Years" : `Year ${selectedYear}`;
    const title = `Late Records Report - ${getPeriodTitle(selectedPeriod)} (${yearFilter})`;
    const success = downloadTextReport(exportData, `late_records_report_${selectedPeriod}_${timestamp}`, title);
    
    if (success) {
      alert("✅ Report export successful!");
    } else {
      alert("❌ Export failed. Please try again.");
    }
  };

  const renderYearSection = (year, students) => {
    if (students.length === 0) return null;

    return (
      <div key={year} style={{
        marginBottom: "2rem",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e9ecef"
      }}>
        <h3 style={{
          color: "#495057",
          fontSize: "1.3rem",
          fontWeight: "600",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          {year === "1" && "🟢"} 
          {year === "2" && "🟡"} 
          {year === "3" && "🟠"} 
          {year === "4" && "🔴"} 
          {getYearLabel(year)} ({students.length} students)
        </h3>

        <div style={{
          display: "grid",
          gap: "1rem"
        }}>
          {students.map(student => (
            <div key={student._id} style={{
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#343a40",
                  marginBottom: "0.5rem"
                }}>
                  {student.rollNo} - {student.name}
                </div>
                <div style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    backgroundColor: student.lateDays > 10 ? "#dc3545" : student.lateDays > 7 ? "#fd7e14" : "#28a745",
                    color: "white"
                  }}>
                    {student.lateDays}/10 late days
                  </span>
                  
                  {/* Status indicators */}
                  {student.status === 'approaching_limit' && (
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#ffc107",
                      color: "#212529"
                    }}>
                      ⚠️ Approaching
                    </span>
                  )}
                  
                  {student.status === 'grace_period' && (
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#fd7e14",
                      color: "white"
                    }}>
                      🔶 Grace ({student.gracePeriodUsed}/4)
                    </span>
                  )}
                  
                  {student.status === 'fined' && (
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#dc3545",
                      color: "white"
                    }}>
                      💸 Fined
                    </span>
                  )}
                  
                  {student.fines > 0 && (
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#e74c3c",
                      color: "white"
                    }}>
                      ₹{student.fines}
                    </span>
                  )}
                </div>
              </div>
              <div style={{
                fontSize: "0.8rem",
                color: "#6c757d",
                textAlign: "right"
              }}>
                <div>Latest dates:</div>
                {student.lateLogs.slice(-2).map((log, index) => (
                  <div key={index} style={{ fontSize: "0.75rem" }}>
                    {formatDate(log.date)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e9ecef"
    }}>
      {/* Header Section */}
      <div style={{
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ textAlign: "left" }}>
          <h2 style={{
            color: "#343a40",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "0.5rem",
            margin: 0
          }}>
            📋 Student Late Records
          </h2>
          <p style={{
            color: "#6c757d",
            fontSize: "1rem",
            margin: "0"
          }}>
            View attendance records by time period and year
          </p>
        </div>
        
        {/* Export Buttons */}
        {recordData && recordData.students && recordData.students.length > 0 && (
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

      {/* Period Selection Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }}>
        {[
          { key: "weekly", label: "📅 Weekly", desc: "Last 7 days" },
          { key: "monthly", label: "📊 Monthly", desc: "Current month" },
          { key: "semester", label: "🎓 Semester", desc: "Current semester" }
        ].map(period => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            style={{
              padding: "12px 20px",
              border: selectedPeriod === period.key ? "2px solid #007bff" : "2px solid #e9ecef",
              borderRadius: "8px",
              backgroundColor: selectedPeriod === period.key ? "#007bff" : "#ffffff",
              color: selectedPeriod === period.key ? "white" : "#495057",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
              textAlign: "center",
              minWidth: "120px"
            }}
          >
            <div>{period.label}</div>
            <div style={{
              fontSize: "0.7rem",
              opacity: "0.8",
              marginTop: "0.2rem"
            }}>
              {period.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Year Filter Selection */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "0.5rem",
        marginBottom: "2rem",
        flexWrap: "wrap"
      }}>
        <span style={{
          fontSize: "0.9rem",
          color: "#495057",
          fontWeight: "500",
          alignSelf: "center",
          marginRight: "0.5rem"
        }}>
          Filter by Year:
        </span>
        {getYearOptions().map(yearOption => (
          <button
            key={yearOption.value}
            onClick={() => setSelectedYear(yearOption.value)}
            style={{
              padding: "6px 12px",
              border: selectedYear === yearOption.value ? "2px solid #28a745" : "1px solid #dee2e6",
              borderRadius: "20px",
              backgroundColor: selectedYear === yearOption.value ? "#28a745" : "#ffffff",
              color: selectedYear === yearOption.value ? "white" : "#495057",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <span>{yearOption.icon}</span>
            {yearOption.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          color: "#6c757d"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <p>Loading records...</p>
        </div>
      )}

      {/* Records Display */}
      {!loading && recordData && (
        <>
          {/* Summary Header */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
            border: "1px solid #dee2e6"
          }}>
            <h3 style={{
              color: "#495057",
              fontSize: "1.4rem",
              fontWeight: "600",
              marginBottom: "1rem"
            }}>
              {getPeriodTitle(selectedPeriod)} 
              {selectedYear !== "all" && (
                <span style={{ 
                  fontSize: "1rem", 
                  color: "#6c757d",
                  fontWeight: "normal"
                }}>
                  {" "}- {getYearOptions().find(y => y.value === selectedYear)?.icon} {getYearOptions().find(y => y.value === selectedYear)?.label}
                </span>
              )}
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              fontSize: "0.9rem"
            }}>
              <div>
                <strong>Period:</strong> {formatDate(recordData.startDate)} - {formatDate(recordData.endDate)}
              </div>
              <div>
                <strong>Filtered Students:</strong> {getFilteredStudents(recordData.students).length}
              </div>
              <div>
                <strong>Late Instances:</strong> {getFilteredStudents(recordData.students).reduce((sum, s) => sum + s.lateCountInPeriod, 0)}
              </div>
            </div>
          </div>

          {/* Students Display */}
          {(() => {
            const filteredStudents = getFilteredStudents(recordData.students);
            
            if (filteredStudents.length === 0) {
              return (
                <div style={{
                  textAlign: "center",
                  padding: "3rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "2px dashed #dee2e6"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {selectedYear === "all" ? "🎉" : getYearOptions().find(y => y.value === selectedYear)?.icon}
                  </div>
                  <h3 style={{ color: "#28a745", margin: "0 0 0.5rem 0" }}>
                    {selectedYear === "all" ? "Excellent Attendance!" : "No Late Records Found!"}
                  </h3>
                  <p style={{ color: "#6c757d", margin: "0" }}>
                    {selectedYear === "all" 
                      ? `No students were late during this ${selectedPeriod.replace('ly', '')} period.`
                      : `No ${getYearOptions().find(y => y.value === selectedYear)?.label} students were late during this ${selectedPeriod.replace('ly', '')} period.`
                    }
                  </p>
                </div>
              );
            }

            // If showing all years, group by year
            if (selectedYear === "all") {
              const groupedStudents = groupStudentsByYear(filteredStudents);
              return (
                <div>
                  {Object.entries(groupedStudents)
                    .map(([year, students]) => renderYearSection(year, students))}
                </div>
              );
            } else {
              // Show specific year students in a simple list
              return (
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e9ecef"
                }}>
                  <h3 style={{
                    color: "#495057",
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    {getYearOptions().find(y => y.value === selectedYear)?.icon} 
                    {getYearOptions().find(y => y.value === selectedYear)?.label} ({filteredStudents.length} students)
                  </h3>

                  <div style={{
                    display: "grid",
                    gap: "1rem"
                  }}>
                    {filteredStudents.map(student => (
                      <div key={student._id} style={{
                        padding: "1rem",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <div style={{
                            fontSize: "1rem",
                            fontWeight: "600",
                            color: "#343a40",
                            marginBottom: "0.5rem"
                          }}>
                            {student.rollNo} - {student.name}
                          </div>
                          <div style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                            flexWrap: "wrap"
                          }}>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              backgroundColor: student.lateDays > 10 ? "#dc3545" : student.lateDays > 7 ? "#fd7e14" : "#28a745",
                              color: "white"
                            }}>
                              {student.lateDays}/10 late days
                            </span>
                            
                            {/* Status indicators */}
                            {student.status === 'approaching_limit' && (
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                backgroundColor: "#ffc107",
                                color: "#212529"
                              }}>
                                ⚠️ Approaching
                              </span>
                            )}
                            
                            {student.status === 'grace_period' && (
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                backgroundColor: "#fd7e14",
                                color: "white"
                              }}>
                                🔶 Grace ({student.gracePeriodUsed}/4)
                              </span>
                            )}
                            
                            {student.status === 'fined' && (
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                backgroundColor: "#dc3545",
                                color: "white"
                              }}>
                                💸 Fined
                              </span>
                            )}
                            
                            {student.fines > 0 && (
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                backgroundColor: "#e74c3c",
                                color: "white"
                              }}>
                                ₹{student.fines}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          fontSize: "0.8rem",
                          color: "#6c757d",
                          textAlign: "right"
                        }}>
                          <div>Latest dates:</div>
                          {student.lateLogs.slice(-2).map((log, index) => (
                            <div key={index} style={{ fontSize: "0.75rem" }}>
                              {formatDate(log.date)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          })()}
        </>
      )}

      {/* Error State */}
      {!loading && !recordData && (
        <div style={{
          textAlign: "center",
          padding: "3rem",
          color: "#dc3545"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
          <p>Failed to load records. Please try again.</p>
        </div>
      )}
    </div>
  );
}

export default Record;