// script.js
const chatLog = document.getElementById("chat-log");
let questionIndex = 0;

const questions = [
    "Could you provide the patient’s HbA1c level, eGFR, and any other relevant comorbidities?",
    "Is the patient currently taking Metformin?",
    "Is the patient compliant with current medications and lifestyle changes?",
    "Is the patient eligible for SGLT-2 inhibitors (e.g., any cardiovascular disease or CKD)?",
    "For SGLT-2 inhibitor recommendation: Canagliflozin 100 mg daily, titrate to 300 mg if tolerated, avoid if HbA1c >86 mmol/mol. Refer to guidance if unsure about renal dosing.",
    "For DPP-4 inhibitors: Recommend Sitagliptin 100 mg daily, adjust to 50 mg if eGFR 30-45, and 25 mg if eGFR <30. Refer to guidance if unsure.",
    "For lifestyle: Is the patient following diet, exercise, and other lifestyle advice?",
    "Provide summary of findings and management plan. Refer to guidance for additional details if needed."
];

function sendMessage(event) {
    if (event.key === "Enter") {
        const input = document.getElementById("chat-input").value;
        if (input.trim() === "") return;

        // Display user's message
        displayMessage(input, "user");

        // Generate next question or response
        nextQuestion(input);
    }
}

function displayMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);
    messageElement.innerText = message;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
    document.getElementById("chat-input").value = "";
}

function nextQuestion(input) {
    if (questionIndex < questions.length - 1) {
        questionIndex++;
        displayMessage(questions[questionIndex], "bot");
    } else {
        displayMessage("Thank you for completing the diabetes review. Refer to the guidance for any further details.", "bot");
    }
}

// Initialize chat
displayMessage(questions[questionIndex], "bot");
