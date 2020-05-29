const mongoose = require('mongoose');

const validateProjectField = (req, res, next) => {
  const { project } = req.body;
  if (!project || !project.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  } else if (project.length > 30) {
    return res.status(400).json({ error: 'Maximum of 30 characters, please' });
  }
  next();
};

const validateProjectId = (req, res, next) => {
  const { project_id } = req.body;
  if (!project_id || !project_id.trim()) {
    return res.status(400).json({ error: 'Project ID is required' });
  } else if (!mongoose.Types.ObjectId.isValid(project_id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }
  next();
};

const validateIssueId = (req, res, next) => {
  const { issue_id } = req.body;
  if (!issue_id || !issue_id.trim()) {
    return res.status(400).json({ error: 'Issue ID is required' });
  } else if (!mongoose.Types.ObjectId.isValid(issue_id)) {
    return res.status(400).json({ error: 'Invalid issue ID' });
  }
  next();
};

const validateIssueFields = (req, res, next) => {
  const { method } = req;

  if (method === 'PUT') {
    if (!req.body.edited_fields) {
      return next();
    } else if (!Object.keys(req.body.edited_fields).length) {
      return res.status(400).json({ error: 'No update fields were provided' });
    }
  }

  const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body.edited_fields || req.body;

  // ********** How the validation works **********  
  // If value has been assigned to message then error was detected
  // Push the field name with error message to errors array
  // Reset the value of message for the next check
  const isCreateFieldEmpty = field => (method === 'POST' && (field === undefined || field.trim() === ''));
  const isUpdateFieldEmpty = field => (method === 'PUT' && field !== undefined && field.trim() === '');
  const errors = [];
  let message;

  // ********** "Issue title" field **********
  if (isCreateFieldEmpty(issue_title) || isUpdateFieldEmpty(issue_title)) {
    message = 'Issue title is required';
  } else if (issue_title && issue_title.length > 30) {
    message = 'Maximum of 30 characters, please';
  }
  if (message) {
    errors.push({ field: 'issue_title', message });
    message = '';
  }

  // ********** "Issue text" field **********
  if (isCreateFieldEmpty(issue_text) || isUpdateFieldEmpty(issue_text)) {
    message = 'Issue text is required';
  } else if (issue_text && issue_text.length > 3000) {
    message = 'Maximum of 3000 characters, please';
  }
  if (message) {
    errors.push({ field: 'issue_text', message });
    message = '';
  }

  // ********** "Created by" field **********
  if (isCreateFieldEmpty(created_by) || isUpdateFieldEmpty(created_by)) {
    message = 'Your name is required';
  } else if (created_by && created_by.length > 20) {
    message = 'Maximum of 20 characters, please';
  }
  if (message) {
    errors.push({ field: 'created_by', message });
    message = '';
  }

  // ********** "Assigned to" field **********
  if (assigned_to && assigned_to.length > 20) {
    message = 'Maximum of 20 characters, please';
  }
  if (message) {
    errors.push({ field: 'assigned_to', message });
    message = '';
  }

  // ********** "Status text" field **********
  if (status_text && status_text.length > 20) {
    message = 'Maximum of 20 characters, please';
  }
  if (message) {
    errors.push({ field: 'status_text', message });
    message = '';
  }

  // If errors array is not empty, send the errors back to user, otherwise proceed futher
  if (errors.length) {
    res.status(400).json({ error: errors });
  } else {
    next();
  }
};

module.exports = { validateProjectField, validateIssueFields, validateProjectId, validateIssueId };