// Google Sheets API configuration
const SHEET_ID = '1cnJ1ebHo2nL-qe1OLuT2ikKQzBNQ4Y6QWGIjZppWObY'; // Add your Google Sheet ID here
const SHEET_NAME = 'Leads';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwwukdCYZitmphXm-DR1I-UqfekhyoSZGonVLa-EO3thpaefo3Ge_rEiBoV4A4eqLl/exec'; // Add your Google Apps Script URL here
const WHATSAPP_NUMBER = '+916396369702'; // Add your WhatsApp number here (with country code)

class Chatbot {
    constructor() {
        this.state = {
            name: '',
            phone: '',
            query: '',
            currentStep: 0,
            isComplete: false
        };
        
        this.greetings = [
            "Hi there! ",
            "Hello! Welcome to our furniture store! ",
            "Welcome! How can I help you today? "
        ];
        
        this.questions = [
            { text: "I'm here to help you find the perfect furniture! What's your name?", field: 'name' },
            { text: "Great to meet you! Could you share your phone number so we can stay in touch?", field: 'phone' },
            { text: "How can I assist you with our furniture collection today?", field: 'query' }
        ];

        this.responses = {
            name: [
                "Nice to meet you, {name}! ",
                "Great to have you here, {name}! ",
                "Hello {name}! I'm excited to help you today! "
            ],
            phone: [
                "Thanks for sharing that! ",
                "Perfect! I've got that noted down! ",
                "Excellent! Now I can keep you updated! "
            ]
        };
        
        this.init();
    }

    init() {
        // Create chat widget HTML
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="whatsapp-button">
                <i class="fab fa-whatsapp"></i>
            </a>
            <button class="chat-button">
                <i class="fas fa-comments"></i>
                Chat with us
            </button>
            <div class="chat-container">
                <div class="chat-header">
                    <span>Chat Support</span>
                    <button class="chat-close">&times;</button>
                </div>
                <div class="chat-messages">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message..." />
                    <button class="send-button">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        this.addEventListeners();
        
        // Start chat with random greeting
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        this.addMessage(greeting, 'bot');
        setTimeout(() => {
            this.addMessage(this.questions[0].text, 'bot');
        }, 1000);
    }

    addEventListeners() {
        const widget = document.querySelector('.chat-widget');
        const chatButton = widget.querySelector('.chat-button');
        const closeButton = widget.querySelector('.chat-close');
        const input = widget.querySelector('.chat-input input');
        const sendButton = widget.querySelector('.send-button');

        chatButton.addEventListener('click', () => {
            widget.classList.add('active');
            input.focus();
        });

        closeButton.addEventListener('click', () => {
            widget.classList.remove('active');
        });

        const handleSend = () => {
            const value = input.value.trim();
            if (value) {
                this.processUserInput(value);
                input.value = '';
            }
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });

        sendButton.addEventListener('click', handleSend);
    }

    showTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        indicator.style.display = 'block';
        return new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        indicator.style.display = 'none';
    }

    addMessage(text, sender) {
        const messagesDiv = document.querySelector('.chat-messages');
        const message = document.createElement('div');
        message.className = `message ${sender}-message`;
        message.innerHTML = text;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async sendToGoogleSheets() {
        try {
            const data = {
                name: this.state.name,
                phone: this.state.phone,
                query: this.state.query
            };
            
            console.log('Attempting to send data:', data);
            
            // First try to fetch with credentials
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Change to no-cors mode
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // Since no-cors mode doesn't allow reading the response,
            // we'll consider it successful if we get here without an error
            this.addMessage("Thank you! Our team will get back to you soon!", 'bot');
            
            // Optional: Add WhatsApp follow-up message
            setTimeout(() => {
                this.addMessage("Feel free to continue our conversation on WhatsApp for faster responses!", 'bot');
            }, 1500);

        } catch (error) {
            console.error('Detailed error:', {
                message: error.message,
                stack: error.stack,
                error: error
            });
            
            this.addMessage("I apologize, but there was an error saving your information. Please try again later or contact us directly.", 'bot');
            
            // Add a retry option
            setTimeout(() => {
                this.addMessage("Would you like to try again? Or you can reach us directly through WhatsApp.", 'bot');
            }, 1500);
        }
    }

    processUserInput(message) {
        if (this.state.currentStep < this.questions.length) {
            const currentQuestion = this.questions[this.state.currentStep];
            this.state[currentQuestion.field] = message;
            
            // Add user's message to chat
            this.addMessage(message, 'user');
            
            if (currentQuestion.field === 'name' || currentQuestion.field === 'phone') {
                const responses = this.responses[currentQuestion.field];
                const response = responses[Math.floor(Math.random() * responses.length)];
                const formattedResponse = response.replace(`{${currentQuestion.field}}`, message);
                
                setTimeout(() => {
                    this.addMessage(formattedResponse, 'bot');
                    this.state.currentStep++;
                    if (this.state.currentStep < this.questions.length) {
                        this.addMessage(this.questions[this.state.currentStep].text, 'bot');
                    }
                }, 1000);
            } else if (currentQuestion.field === 'query') {
                this.state.currentStep++;
                this.state.isComplete = true;
                // Send data to Google Sheets
                this.sendToGoogleSheets();
            }
        }
    }
}

// Initialize chatbot when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
