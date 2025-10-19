document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const fullname = document.getElementById("fullname").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    const allowedDomains = ["@student.st-chris.net", "@staff.st-chris.net"];
    const validEmail = allowedDomains.some(domain => email.endsWith(domain));

    if (!validEmail) {
        errorMsg.textContent = "Please use your school email address.";
        return;
    }

    if (fullname.length < 3) {
        errorMsg.textContent = "Please enter your full name.";
        return;
    }
    const res = fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullname }),
    });
    res.then(response => response.json()).then(data => {
        if (data.message === "Login successful") {
            localStorage.setItem("fullname", fullname);
            localStorage.setItem("email", email);
            window.location.href = "map/map.html";
        } else {
            errorMsg.textContent = data.message;
        }
    });
});