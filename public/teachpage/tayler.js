
const form = document.getElementById('updateForm');
const msg = document.getElementById('msg');
const saveBtn = document.getElementById('saveBtn');
const spinner = document.getElementById('btnSpinner');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Bootstrap validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const adminKey = document.getElementById('key').value.trim();
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);

    // UI: disable and show spinner
    saveBtn.disabled = true;
    spinner.style.display = 'inline-block';
    msg.innerHTML = '';

    try {
        const res = await fetch('/api/update-solution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminKey, lat, lng })
        });

        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: res.ok ? 'Updated' : 'Unexpected response' };
        }

        if (res.ok) {
            msg.innerHTML = `${data.message || 'Coordinates updated successfully.'}`;
            if (!(data.message === 'No guesses submitted. Database cleared.')) {
                alert(`Winner details:\nName: ${data.name}\nEmail: ${data.email}\nDistance: ${data.distance} km`);
            }
            // form.classList.remove('was-validated');
            // form.reset();
        } else {
            msg.innerHTML = `<div class="alert alert-danger mb-0">${data.error || data.message || 'Failed to update.'}</div>`;
        }
    } catch (err) {
        alert("An error occurred: " + err.message);
        msg.innerHTML = `<div class="alert alert-danger mb-0">Network error. Please try again.</div>`;
    } finally {
        saveBtn.disabled = false;
        spinner.style.display = 'none';
    }
});