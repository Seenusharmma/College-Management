import mongoose from 'mongoose';

const PreviousYearQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  year: {
    type: Number,
    required: true
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'assignment'],
    required: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['cs', 'it', 'ece', 'ee', 'me', 'ce', 'all']
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: 'application/pdf'
  },
  uploadedBy: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const PreviousYearQuestion = mongoose.models.PreviousYearQuestion || 
  mongoose.model('PreviousYearQuestion', PreviousYearQuestionSchema);

export default PreviousYearQuestion;
