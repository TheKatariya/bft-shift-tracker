const form = document.getElementById('shift-form');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const successScreen = document.getElementById('success-screen');

document.getElementById('shift_date').value = new Date().toISOString().slice(0, 10);

function getChecked(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
}

function calcProgress() {
  const required = [
    document.getElementById('staff_name').value.trim(),
    document.getElementById('shift_date').value,
    document.querySelector('input[name="shift_type"]:checked'),
  ];
  const filled = required.filter(Boolean).length;
  const pct = Math.round((filled / required.length) * 100);
  progressFill.style.width = pct + '%';
  progressPct.textContent = pct;
}

form.addEventListener('input', calcProgress);
form.addEventListener('change', calcProgress);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('staff_name').value.trim();
  const date = document.getElementById('shift_date').value;
  const shiftType = document.querySelector('input[name="shift_type"]:checked');

  if (!name || !date || !shiftType) {
    showError('Please fill in your name, date, and shift type before submitting.');
    return;
  }

  hideError();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  const payload = {
    staff_name: name, shift_date: date, shift_type: shiftType.value,
    todays_focus: document.getElementById('todays_focus').value,
    goals: getChecked('goals'),
    opening_tasks: getChecked('opening_tasks'),
    calls_made: parseInt(document.getElementById('calls_made').value) || 0,
    conversations: parseInt(document.getElementById('conversations').value) || 0,
    text_conversations: parseInt(document.getElementById('text_conversations').value) || 0,
    emails_sent: parseInt(document.getElementById('emails_sent').value) || 0,
    bookings: parseInt(document.getElementById('bookings').value) || 0,
    shows: parseInt(document.getElementById('shows').value) || 0,
    new_members: parseInt(document.getElementById('new_members').value) || 0,
    pack_holders: parseInt(document.getElementById('pack_holders').value) || 0,
    sales: parseInt(document.getElementById('sales').value) || 0,
    quality_checks: getChecked('quality_checks'),
    moved_needle: document.getElementById('moved_needle').value,
    avoided_hesitated: document.getElementById('avoided_hesitated').value,
    do_better: document.getElementById('do_better').value,
    biggest_win: document.getElementById('biggest_win').value,
    cleaning_notes: document.getElementById('cleaning_notes').value,
    management_notes: document.getElementById('management_notes').value,
  };

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      form.hidden = true;
      successScreen.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showError('Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Shift Recap';
    }
  } catch {
    showError('Could not connect to server. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Shift Recap';
  }
});

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() { formError.hidden = true; }

function resetForm() {
  form.reset();
  document.getElementById('shift_date').value = new Date().toISOString().slice(0, 10);
  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Shift Recap';
  form.hidden = false;
  successScreen.hidden = true;
  progressFill.style.width = '0%';
  progressPct.textContent = '0';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
