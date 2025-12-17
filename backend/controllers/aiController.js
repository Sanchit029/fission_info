const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Generate event description using AI (Gemini)
// @route   POST /api/ai/generate-description
// @access  Private
const generateDescription = async (req, res) => {
  try {
    const { title, category, location, additionalInfo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Event title is required' });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        message: 'AI service not configured. Please add your Gemini API key.' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate an engaging and professional event description for the following event:

Title: ${title}
Category: ${category || 'General'}
Location: ${location || 'TBD'}
${additionalInfo ? `Additional Details: ${additionalInfo}` : ''}

Please write a compelling description (150-200 words) that:
1. Captures the essence of the event
2. Highlights what attendees can expect
3. Creates excitement and encourages RSVPs
4. Is professional yet approachable in tone

Only return the description text, no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedDescription = response.text().trim();

    res.json({ description: generatedDescription });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'Failed to generate description' });
  }
};

// @desc    Enhance existing event description using AI (Gemini)
// @route   POST /api/ai/enhance-description
// @access  Private
const enhanceDescription = async (req, res) => {
  try {
    const { description, title } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        message: 'AI service not configured. Please add your Gemini API key.' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Enhance and improve the following event description while maintaining its core message:

Event Title: ${title || 'Event'}
Original Description: ${description}

Please:
1. Improve the language and flow
2. Make it more engaging and compelling
3. Add any missing calls-to-action
4. Keep it professional yet inviting
5. Maintain approximately the same length

Only return the enhanced description text, no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedDescription = response.text().trim();

    res.json({ description: enhancedDescription });
  } catch (error) {
    console.error('AI enhancement error:', error);
    res.status(500).json({ message: 'Failed to enhance description' });
  }
};

module.exports = {
  generateDescription,
  enhanceDescription,
};