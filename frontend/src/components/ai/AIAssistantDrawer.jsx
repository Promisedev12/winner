import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiSend,
  FiCpu,
  FiZap,
  FiEdit3,
  FiCheckCircle,
  FiFileText,
  FiHash,
  FiBookOpen,
  FiTrendingUp,
  FiCopy,
  FiRefreshCw,
  FiMessageSquare,
  FiStar,
} from 'react-icons/fi';

const AITools = [
  {
    id: 'generate',
    name: 'Generate Article',
    icon: <FiStar />,
    description: 'Write a complete article from a topic',
  },
  {
    id: 'rewrite',
    name: 'Rewrite Content',
    icon: <FiEdit3 />,
    description: 'Improve and rewrite your text',
  },
  {
    id: 'grammar',
    name: 'Grammar Check',
    icon: <FiCheckCircle />,
    description: 'Fix grammar and punctuation',
  },
  {
    id: 'seo',
    name: 'SEO Optimize',
    icon: <FiTrendingUp />,
    description: 'Optimize for search engines',
  },
  {
    id: 'title',
    name: 'Title Generator',
    icon: <FiHash />,
    description: 'Generate catchy titles',
  },
  {
    id: 'outline',
    name: 'Outline Generator',
    icon: <FiBookOpen />,
    description: 'Create article structure',
  },
];

// Groq API Configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Latest available Groq Models (as of 2024)
// - llama-3.1-70b-versatile (Latest, best quality)
// - llama-3.1-8b-instant (Fastest)
// - llama-3.2-3b-preview (Newest)
// - gemma2-9b-it (Google's model)
const GROQ_MODEL = 'llama-3.1-70b-versatile';

