const API = '/api/tasks';
const $ = (id) => document.getElementById(id);
const list = $('task-list'), form = $('task-form');

function showMessage(text) {
  $('message').textContent = text || '';
  $('message').hidden = !text;
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'حصل خطأ، حاولي تاني');
  return data;
}

function render(tasks) {
  list.innerHTML = '';
  $('empty').hidden = tasks.length > 0;
  const done = tasks.filter((t) => t.completed).length;
  $('counter').textContent = tasks.length ? `${done} من ${tasks.length} اكتملت` : '';

  for (const t of tasks) {
    const li = document.createElement('li');
    li.className = 'task' + (t.completed ? ' done' : '');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'check';
    check.checked = t.completed;
    check.setAttribute('aria-label', 'Completed');
    check.addEventListener('change', () => toggle(t));

    const body = document.createElement('div');
    body.className = 'task-body';
    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = t.title;           // textContent => آمن من XSS
    body.appendChild(title);
    if (t.description) {
      const d = document.createElement('p');
      d.className = 'task-desc';
      d.textContent = t.description;
      body.appendChild(d);
    }

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const edit = document.createElement('button');
    edit.className = 'btn small';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => startEdit(t));
    const del = document.createElement('button');
    del.className = 'btn small danger';
    del.textContent = 'Delete';
    del.addEventListener('click', () => remove(t));
    actions.append(edit, del);

    li.append(check, body, actions);
    list.appendChild(li);
  }
}

async function load() {
  try { render(await request(API)); showMessage(''); }
  catch (e) { showMessage(e.message); }
}

async function toggle(t) {
  try { await request(`${API}/${t.id}`, { method: 'PUT', body: JSON.stringify({ completed: !t.completed }) }); load(); }
  catch (e) { showMessage(e.message); }
}

async function remove(t) {
  if (!confirm(`حذف المهمة "${t.title}"؟`)) return;
  try { await request(`${API}/${t.id}`, { method: 'DELETE' }); if ($('task-id').value == t.id) resetForm(); load(); }
  catch (e) { showMessage(e.message); }
}

function startEdit(t) {
  $('task-id').value = t.id;
  $('title').value = t.title;
  $('description').value = t.description || '';
  $('submit-btn').textContent = 'Save changes';
  $('cancel-btn').hidden = false;
  $('title').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  form.reset();
  $('task-id').value = '';
  $('submit-btn').textContent = 'Add Task';
  $('cancel-btn').hidden = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('task-id').value;
  const body = JSON.stringify({ title: $('title').value, description: $('description').value });
  try {
    await request(id ? `${API}/${id}` : API, { method: id ? 'PUT' : 'POST', body });
    resetForm(); showMessage(''); load();
  } catch (err) { showMessage(err.message); }
});
$('cancel-btn').addEventListener('click', resetForm);

load();
