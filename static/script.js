document.addEventListener('DOMContentLoaded', function() {
    const questionForm = document.getElementById('questionForm');
    const questionInput = document.getElementById('questionInput');
    const chatMessages = document.getElementById('chatMessages');
    const questionChips = document.querySelectorAll('.question-chip');
    
    // Handle question submission
    questionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const question = questionInput.value.trim();
        if (question) {
            addMessage('user', question);
            showLoadingIndicator();
            askQuestion(question);
            questionInput.value = '';
        }
    });
    
    // Handle suggested question chips
    questionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            questionInput.value = question;
            questionForm.dispatchEvent(new Event('submit'));
        });
    });
    
    // Function to add a message to the chat
    function addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = content;
        
        messageContent.appendChild(paragraph);
        messageDiv.appendChild(messageContent);
        
        if (sender !== 'loading') {
            const timestamp = document.createElement('div');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            messageDiv.appendChild(timestamp);
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Function to show loading indicator
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant loading';
        loadingDiv.id = 'loadingIndicator';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'loading-animation';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            loadingContent.appendChild(dot);
        }
        
        loadingDiv.appendChild(loadingContent);
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();
    }
    
    // Function to remove loading indicator
    function removeLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }
    
    // Function to scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to send question to backend API
    async function askQuestion(question) {
        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question }),
            });
            
            const data = await response.json();
            
            removeLoadingIndicator();
            
            if (data.error) {
                addMessage('system', `Error: ${data.error}`);
            } else {
                // Process the response - adding formatting for markdown
                const formattedAnswer = formatMarkdown(data.answer);
                addFormattedMessage('assistant', formattedAnswer);
            }
        } catch (error) {
            removeLoadingIndicator();
            addMessage('system', 'Sorry, there was a problem connecting to DoraFinance. Please try again later.');
            console.error('Error:', error);
        }
    }
    
    // Add a formatted message with HTML content
    function addFormattedMessage(sender, htmlContent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = htmlContent;
        
        messageDiv.appendChild(messageContent);
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messageDiv.appendChild(timestamp);
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Simple markdown formatter
    function formatMarkdown(text) {
        // Convert markdown bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert markdown italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert markdown lists
        text = text.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Convert markdown headers
        text = text.replace(/^### (.*$)/gm, '<h4>$1</h4>');
        text = text.replace(/^## (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^# (.*$)/gm, '<h2>$1</h2>');
        
        // Convert line breaks
        text = text.replace(/\n\n/g, '<br><br>');
        
        return text;
    }
});