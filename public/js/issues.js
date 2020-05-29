window.onload = () => {

  const encodedProject = location.pathname.slice(1);
  const decodedProject = decodeURIComponent(encodedProject);
  document.title = `${decodedProject} | Issue Tracker`;

  const navigation = document.querySelector('.content__navigation');
  navigation.innerHTML = `${navigation.innerHTML} / <a href="/${encodedProject}">${decodedProject}</a>`;

  const mainContent = document.querySelector('.content');
  const filtersForm = mainContent.querySelector('.filters-form');
  const filtersButtons = filtersForm.querySelectorAll('.filters-form__apply, .filters-form__reset');
  const issuesList = mainContent.querySelector('.content__issues-list');
  const modal = document.querySelector('.modal');
  const modalForm = modal.querySelector('.modal-form');

  // "refresh" parameter is used only when dealing with filters
  // Allows to rerender just the issues list in accordance with filters
  function renderIssues(issues, refresh = false) {
    if (issues.length) {
      issuesList.innerHTML = issues.map(issue => `
      <li class="issue">
        <div class="issue__header">
          <i class="fas fa-circle issue__state ${issue.open ? 'issue__state-pending': 'issue__state-solved'}"></i>
          <p class="issue__title" data-field="issue_title">${issue.issue_title}</p>
          <p class="issue__timestamp">${moment(new Date(issue.updated_on)).fromNow()}</p>
          <i class="fas fa-ellipsis-v issue__divider"></i>
          <div class="issue__operations">
            <button title="Close" ${issue.open ? '' : 'disabled'}>
              <i class="far fa-check-circle issue__close" data-id="${issue._id}"></i>
            </button>    
            <button title="Edit" ${issue.open ? '' : 'disabled'}>
              <i class="far fa-edit issue__edit" data-id="${issue._id}"></i>
            </button>
            <button title="Delete">
              <i class="far fa-trash-alt issue__delete" data-id="${issue._id}"></i>
            </button>
          </div>
        </div>
        <div class="issue__body">
          <p class="issue__text" data-field="issue_text">${issue.issue_text}</p>          
        </div>
        <div class="issue__footer">
          <p class="issue__author">By: <span data-field="created_by">${issue.created_by}</span></p>
          <p class="issue__recipient">To: <span data-field="assigned_to">${issue.assigned_to ? issue.assigned_to : 'N/A'}</span></p>
          <p class="issue__status">Status: <span data-field="status_text">${issue.status_text ? issue.status_text : 'N/A'}</span></p>
        </div>
      </li>`).join('');
    } else {
      issuesList.innerHTML = '<i class="fas fa-snowman content__placeholder"></i>';
    }
    if (refresh) {
      fadeIn(issuesList);
      filtersButtons.forEach(button => button.disabled = false);
    } else {
      fadeIn(mainContent);
    }
  }

  // "id" is used to bind modal form to specific issue
  // "data" parameter is used only for editing, to fill form inputs with current values of the edited issue
  function buildModalForm(action, id = null, data = null) {
    if (action === 'create') {
      modalForm.innerHTML = `
        <div class="modal-form__form-field">
          <label for="issue_title">Issue title*</label>
          <input type="text" name="issue_title" id="issue_title" maxlength="30">
        </div>
        <div class="modal-form__form-field">
          <label for="issue_text">Issue text*</label>
          <textarea name="issue_text" id="issue_text" cols="30" rows="3" maxlength="3000"></textarea>
        </div>
        <div class="modal-form__form-field">
          <label for="created_by">Created By*</label>
          <input type="text" name="created_by" id="created_by" maxlength="20">
        </div>        
        <div class="modal-form__form-field">
          <label for="assigned_to">Assigned To</label>
          <input type="text" name="assigned_to" id="assigned_to" maxlength="20">
        </div>
        <div class="modal-form__form-field">
          <label for="status_text">Status</label>
          <input type="text" name="status_text" id="status_text" maxlength="20">
        </div>
        <div class="modal-form__form-field">
          <input type="submit" class="modal-form__create-issue confirm-action" value="Create">
        </div>`;
    } else if (action === 'close') {
      modalForm.innerHTML = `
        <p class="modal-form__dialogue">Are you sure you want to close this issue?</p>
        <div class="modal-form__form-field">
          <input type="button" class="modal-form__close-issue confirm-action" value="Yes" data-id="${id}">
          <input type="button" class="reject-action" value="No">
        </div>`;
    } else if (action === 'edit') {
      modalForm.innerHTML = `
        <div class="modal-form__form-field">
          <label for="issue_title">Issue title*</label>
          <input type="text" name="issue_title" id="issue_title" maxlength="30" value="${data.issue_title}">
        </div>
        <div class="modal-form__form-field">
          <label for="issue_text">Issue text*</label>
          <textarea name="issue_text" id="issue_text" cols="30" rows="3">${data.issue_text}</textarea>
        </div>
        <div class="modal-form__form-field">
          <label for="created_by">Created By*</label>
          <input type="text" name="created_by" id="created_by" maxlength="20" value="${data.created_by}">
        </div>        
        <div class="modal-form__form-field">
          <label for="assigned_to">Assigned To</label>
          <input type="text" name="assigned_to" id="assigned_to" maxlength="20" value="${data.assigned_to}">
        </div>
        <div class="modal-form__form-field">
          <label for="status_text">Status</label>
          <input type="text" name="status_text" id="status_text" maxlength="20" value="${data.status_text}">
        </div>
        <div class="modal-form__form-field">
          <input type="submit" class="modal-form__edit-issue confirm-action" value="Save changes" data-id="${id}">
        </div>`;
    } else if (action === 'delete') {
      modalForm.innerHTML = `
        <p class="modal-form__dialogue">Are you sure you want to delete this issue?</p>
        <div class="modal-form__form-field">
          <input type="button" class="modal-form__delete-issue confirm-action" value="Yes" data-id="${id}">
          <input type="button" class="reject-action" value="No">
        </div>`;
    }
    fadeIn(modal);
    const firstInput = modalForm.querySelector('input[type="text"]');
    if (firstInput) firstInput.focus();
  }

  function createIssue() {
    const createBtn = modalForm.querySelector('.modal-form__create-issue');
    const payload = scrapeModalFormData();
    createBtn.disabled = true;
    fetch(`/api/issues/${encodedProject}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          createBtn.disabled = false;
          showErrors(result.error);
        } else {
          location.reload();
        }
      })
      .catch(err => console.log(err));
  }

  function closeIssue(id) {
    modalForm.querySelectorAll('[type="button"]').forEach(button => button.disabled = true);
    fetch(`/api/issues/${encodedProject}`, {
        method: 'PUT',
        body: JSON.stringify({ issue_id: id }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => result.error ? console.log(result.error) : location.reload())
      .catch(err => console.log(err));
  }

  function editIssue(id) {
    const saveChangesBtn = modalForm.querySelector('.modal-form__edit-issue');
    const newValues = scrapeModalFormData();
    const payload = compareDataObjects(newValues, oldValues);
    // if payload is an empty object after comparison do not make a request
    if (!Object.keys(payload).length) {
      fadeOut(modal);
      return;
    }
    saveChangesBtn.disabled = true;
    fetch(`/api/issues/${encodedProject}`, {
        method: 'PUT',
        body: JSON.stringify({ issue_id: id, edited_fields: payload }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          saveChangesBtn.disabled = false;
          showErrors(result.error);
        } else {
          location.reload();
        }
      })
      .catch(err => console.log(err));
  }

  function deleteIssue(id) {
    modalForm.querySelectorAll('[type="button"]').forEach(button => button.disabled = true);
    fetch(`/api/issues/${encodedProject}`, {
        method: 'DELETE',
        body: JSON.stringify({ issue_id: id }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => result.error ? console.log(result.error) : location.reload())
      .catch(err => console.log(err));
  }

  // ********** Helpers **********

  function compareDataObjects(first, second) {
    const difference = Object.keys(first).reduce((acc, key) => {
      if (first[key] !== second[key]) acc[key] = first[key];
      return acc;
    }, {});
    return difference;
  }

  function showErrors(errors) {
    // Delete all previous error messages if there are any, then rerender new ones
    const previousErrors = modalForm.querySelectorAll('.modal-form__error-msg');
    if (previousErrors.length) previousErrors.forEach(error => error.remove());
    // Focus on first wrong field
    const firstWrongField = modalForm.querySelector(`[name="${errors[0].field}"]`);
    firstWrongField.focus();
    firstWrongField.select();
    errors.forEach(error => {
      const wrongField = modalForm.querySelector(`[name="${error.field}"]`);
      if (!wrongField.nextElementSibling) {
        wrongField.insertAdjacentHTML('afterend', `<p class="modal-form__error-msg">${error.message}</p>`);
      } else {
        wrongField.nextElementSibling.textContent = error.message;
      }
    });
  }

  // ********** Filters **********

  function resetFilters() {
    filtersForm.reset();
    filtersButtons.forEach(button => button.disabled = true);
    fadeOut(issuesList, () => getIssues(true));
  }

  function applyFilters(e) {
    e.preventDefault();
    const query = scrapeFilterForm();
    if (!query) return;
    filtersButtons.forEach(button => button.disabled = true);
    fetch(`/api/issues/${encodedProject}?${query}`)
      .then(response => response.json())
      .then(issues => {
        fadeOut(issuesList, () => renderIssues(issues, true));
      })
      .catch(err => console.log(err));
  }

  // Choose either solved or pending issues and not both (disables neighboring checkbox if trying to select both)
  const solvedFilter = mainContent.querySelector('.filters-form__solved');
  const pendingFilter = mainContent.querySelector('.filters-form__pending');
  solvedFilter.addEventListener('click', () => pendingFilter.checked = false);
  pendingFilter.addEventListener('click', () => solvedFilter.checked = false);

  // ********** Scrapers **********

  function scrapeModalFormData() {
    const fields = [...modalForm.querySelectorAll('[name]')];
    const values = fields.reduce((acc, field) => {
      acc[field.name] = field.value.trim();
      return acc;
    }, {});
    return values;
  }

  // Global variable that stores all current values of the scraped issue
  // Later used for comparison against new (edited) values
  // Allows to send to the server only changed fields
  let oldValues = {};

  function scrapeIssueData(target) {
    const issue = target.closest('.issue');
    const elements = [...issue.querySelectorAll('[data-field]')];
    elements.forEach(element => {
      oldValues[element.dataset.field] = element.textContent !== 'N/A' ? element.textContent : '';
    });
  }

  // Scrapes data and forms a string of parameters in URL format
  function scrapeFilterForm() {
    const fields = [...filtersForm.querySelectorAll('[type="text"], :checked')];
    const query = fields
      .filter(field => field.value.trim())
      .map(field => `${field.name}=${encodeURIComponent(field.value.trim())}`)
      .join('&');
    return query;
  }

  // ********** Delegations **********

  function delegateModalEvents(e) {
    e.preventDefault();
    const target = e.target;
    if (target.matches('.modal') || target.matches('.reject-action')) {
      fadeOut(modal);
    } else if (target.matches('.modal-form__create-issue')) {
      createIssue();
    } else if (target.matches('.modal-form__edit-issue')) {
      editIssue(target.dataset.id);
    } else if (target.matches('.modal-form__close-issue')) {
      closeIssue(target.dataset.id);
    } else if (target.matches('.modal-form__delete-issue')) {
      deleteIssue(target.dataset.id);
    }
  }

  function delegateMainContentEvents(e) {
    const target = e.target;
    if (target.matches('.content__toggle-modal')) {
      buildModalForm('create');
    } else if (target.matches('.issue__close')) {
      buildModalForm('close', target.dataset.id);
    } else if (target.matches('.issue__edit')) {
      scrapeIssueData(target);
      buildModalForm('edit', target.dataset.id, oldValues);
    } else if (target.matches('.issue__delete')) {
      buildModalForm('delete', target.dataset.id);
    } else if (target.matches('.content__toggle-filters')) {
      toggle(filtersForm);
    } else if (target.matches('.filters-form__reset')) {
      resetFilters();
    } else if (target.matches('.filters-form__apply')) {
      applyFilters(e);
    }
  }

  // ********** Starting point **********

  function getIssues(refresh = false) {
    fetch(`/api/issues/${encodedProject}`)
      .then(response => response.json())
      .then(issues => renderIssues(issues, refresh))
      .catch(err => console.log(err));
  }

  getIssues();

  // ********** Event listeners **********

  mainContent.addEventListener('click', e => delegateMainContentEvents(e));
  modal.addEventListener('click', e => delegateModalEvents(e));
}