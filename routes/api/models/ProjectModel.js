const mongoose = require('mongoose');

const IssueSchema = mongoose.Schema({
  issue_title: { type: String, trim: true },
  issue_text: { type: String, trim: true },
  created_by: { type: String, trim: true },
  assigned_to: { type: String, trim: true },
  status_text: { type: String, trim: true },
  open: { type: Boolean, default: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now }
});

const ProjectSchema = mongoose.Schema({
  project_name: { type: String, trim: true },
  issues: [IssueSchema]
});

module.exports = mongoose.model('Project', ProjectSchema);