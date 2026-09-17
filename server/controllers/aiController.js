export const aiChat = async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ answer: 'Please ask a question.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    // No API key fallback
    const fallbackAnswer = "Sorry, AI service unavailable. Try later or contact your caregiver.";
    return res.json({ answer: fallbackAnswer });
  }

  // If Gemini API integration available, call external here.
  // For demo, respond with simple echo
  return res.json({ answer: `You asked: "${question}". Currently, AI API integration is under development.` });
};
