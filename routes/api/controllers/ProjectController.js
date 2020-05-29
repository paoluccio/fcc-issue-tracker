const ProjectModel = require('../models/ProjectModel');

exports.get_projects = async (req, res, next) => {
  try {
    const options = { collation: { 'locale': 'en' }, sort: { project_name: 1 } };
    const response = await ProjectModel.find({}, null, options);
    const projects = response.reduce((acc, project) => {
      acc.push({
        _id: project._id,
        name: project.project_name,
        solved: project.issues.filter(issue => !issue.open).length,
        pending: project.issues.filter(issue => issue.open).length,
        total: project.issues.length
      });
      return acc;
    }, []);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

exports.get_issues = async (req, res, next) => {
  const { project } = req.params;
  let filters;
  if (Object.keys(req.query).length) {
    filters = req.query;
    if (filters.open) {
      filters.open === 'true' ? filters.open = true : filters.open = false;
    }
  }
  try {
    const foundProject = await ProjectModel.findOne({ project_name: project });
    if (!foundProject) return res.status(404).json({ error: 'This project does not exist' });
    let issues = foundProject.issues;
    if (filters) {
      issues = issues.filter(issue => {
        for (let field in filters) {
          if (filters[field] != issue[field]) return;
        }
        return issue;
      });
    }
    issues.sort((a, b) => b.updated_on - a.updated_on);
    res.json(issues);
  } catch (err) {
    next(err);
  }
}

exports.create_project = async (req, res, next) => {
  const { project } = req.body;
  try {
    const foundProject = await ProjectModel.findOne({ project_name: project });
    if (foundProject) return res.status(400).json({ error: 'This project already exists' });
    const newProject = await ProjectModel.create({ project_name: project });
    res.status(201).json(newProject);
  } catch (err) {
    next(err);
  }
}

exports.create_issue = async (req, res, next) => {
  try {
    const conditions = { project_name: req.params.project };
    const update = { $push: { issues: req.body } };
    const options = { new: true };
    const updatedProject = await ProjectModel.findOneAndUpdate(conditions, update, options);
    if (!updatedProject) return res.status(400).json({ error: 'This project does not exist' });
    res.json(updatedProject.issues.slice(-1)[0]);
  } catch (err) {
    next(err);
  }
}

exports.edit_issue = async (req, res, next) => {
  const { project } = req.params;
  const { issue_id, edited_fields } = req.body;
  try {
    const foundProject = await ProjectModel.findOne({ project_name: project });
    if (!foundProject) return res.status(404).json({ error: 'This project does not exist' });
    const conditions = { project_name: req.params.project, 'issues._id': issue_id };
    let update;
    if (!edited_fields) {
      update = { $set: { 'issues.$.open': false } };
    } else {
      const updateObject = Object.keys(edited_fields).reduce((acc, field) => {
        acc[`issues.$.${field}`] = edited_fields[field];
        return acc;
      }, {});
      updateObject['issues.$.updated_on'] = Date.now();
      update = { $set: updateObject };
    }
    const updatedProject = await ProjectModel.findOneAndUpdate(conditions, update);
    if (!updatedProject) return res.status(400).json({ error: 'Issue with this ID does not exist' });
    res.json({ success: `Successfully updated issue - ${issue_id}` });
  } catch (err) {
    next(err);
  }
}

exports.delete_project = async (req, res, next) => {
  const { project_id } = req.body;
  try {
    const deletedProject = await ProjectModel.findOneAndDelete({ _id: project_id });
    if (!deletedProject) return res.status(400).json({ error: 'Project with this ID does not exist' });
    res.json({ success: `Successfully deleted project - ${project_id}` });
  } catch (err) {
    next(err);
  }
}

exports.delete_issue = async (req, res, next) => {
  const { project } = req.params;
  const { issue_id } = req.body;
  try {
    const foundProject = await ProjectModel.findOne({ project_name: project });
    if (!foundProject) return res.status(404).json({ error: 'This project does not exist' });
    const conditions = { project_name: req.params.project, 'issues._id': issue_id };
    const update = { $pull: { issues: { _id: issue_id } } };
    const updatedProject = await ProjectModel.findOneAndUpdate(conditions, update);
    if (!updatedProject) return res.status(400).json({ error: 'Issue with this ID does not exist' });
    res.json({ success: `Successfully deleted issue - ${issue_id}` });
  } catch (err) {
    next(err);
  }
}