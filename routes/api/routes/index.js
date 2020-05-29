const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const {
  validateProjectField,
  validateIssueFields,
  validateProjectId,
  validateIssueId
} = require('../middlewares/validations');

const api = express.Router();

// Get
api.get('/projects', ProjectController.get_projects);
api.get('/issues/:project', ProjectController.get_issues);

// Create
api.post('/projects', validateProjectField, ProjectController.create_project);
api.post('/issues/:project', validateIssueFields, ProjectController.create_issue);

// Close and Edit
api.put('/issues/:project', validateIssueId, validateIssueFields, ProjectController.edit_issue);

// Delete
api.delete('/projects', validateProjectId, ProjectController.delete_project)
api.delete('/issues/:project', validateIssueId, ProjectController.delete_issue);

module.exports = api;