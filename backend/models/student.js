import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, default: 1 },
  lateDays: { type: Number, default: 0 },
  fines: { type: Number, default: 0 },
  lateLogs: [{ date: { type: Date, default: Date.now } }],
  limitExceeded: { type: Boolean, default: false },
  gracePeriodUsed: { type: Number, default: 0 },
  isInGracePeriod: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['normal', 'approaching_limit', 'limit_exceeded', 'grace_period', 'fined'], 
    default: 'normal' 
  }
}, {
  timestamps: true
});

studentSchema.index({ rollNo: 1 });
studentSchema.index({ year: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ lateDays: 1 });
studentSchema.index({ 'lateLogs.date': 1 });
studentSchema.index({ createdAt: 1 });
studentSchema.index({ year: 1, status: 1 });

studentSchema.index({ 
  name: 'text', 
  rollNo: 'text' 
}, {
  weights: { rollNo: 2, name: 1 },
  name: 'student_text_index'
});

export default mongoose.model("Student", studentSchema);
