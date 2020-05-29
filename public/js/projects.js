window.onload = () => {

  const mainContent = document.querySelector('.content');
  const projectsList = mainContent.querySelector('.content__projects-list');
  const modal = document.querySelector('.modal');
  const modalForm = modal.querySelector('.modal-form');

  function renderProjects(projects) {
    if (projects.length) {
      projectsList.innerHTML = projects.map(project => `
      <li class="project">
        <a href="/${encodeURIComponent(project.name)}" class="project__name">${project.name}
          <div class="project__counters">
            <span class="project__badge project__solved-count" title="Solved issues">${project.solved}</span>
            <span class="project__badge project__pending-count" title="Pending issues">${project.pending}</span>
            <span class="project__badge project__total-count" title="Total count of issues">${project.total}</span>
          </div>
        </a>
        <span class="fa-stack fa-sm project__delete" title="Delete" data-id="${project._id}">
          <i class="fa fa-circle fa-stack-2x"></i>
          <i class="fas fa-times fa-stack-1x"></i>
        </span>
      </li>`).join('');
    } else {
      projectsList.innerHTML = '<i class="fas fa-snowman content__placeholder"></i>';
    }
    fadeIn(mainContent);
  }

  function buildModalForm(action, id) {
    if (action === 'create') {
      modalForm.innerHTML = `
        <div class="modal-form__form-field">
          <label for="project">Project name*</label>
          <input type="text" name="project" id="project" maxlength="30">
        </div>
        <div class="modal-form__form-field">
          <input type="submit" class="modal-form__create-project confirm-action" value="Create">
        </div>`;
    } else if (action === 'delete') {
      modalForm.innerHTML = `
        <p class="modal-form__dialogue">Are you sure you want to delete this project?</p>
        <div class="modal-form__form-field">
          <input type="button" class="modal-form__delete-project confirm-action" value="Yes" data-id="${id}">
          <input type="button" class="reject-action" value="No">
        </div>`;
    }
    fadeIn(modal);
    const firstInput = modalForm.querySelector('input[type="text"]');
    if (firstInput) firstInput.focus();
  }

  function createProject() {
    const project = modalForm.project.value.trim();
    const createBtn = modalForm.querySelector('.modal-form__create-project');
    createBtn.disabled = true;
    fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ project }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          const wrongField = modalForm.querySelector('input[name="project"]');
          const errorMsg = modalForm.querySelector('.modal-form__error-msg');
          wrongField.focus();
          wrongField.select();
          createBtn.disabled = false;
          if (!errorMsg) {
            wrongField.insertAdjacentHTML('afterend', `<p class="modal-form__error-msg">${result.error}</p>`);
          } else {
            errorMsg.textContent = result.error;
          }
        } else {
          location = `/${encodeURIComponent(project)}`;
        }
      })
      .catch(err => console.log(err));
  }

  function deleteProject(id) {
    modalForm.querySelectorAll('[type="button"]').forEach(button => button.disabled = true);
    fetch(`/api/projects`, {
        method: 'DELETE',
        body: JSON.stringify({ project_id: id }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => result.error ? console.log(result.error) : location.reload())
      .catch(err => console.log(err));
  }

  // ********** Delegations **********

  function delegateModalEvents(e) {
    e.preventDefault();
    const target = e.target;
    if (target.matches('.modal') || target.matches('.reject-action')) {
      fadeOut(modal);
    } else if (target.matches('.modal-form__create-project')) {
      createProject();
    } else if (target.matches('.modal-form__delete-project')) {
      deleteProject(target.dataset.id);
    }
  }

  function delegateMainContentEvents(e) {
    const target = e.target;
    if (target.matches('.content__toggle-modal')) {
      buildModalForm('create', null);
    } else if (target.parentElement.matches('.project__delete')) {
      buildModalForm('delete', target.parentElement.dataset.id);
    }
  }

  // ********** Starting point **********

  function getProjects() {
    fetch('/api/projects')
      .then(response => response.json())
      .then(projects => renderProjects(projects))
      .catch(err => console.log(err));
  }

  getProjects();

  // ********** Event listeners **********

  mainContent.addEventListener('click', e => delegateMainContentEvents(e));
  modal.addEventListener('click', e => delegateModalEvents(e));
}