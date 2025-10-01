import express from "express";
import mongoose from "mongoose";
import Student from "../models/student.js";

const router = express.Router();

const validateMarkLateData = (req, res, next) => {
  const { rollNo, name, year } = req.body;
  
  if (!rollNo) {
    return res.status(400).json({ 
      error: "Roll number is required",
      required: ["rollNo"]
    });
  }
  
  if (typeof rollNo !== 'string' || rollNo.trim().length === 0) {
    return res.status(400).json({ 
      error: "Roll number must be a non-empty string" 
    });
  }
  
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ 
      error: "Name must be a non-empty string if provided" 
    });
  }
  
  if (year !== undefined && (!Number.isInteger(year) || year < 1 || year > 4)) {
    return res.status(400).json({ 
      error: "Year must be an integer between 1 and 4 if provided" 
    });
  }
  
  next();
};
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: "Database connection unavailable",
      details: "Please try again in a moment"
    });
  }
  next();
};

// Mark student late
router.post("/mark-late", checkDbConnection, validateMarkLateData, async (req, res) => {
  try {
    const { rollNo, name, year } = req.body;

    console.log(`📝 Marking student late: ${rollNo}${name ? ` - ${name}` : ''}${year ? ` (Year ${year})` : ''}`);

    // Check if student exists
    let student = await Student.findOne({ rollNo });

    if (!student) {
      // For new students, name and year are required
      if (!name || !year) {
        return res.status(400).json({ 
          error: "New student detected. Name and year are required for first-time registration.",
          required: ["name", "year"],
          rollNo: rollNo
        });
      }
      // Create new student
      student = new Student({ rollNo, name, year });
    } else {
      // For existing students, use stored data
      console.log(`✅ Found existing student: ${student.name} (Year ${student.year})`);
    }

    // Increment lateDays and add log
    student.lateDays += 1;
    student.lateLogs.push({ date: new Date() });

    const LATE_LIMIT = 10;
    const GRACE_PERIOD_DAYS = 4;
    const FINE_PER_DAY = 5;

    let statusMessage = "";
    let alertType = "success";
    if (student.lateDays <= LATE_LIMIT) {
      // Normal or approaching limit
      if (student.lateDays >= 8) {
        student.status = 'approaching_limit';
        statusMessage = `⚠️ Warning: ${student.name} is approaching the late limit! (${student.lateDays}/${LATE_LIMIT} days used)`;
        alertType = "warning";
      } else {
        student.status = 'normal';
        statusMessage = `✅ ${student.name} marked late! (${student.lateDays}/${LATE_LIMIT} days used)`;
      }
    } else if (student.lateDays > LATE_LIMIT && student.gracePeriodUsed < GRACE_PERIOD_DAYS) {
      if (!student.limitExceeded) {
        student.limitExceeded = true;
        student.isInGracePeriod = true;
      }
      
      student.gracePeriodUsed += 1;
      student.status = 'grace_period';
      
      const graceDaysLeft = GRACE_PERIOD_DAYS - student.gracePeriodUsed;
      
      if (graceDaysLeft > 0) {
        statusMessage = `🔶 GRACE PERIOD: ${student.name} has exceeded the ${LATE_LIMIT}-day limit! Grace period: ${student.gracePeriodUsed}/${GRACE_PERIOD_DAYS} days used. ${graceDaysLeft} grace days remaining.`;
        alertType = "warning";
      } else {
        statusMessage = `🔴 GRACE PERIOD COMPLETED: ${student.name} has used all ${GRACE_PERIOD_DAYS} grace days! From now on, ₹${FINE_PER_DAY} will be charged per late day.`;
        alertType = "error";
      }
    } else {
      student.status = 'fined';
      student.fines += FINE_PER_DAY;
      
      const totalExcessDays = student.lateDays - LATE_LIMIT - GRACE_PERIOD_DAYS;
      statusMessage = `💸 FINE APPLIED: ${student.name} charged ₹${FINE_PER_DAY}! Total fines: ₹${student.fines} (${totalExcessDays} days beyond grace period)`;
      alertType = "error";
    }

    await student.save({ 
      timeout: 10000,
      writeConcern: { w: 'majority', j: true }
    });
    
    console.log(`✅ Successfully marked ${name} (${rollNo}) as late`);
    
    res.json({
      ...student._doc,
      message: statusMessage,
      alertType: alertType,
      daysRemaining: Math.max(0, LATE_LIMIT - student.lateDays),
      graceDaysRemaining: student.isInGracePeriod ? Math.max(0, GRACE_PERIOD_DAYS - student.gracePeriodUsed) : GRACE_PERIOD_DAYS
    });

  } catch (err) {
    console.error('❌ Error marking student late:', err);
    
    if (err.name === 'ValidationError') {
      res.status(400).json({ 
        error: "Invalid student data",
        details: Object.values(err.errors).map(e => e.message)
      });
    } else if (err.code === 11000) {
      res.status(409).json({ 
        error: "Student with this roll number already exists with different data"
      });
    } else if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      res.status(503).json({ 
        error: "Database timeout. Please try again.",
        details: "The operation took too long to complete"
      });
    } else {
      res.status(500).json({ 
        error: "Failed to mark student late",
        details: err.message 
      });
    }
  }
});