export default function AIAssistantDrawer({
  isOpen,
  onClose,
  onInsertContent,
  currentContent,
}) {
  const [activeTool, setActiveTool] = useState('generate');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const getSystemPrompt = (tool) => {
    switch (tool) {
      case 'generate':
        return 'You are an expert content writer. Write a comprehensive, well-structured, and engaging article. Use markdown formatting for headings, lists, and emphasis. The article should be informative and actionable.';
      case 'rewrite':
        return 'You are a professional editor. Rewrite the provided text to improve clarity, flow, and engagement while maintaining the original meaning. Make it more professional and impactful.';
      case 'grammar':
        return 'You are a grammar expert. Analyze the text for grammar, spelling, punctuation, and style errors. List each issue and provide the corrected version with explanations.';
      case 'seo':
        return 'You are an SEO specialist. Provide SEO optimization recommendations including primary keywords, secondary keywords, meta description, and readability suggestions.';
      case 'title':
        return 'You are a content marketing expert. Generate 5 catchy, SEO-optimized titles that are under 60 characters and compelling for readers.';
      case 'outline':
        return 'You are a content strategist. Create a detailed, well-structured article outline with main sections, subpoints, and suggested keywords for each section.';
      default:
        return 'You are a helpful AI assistant for content creation.';
    }
  };

  const getUserPrompt = (tool, input) => {
    switch (tool) {
      case 'generate':
        return `Write a comprehensive blog article about: ${input}. Include an engaging introduction, 3-4 main sections with subheadings, practical examples, actionable tips, and a strong conclusion. The article should be approximately 800-1000 words.`;
      case 'rewrite':
        return `Rewrite the following text to improve clarity, flow, and engagement while maintaining the original meaning. Make it more professional and impactful:\n\n${input}`;
      case 'grammar':
        return `Analyze the following text for grammar, spelling, punctuation, and style errors. List each issue and provide the corrected version:\n\n${input}`;
      case 'seo':
        return `Provide SEO optimization recommendations for content about: ${input}. Include primary keywords, secondary keywords, a meta description (under 160 characters), readability suggestions, and header structure recommendations.`;
      case 'title':
        return `Generate 5 compelling, SEO-optimized titles for an article about: ${input}. Each title should be under 60 characters and include relevant keywords.`;
      case 'outline':
        return `Create a detailed article outline for a blog post about: ${input}. Include 5-7 main sections with subpoints, suggested keywords for each section, and a conclusion.`;
      default:
        return input;
    }
  };

  const callGroqAPI = async (systemPrompt, userPrompt) => {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API Error:', errorData);

        // If model is decommissioned, try fallback models
        if (errorData.error?.code === 'model_decommissioned') {
          const fallbackModels = [
            'llama-3.1-8b-instant',
            'gemma2-9b-it',
            'llama-3.2-3b-preview',
          ];

          for (const fallbackModel of fallbackModels) {
            try {
              const fallbackResponse = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                  model: fallbackModel,
                  messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                  ],
                  temperature: 0.7,
                  max_tokens: 4096,
                  top_p: 0.9,
                }),
              });

              if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                return data.choices[0].message.content;
              }
            } catch (e) {
              console.error(`Fallback model ${fallbackModel} failed:`, e);
            }
          }
        }

        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error);
      return null;
    }
  };

  const generateAIResponse = async (tool, prompt) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');

    try {
      const systemPrompt = getSystemPrompt(tool);
      const userPrompt = getUserPrompt(tool, prompt);

      let response = await callGroqAPI(systemPrompt, userPrompt);

      if (!response) {
        response = getFallbackResponse(tool, prompt);
        setError('Using fallback response. Please check your Groq API key.');
      }

      setGeneratedContent(response);
    } catch (error) {
      console.error('AI Generation Error:', error);
      setError('Failed to generate content. Using fallback response.');
      setGeneratedContent(getFallbackResponse(tool, prompt));
    } finally {
      setIsGenerating(false);
    }
  };

  const getFallbackResponse = (tool, prompt) => {
    switch (tool) {
      case 'generate':
        return `# ${prompt}\n\n## Introduction\n\nArtificial intelligence and modern technology are transforming how we approach this topic. In this comprehensive guide, we'll explore the key concepts, benefits, and practical applications.\n\n## Key Benefits\n\n- **Increased Efficiency**: Automate repetitive tasks and save valuable time\n- **Better Decision Making**: Leverage data-driven insights for strategic choices\n- **Enhanced User Experience**: Create personalized, engaging experiences\n- **Scalable Solutions**: Grow your operations without proportional cost increases\n\n## Practical Applications\n\nFrom healthcare to finance, this technology is transforming industries worldwide. Companies are leveraging these solutions to gain competitive advantages and drive innovation.\n\n## Getting Started\n\nTo begin your journey, focus on understanding the fundamentals first. Start with small projects and gradually expand your knowledge through hands-on experience.\n\n## Conclusion\n\nThe future is bright, with endless possibilities for those who embrace this transformative technology.`;

      case 'rewrite':
        return `✨ **Improved Version:**\n\nThe text has been enhanced for clarity, professionalism, and impact. Key improvements include better sentence structure, more precise vocabulary, and improved flow.\n\n**Suggested improvements:**\n- Add transition sentences between paragraphs\n- Include bullet points for key takeaways\n- Use active voice for stronger impact`;

      case 'grammar':
        return `📝 **Grammar Check Results:**\n\n✅ No critical errors found.\n\n📌 **Suggestions:**\n- Consider breaking up longer sentences for better readability\n- Check for consistent tense usage throughout\n- Ensure proper punctuation in complex sentences`;

      case 'seo':
        return `🔍 **SEO Recommendations:**\n\n**Primary Keyword:** ${prompt}\n**Secondary Keywords:** tips, guide, best practices, how to, comprehensive\n\n**Meta Description (156 chars):**\nLearn everything about ${prompt} with our comprehensive guide. Discover tips, tricks, and best practices to get started today.\n\n**Readability Score:** 72/100 (Good)\n\n**Suggested Header Structure:**\n- H1: The Ultimate Guide to ${prompt}\n- H2: Understanding the Basics\n- H2: Key Benefits and Advantages\n- H2: Step-by-Step Implementation\n- H2: Common Challenges and Solutions\n- H2: Conclusion`;

      case 'title':
        return `💡 **Suggested Titles:**\n\n1. "The Ultimate Guide to ${prompt}"\n2. "10 ${prompt} Tips You Need to Know"\n3. "How to Master ${prompt} in 30 Days"\n4. "${prompt} 101: A Beginner's Journey"\n5. "The Future of ${prompt}: Trends to Watch"`;

      case 'outline':
        return `📋 **Article Outline for "${prompt}"**\n\n**I. Introduction**\n- Hook/Attention grabber\n- Problem statement\n- Thesis/Goal of article\n\n**II. Understanding the Basics**\n- Key terminology\n- Core concepts\n- Common misconceptions\n\n**III. Benefits and Advantages**\n- Point 1 with examples\n- Point 2 with examples\n- Point 3 with examples\n\n**IV. Step-by-Step Implementation**\n- Step 1: Getting started\n- Step 2: Essential tools\n- Step 3: Best practices\n\n**V. Case Studies/Success Stories**\n- Real-world example 1\n- Real-world example 2\n\n**VI. Common Challenges and Solutions**\n- Challenge 1 → Solution\n- Challenge 2 → Solution\n\n**VII. Conclusion**\n- Summary of key points\n- Call to action\n- Additional resources`;

      default:
        return `AI response will appear here. Please check your Groq API configuration.`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      if (
        currentContent &&
        (activeTool === 'rewrite' || activeTool === 'grammar')
      ) {
        await generateAIResponse(activeTool, currentContent);
      } else {
        setError('Please enter a topic or text');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }
    await generateAIResponse(activeTool, input);
  };

  const handleInsert = () => {
    if (generatedContent) {
      onInsertContent(generatedContent);
      setGeneratedContent('');
      setInput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlaceholder = () => {
    switch (activeTool) {
      case 'generate':
        return 'Enter a topic... e.g., "The Future of Artificial Intelligence"';
      case 'rewrite':
        return 'Paste the content you want to rewrite...';
      case 'grammar':
        return 'Paste the text you want to check for grammar errors...';
      case 'seo':
        return 'Enter your main keyword or topic...';
      case 'title':
        return 'Enter your article topic...';
      case 'outline':
        return 'Enter your article topic...';
      default:
        return 'Enter your request...';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 z-50'
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className='fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl z-50 flex flex-col'
          >
            <div className='flex items-center justify-between p-6 border-b border-slate-700'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl gradient-bg-main flex items-center justify-center'>
                  <FiCpu className='text-white text-xl' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    AI Writing Assistant
                  </h2>
                  <p className='text-sm text-slate-400'>
                    Powered by Groq Llama 3.1
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors'
              >
                <FiX size={24} />
              </button>
            </div>

            <div className='px-6 py-2 bg-royal-blue/10 border-b border-royal-blue/20'>
              <p className='text-xs text-royal-blue'>
                🚀 Using <strong>Groq Llama 3.1 70B</strong> (Free & Fast)
              </p>
            </div>

            <div className='p-6 border-b border-slate-700'>
              <div className='grid grid-cols-3 gap-3'>
                {AITools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id);
                      setGeneratedContent('');
                      setError(null);
                    }}
                    className={`p-4 rounded-xl text-center transition-all ${
                      activeTool === tool.id
                        ? 'gradient-bg-main text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className='text-2xl mb-2 flex justify-center'>
                      {tool.icon}
                    </div>
                    <div className='text-sm font-semibold'>{tool.name}</div>
                    <div className='text-xs mt-1 opacity-75'>
                      {tool.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  {activeTool === 'generate' && '📝 Enter a topic or keyword'}
                  {activeTool === 'rewrite' && '✏️ Paste text to rewrite'}
                  {activeTool === 'grammar' && '🔍 Paste text to check'}
                  {activeTool === 'seo' && '🎯 Enter your target keyword'}
                  {activeTool === 'title' && '💡 Enter your topic'}
                  {activeTool === 'outline' && '📋 Enter your article topic'}
                </label>
                <form onSubmit={handleSubmit} className='flex gap-2'>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={
                      activeTool === 'rewrite' || activeTool === 'grammar'
                        ? 4
                        : 2
                    }
                    className='flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-royal-blue focus:outline-none resize-none'
                  />
                  <button
                    type='submit'
                    disabled={isGenerating}
                    className='px-6 py-2 gradient-bg-main text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
                  >
                    {isGenerating ? (
                      <FiRefreshCw className='animate-spin' />
                    ) : (
                      <FiSend />
                    )}
                  </button>
                </form>
                {error && <p className='text-xs text-red-500 mt-2'>{error}</p>}
              </div>

              {(generatedContent || isGenerating) && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold text-white'>
                      AI Response
                    </h3>
                    <div className='flex gap-2'>
                      <button
                        onClick={handleCopy}
                        className='px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-1'
                      >
                        {copied ? (
                          <FiCheckCircle className='text-emerald' />
                        ) : (
                          <FiCopy />
                        )}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleInsert}
                        className='px-3 py-1 text-sm gradient-bg-main text-white rounded-lg hover:shadow-lg transition-colors'
                      >
                        Insert into Editor
                      </button>
                    </div>
                  </div>
                  <div className='bg-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto'>
                    {isGenerating ? (
                      <div className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                          <FiRefreshCw className='w-8 h-8 text-royal-blue animate-spin mx-auto mb-3' />
                          <p className='text-slate-400'>AI is thinking...</p>
                          <p className='text-xs text-slate-500 mt-1'>
                            Using Groq Llama 3.1 70B
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='prose prose-invert max-w-none'>
                        <pre className='whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed'>
                          {generatedContent}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className='bg-royal-blue/10 rounded-xl p-4 border border-royal-blue/20'>
                <h4 className='text-sm font-semibold text-royal-blue mb-2 flex items-center gap-2'>
                  <FiZap /> Pro Tips
                </h4>
                <ul className='text-xs text-slate-400 space-y-1'>
                  <li>• Be specific with your prompts for better results</li>
                  <li>
                    • Use the generated content as a starting point, then
                    personalize it
                  </li>
                  <li>• Combine multiple AI tools for best results</li>
                  <li>• Always review and edit AI-generated content</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
