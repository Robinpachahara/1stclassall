
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzwaUfaAyUhf_0HdogD6pNXIERJwfQpIfylsAqmMdYZgWCfptmEWOxgzpnBADVdABbaeA/exec';

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('errorMessage');
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        sessionStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'admin-panel.html';
        
    } catch (error) {
        errorElement.style.display = 'block';
        errorElement.textContent = 'Login failed. Please try again.';
    }
}
