// Google Apps Script URL
const NEWSLETTER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpms9OeG0yU_uf6dIE4nSSB9nHZfxT116NUslKVZ0quwUanoE-FfMkgblYvkQafFSn/exec';

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function handleNewsletterSubmit(email, buttonElement) {
    try {
        // Convert email to lowercase
        email = email.toLowerCase();

        if (!validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const originalText = buttonElement.value || buttonElement.innerText;
        buttonElement.disabled = true;
        buttonElement.value = 'Subscribing...';

        const response = await fetch(NEWSLETTER_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'newsletter',
                email: email
            })
        });

        buttonElement.value = 'Subscribed!';
        buttonElement.style.backgroundColor = '#4CAF50';

        const inputElement = buttonElement.previousElementSibling;
        if (inputElement && inputElement.tagName === 'INPUT') {
            inputElement.value = '';
        }

        setTimeout(() => {
            buttonElement.disabled = false;
            buttonElement.value = originalText;
            buttonElement.style.backgroundColor = '';
        }, 3000);

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        buttonElement.value = 'Error!';
        buttonElement.style.backgroundColor = '#f44336';

        setTimeout(() => {
            buttonElement.disabled = false;
            buttonElement.value = originalText;
            buttonElement.style.backgroundColor = '';
        }, 3000);

        alert(error.message || 'Failed to subscribe. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Handle main newsletter section
    const mainNewsletterSection = document.querySelector('section.newsletter');
    if (mainNewsletterSection) {
        const emailInput = mainNewsletterSection.querySelector('input.email');
        const subscribeBtn = mainNewsletterSection.querySelector('input.btn[type="submit"]');

        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleNewsletterSubmit(emailInput.value, subscribeBtn);
            });
        }
    }

    // Handle footer newsletter
    const footerSection = document.querySelector('section.footer');
    if (footerSection) {
        const emailInput = footerSection.querySelector('input.email');
        const subscribeBtn = footerSection.querySelector('input.btn[type="submit"]');

        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleNewsletterSubmit(emailInput.value, subscribeBtn);
            });
        }
    }
});