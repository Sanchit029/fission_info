const OpenAI = require('openai');

// @desc    Generate event description using AI
// @route   POST /api/ai/generate-description
// @access  Private
const generateDescription = async (req, res) => {
  try {
    const { title, category, location, additionalInfo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Event title is required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        message: 'AI service not configured. Please add your OpenAI API key.' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert event marketing copywriter who creates engaging event descriptions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const generatedDescription = completion.choices[0].message.content.trim();

    res.json({ description: generatedDescription });
  } catch (error) {
    console.error('AI generation error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({ message: 'AI service quota exceeded' });
    }
    
    res.status(500).json({ message: 'Failed to generate description' });
  }
};

// @desc    Enhance existing event description using AI
// @route   POST /api/ai/enhance-description
// @access  Private
const enhanceDescription = async (req, res) => {
  try {
    const { description, title } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        message: 'AI service not configured. Please add your OpenAI API key.' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert event marketing copywriter who enhances event descriptions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const enhancedDescription = completion.choices[0].message.content.trim();

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
