// script.js
const chatLog = document.getElementById("chat-log");
let questionIndex = 0;
let patientData = {}; // Stores user responses for tailored follow-up

const questions = [
    "Provide the patient’s HbA1c, eGFR, and any comorbidities (e.g., CVD, CKD).",
    "Is the patient on Metformin? Include dose and frequency if yes.",
    "Metformin: If eGFR >45, up to 1g twice daily is standard. For eGFR 30-45, reduce to 500 mg twice daily. Confirm if this aligns with current dosing.",
    "Any side effects from Metformin, like nausea or GI issues? (Y/N)",
    "Consider SGLT-2 inhibitors for CKD or CVD, e.g., Dapagliflozin 10 mg daily. Suitable for your patient? (Y/N)",
    "DPP-4 inhibitors: For renal function, Sitagliptin 50 mg daily if eGFR 30-45. Does this align with patient needs? (Y/N)",
    "Is the patient following dietary and activity guidelines? (Y/N)",
    "Would you like a summary of medications, lifestyle advice, or follow-up intervals?"
];

async function sendMessage(event) {
    if (event.key === "Enter") {
        const inputField = document.getElementById("chat-input");
        const userInput = inputField.value.trim();
        if (!userInput) return;

        // Display user message
        displayMessage(userInput, "user");

        // Clear input field
        inputField.value = "";

        // Save response
        saveResponse(userInput);

        // Call GPT-4 API for response based on user input and current question context
        const botResponse = await fetchGPT4Response(userInput);
        displayMessage(botResponse, "bot");

        // Move to the next question if applicable
        nextQuestion();
    }
}

// Display message in chat log
function displayMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);
    messageElement.innerText = message;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Save responses for tailored follow-up
function saveResponse(input) {
    switch (questionIndex) {
        case 0:
            const [hba1c, egfr, comorbidities] = input.split(",");
            patientData.hba1c = parseFloat(hba1c.trim());
            patientData.egfr = parseFloat(egfr.trim());
            patientData.comorbidities = comorbidities ? comorbidities.trim() : "";
            break;
        case 1:
            patientData.metformin = input.toLowerCase().includes("yes");
            patientData.metforminDose = input.toLowerCase().includes("yes") ? input.trim() : "None";
            break;
        case 2:
            patientData.metforminAligned = input.toLowerCase().includes("yes");
            break;
        case 3:
            patientData.sideEffects = input.toLowerCase().includes("yes");
            break;
        case 4:
            patientData.suitableForSGLT2 = input.toLowerCase().includes("yes");
            break;
        case 5:
            patientData.suitableForDPP4 = input.toLowerCase().includes("yes");
            break;
        case 6:
            patientData.lifestyleCompliant = input.toLowerCase().includes("yes");
            break;
    }
}

// Fetch response from GPT-4 based on current question context
async function fetchGPT4Response(userInput) {
    let prompt = questions[questionIndex];

    // Adjust prompt based on responses
    if (questionIndex === 2 && patientData.metformin) {
        prompt = `If eGFR >45, up to 1g Metformin twice daily is standard. For eGFR 30-45, reduce to 500 mg twice daily. Current dose aligns? (Y/N)`;
    } else if (questionIndex === 3 && patientData.metformin && !patientData.metforminAligned) {
        prompt = "Dose may not align. Monitor renal function. Any GI side effects like nausea? (Y/N)";
    } else if (questionIndex === 4 && patientData.comorbidities.includes("CKD")) {
        prompt = "For CKD, consider SGLT-2 inhibitors (e.g., Dapagliflozin 10 mg). Suitable for your patient? (Y/N)";
    } else if (questionIndex === 6 && !patientData.lifestyleCompliant) {
        prompt = "Patient struggling with lifestyle changes? Recommend diet and exercise support. Need more tips? (Y/N)";
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer sk-f944GRawq1rfAs5RJr_Em0xToxh-KmHbCSiMj90qLkT3BlbkFJBdzMJKTOguOMkP4EJJIAc2ivelqvpsWBrwGK3u6JsA`  // Replace with your OpenAI API key
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a medical assistant helping a nurse manage diabetes according to NICE CKS guidelines." },
                    { role: "user", content: `${prompt} ${userInput}` }
                ],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error:", error);
        return "Sorry, there was an issue connecting to the assistant. Please try again.";
    }
}

// Move to the next question
function nextQuestion() {
    questionIndex++;
    if (questionIndex < questions.length) {
        displayMessage(questions[questionIndex], "bot");
    } else {
        displayMessage("Thank you. Refer to NICE CKS for further details if needed.", "bot");
    }
}

// Initialize with a greeting message
displayMessage("Hello! Ready to help with diabetes management. Let's start.", "bot");