// Get students who were late today (with pagination support)
router.get("/late-today", checkDbConnection, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default 50 students per page
    const skip = (page - 1) * limit;
    
    console.log(`📋 Fetching students late today (${today.toDateString()}) - Page ${page}, Limit ${limit}`);
    
    // Find students with late logs from today with optimized query and pagination
    const students = await Student.find({
      "lateLogs.date": {
        $gte: today,
        $lt: tomorrow
      }
    })
    .select("rollNo name year lateDays lateLogs status gracePeriodUsed fines limitExceeded isInGracePeriod")
    .sort({ lateDays: -1, rollNo: 1 }) // Sort by late days desc, then roll number
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean for better performance
    
    // Get total count for pagination
    const totalCount = await Student.countDocuments({
      "lateLogs.date": {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Filter to show only today's logs
    const studentsWithTodayLogs = students.map(student => ({
      ...student,
      lateLogs: student.lateLogs.filter(log => 
        log.date >= today && log.date < tomorrow
      )
    }));
    
    console.log(`✅ Found ${studentsWithTodayLogs.length} students late today (Page ${page}/${Math.ceil(totalCount/limit)})`);
    
    res.json({
      date: today.toDateString(),
      count: studentsWithTodayLogs.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
      students: studentsWithTodayLogs
    });
  } catch (err) {
    console.error('❌ Error fetching late today:', err);
    
    if (err.name === 'MongooseError' && err.message.includes('timed out')) {
      res.status(503).json({ 
        error: "Database query timeout. Please try again.",
        details: "The query took too long to complete"
      });
    } else {
      res.status(500).json({ 
        error: "Failed to fetch today's late students",
        details: err.message 
      });
    }
  }
});

// Search students (optimized with text index)
router.get("/search", checkDbConnection, async (req, res) => {
  try {
    const { q, year, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: "Search query must be at least 2 characters long" 
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};
    
    // Build search query
    if (q) {
      // Use text search if available, otherwise use regex
      query.$or = [
        { rollNo: { $regex: q.trim(), $options: 'i' } },
        { name: { $regex: q.trim(), $options: 'i' } }
      ];
    }
    
    // Add year filter if specified
    if (year && year !== 'all') {
      query.year = parseInt(year);
    }
    
    console.log(`🔍 Searching students with query: ${q}, year: ${year || 'all'}`);
    
    const students = await Student.find(query)
      .select("rollNo name year lateDays status fines limitExceeded")
      .sort({ lateDays: -1, rollNo: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalCount = await Student.countDocuments(query);
    
    res.json({
      query: q,
      year: year || 'all',
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      students
    });
  } catch (err) {
    console.error('❌ Search error:', err);
    res.status(500).json({ 
      error: "Search failed", 
      details: err.message 
    });
  }
});

// Get records by time period (weekly, monthly, semester)
router.get("/records/:period", async (req, res) => {
  try {
    const { period } = req.params;
    const now = new Date();
    let startDate;

    switch (period) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "semester":
        // Assuming semester starts in January or August
        const currentMonth = now.getMonth();
        if (currentMonth >= 7) { // August-December (Fall semester)
          startDate = new Date(now.getFullYear(), 7, 1); // August 1st
        } else { // January-July (Spring semester)
          startDate = new Date(now.getFullYear(), 0, 1); // January 1st
        }
        break;
      default:
        return res.status(400).json({ error: "Invalid period. Use weekly, monthly, or semester" });
    }

    // Find students with late logs in the specified period
    const students = await Student.find({
      "lateLogs.date": {
        $gte: startDate,
        $lte: now
      }
    }).select("rollNo name year lateDays lateLogs fines status gracePeriodUsed limitExceeded isInGracePeriod");

    // Filter late logs to only include those in the period
    const studentsWithFilteredLogs = students.map(student => ({
      ...student._doc,
      lateLogs: student.lateLogs.filter(log => 
        log.date >= startDate && log.date <= now
      ),
      lateCountInPeriod: student.lateLogs.filter(log => 
        log.date >= startDate && log.date <= now
      ).length
    })).filter(student => student.lateCountInPeriod > 0);

    res.json({
      period,
      startDate,
      endDate: now,
      students: studentsWithFilteredLogs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN/MANAGEMENT ENDPOINTS

// Promote all students to next semester (resets late data)
router.post("/promote-semester", async (req, res) => {
  try {
    // First check if there are any students to promote
    const studentCount = await Student.countDocuments();
    
    if (studentCount === 0) {
      return res.status(404).json({ 
        error: "No students found to promote",
        studentsPromoted: 0 
      });
    }

    console.log(`📚 Starting semester promotion for ${studentCount} students...`);

    // Use a single atomic operation with timeout
    const result = await Student.updateMany(
      {}, // All students
      {
        $inc: { semester: 1 }, // Increment semester
        $set: { 
          lateDays: 0,
          fines: 0,
          limitExceeded: false,
          gracePeriodUsed: 0,
          isInGracePeriod: false,
          status: 'normal',
          lateLogs: [] // Set empty array directly
        }
      },
      { 
        timeout: 30000, // 30 second timeout
        writeConcern: { w: 'majority', j: true } // Ensure write is acknowledged
      }
    );

    console.log(`✅ Promoted ${result.modifiedCount} students successfully`);

    res.json({
      message: `Successfully promoted ${result.modifiedCount} students to next semester!`,
      studentsPromoted: result.modifiedCount,
      totalStudents: studentCount
    });
  } catch (err) {
    console.error('❌ Semester promotion error:', err);
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      res.status(503).json({ 
        error: "Database connection timeout. Please check your connection and try again.",
        details: "The operation took too long to complete. This might be due to network issues."
      });
    } else {
      res.status(500).json({ 
        error: "Failed to promote students",
        details: err.message 
      });
    }
  }
});

// Reset all student data (for prototype testing)
router.post("/reset-all-data", async (req, res) => {
  try {
    // Check if there are students to reset
    const studentCount = await Student.countDocuments();
    
    if (studentCount === 0) {
      return res.status(404).json({ 
        error: "No students found to reset",
        studentsReset: 0 
      });
    }

    console.log(`🔄 Starting data reset for ${studentCount} students...`);

    const result = await Student.updateMany(
      {},
      {
        $set: {
          lateDays: 0,
          fines: 0,
          limitExceeded: false,
          gracePeriodUsed: 0,
          isInGracePeriod: false,
          status: 'normal',
          lateLogs: []
        }
      },
      { 
        timeout: 30000, // 30 second timeout
        writeConcern: { w: 'majority', j: true }
      }
    );

    console.log(`✅ Reset data for ${result.modifiedCount} students successfully`);

    res.json({
      message: `Successfully reset data for ${result.modifiedCount} students!`,
      studentsReset: result.modifiedCount,
      totalStudents: studentCount
    });
  } catch (err) {
    console.error('❌ Data reset error:', err);
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      res.status(503).json({ 
        error: "Database connection timeout. Please check your connection and try again.",
        details: "The reset operation took too long to complete."
      });
    } else {
      res.status(500).json({ 
        error: "Failed to reset student data",
        details: err.message 
      });
    }
  }
});

// Delete a specific student
router.delete("/student/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const deletedStudent = await Student.findOneAndDelete({ rollNo });

    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      message: `Successfully deleted student ${deletedStudent.name} (${rollNo})`,
      deletedStudent: {
        rollNo: deletedStudent.rollNo,
        name: deletedStudent.name,
        year: deletedStudent.year
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all students (complete reset for prototype)
router.delete("/delete-all-students", async (req, res) => {
  try {
    const result = await Student.deleteMany({});

    res.json({
      message: `Successfully deleted ${result.deletedCount} students from database!`,
      studentsDeleted: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Health check
router.get("/health", checkDbConnection, async (req, res) => {
  try {
    // Test database connectivity with a simple query
    const testCount = await Student.countDocuments().timeout(5000);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      totalStudents: testCount,
      message: 'Student API is running normally'
    });
  } catch (err) {
    console.error('❌ Health check failed:', err);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: err.message
    });
  }
});

// Get system statistics  
router.get("/system-stats", checkDbConnection, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const studentsWithLateRecords = await Student.countDocuments({ lateDays: { $gt: 0 } });
    const studentsInGracePeriod = await Student.countDocuments({ status: 'grace_period' });
    const studentsBeingFined = await Student.countDocuments({ status: 'fined' });
    const totalFinesCollected = await Student.aggregate([
      { $group: { _id: null, total: { $sum: "$fines" } } }
    ]);

    const yearDistribution = await Student.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalStudents,
      studentsWithLateRecords,
      studentsInGracePeriod,
      studentsBeingFined,
      totalFinesCollected: totalFinesCollected[0]?.total || 0,
      yearDistribution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete specific late record for a student on a particular date
router.delete("/remove-late-record", checkDbConnection, async (req, res) => {
  try {
    const { rollNo, date, reason, authorizedBy } = req.body;

    // Validation
    if (!rollNo || !date || !reason || !authorizedBy) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["rollNo", "date", "reason", "authorizedBy"]
      });
    }

    console.log(`🗑️ Attempting to remove late record: ${rollNo} on ${date}`);

    // Find the student
    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ 
        error: "Student not found",
        rollNo: rollNo 
      });
    }

    // Parse the date to match (start and end of day)
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find late logs for that specific date
    const matchingLogs = student.lateLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startOfDay && logDate <= endOfDay;
    });

    if (matchingLogs.length === 0) {
      return res.status(404).json({ 
        error: "No late record found for the specified date",
        rollNo: rollNo,
        date: targetDate.toDateString()
      });
    }

    // Store original values for rollback calculation
    const originalLateDays = student.lateDays;
    const originalFines = student.fines;
    const originalStatus = student.status;

    // Remove the late logs for that date
    student.lateLogs = student.lateLogs.filter(log => {
      const logDate = new Date(log.date);
      return !(logDate >= startOfDay && logDate <= endOfDay);
    });

    // Recalculate student stats based on remaining logs
    const newLateDays = student.lateLogs.length;
    student.lateDays = newLateDays;

    // Recalculate status and fines based on new late days count
    const LATE_LIMIT = 10;
    const GRACE_PERIOD_DAYS = 4;
    const FINE_PER_DAY = 5;

    // Reset all calculated fields
    student.fines = 0;
    student.gracePeriodUsed = 0;
    student.limitExceeded = false;
    student.isInGracePeriod = false;

    if (newLateDays <= LATE_LIMIT) {
      if (newLateDays >= 8) {
        student.status = 'approaching_limit';
      } else {
        student.status = 'normal';
      }
    } else if (newLateDays > LATE_LIMIT && newLateDays <= LATE_LIMIT + GRACE_PERIOD_DAYS) {
      // Grace period
      student.limitExceeded = true;
      student.isInGracePeriod = true;
      student.gracePeriodUsed = newLateDays - LATE_LIMIT;
      student.status = 'grace_period';
    } else {
      // Fining period
      student.limitExceeded = true;
      student.status = 'fined';
      student.gracePeriodUsed = GRACE_PERIOD_DAYS;
      const excessDays = newLateDays - LATE_LIMIT - GRACE_PERIOD_DAYS;
      student.fines = excessDays * FINE_PER_DAY;
    }

    // Save the updated student record
    await student.save({
      timeout: 10000,
      writeConcern: { w: 'majority', j: true }
    });

    console.log(`✅ Successfully removed late record for ${student.name} (${rollNo})`);

    // Create audit log entry
    const auditInfo = {
      action: 'LATE_RECORD_REMOVED',
      rollNo: rollNo,
      studentName: student.name,
      date: targetDate.toDateString(),
      reason: reason,
      authorizedBy: authorizedBy,
      timestamp: new Date(),
      recordsRemoved: matchingLogs.length,
      changes: {
        lateDays: { from: originalLateDays, to: newLateDays },
        fines: { from: originalFines, to: student.fines },
        status: { from: originalStatus, to: student.status }
      }
    };

    console.log('📋 Audit Log:', JSON.stringify(auditInfo, null, 2));

    res.json({
      message: `Successfully removed ${matchingLogs.length} late record(s) for ${student.name} on ${targetDate.toDateString()}`,
      student: {
        rollNo: student.rollNo,
        name: student.name,
        lateDays: student.lateDays,
        status: student.status,
        fines: student.fines
      },
      removedRecords: {
        count: matchingLogs.length,
        date: targetDate.toDateString()
      },
      changes: {
        lateDaysChange: originalLateDays - newLateDays,
        finesChange: originalFines - student.fines,
        statusChange: originalStatus !== student.status
      },
      auditInfo: {
        reason: reason,
        authorizedBy: authorizedBy,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('❌ Error removing late record:', err);
    
    if (err.name === 'ValidationError') {
      res.status(400).json({ 
        error: "Invalid data provided",
        details: Object.values(err.errors).map(e => e.message)
      });
    } else if (err.name === 'MongooseError' && err.message.includes('timed out')) {
      res.status(503).json({ 
        error: "Database timeout. Please try again.",
        details: "The operation took too long to complete"
      });
    } else {
      res.status(500).json({ 
        error: "Failed to remove late record",
        details: err.message 
      });
    }
  }
});

export default router;
