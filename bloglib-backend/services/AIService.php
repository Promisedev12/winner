<?php
class AIService
{
  private $apiKey;
  private $apiUrl = 'https://api.openai.com/v1/chat/completions';

  public function __construct()
  {
    $this->apiKey = OPENAI_API_KEY;
  }

  public function generateArticle($topic)
  {
    $prompt = "Write a comprehensive blog article about: " . $topic .
      ". Include an introduction, 3-4 main points with subheadings, practical examples, and a conclusion. " .
      "Make it engaging and informative for readers. Length: approximately 800-1000 words.";

    return $this->callOpenAI($prompt);
  }

  public function rewriteContent($content, $style = 'professional')
  {
    $prompt = "Rewrite the following text in a {$style} tone while maintaining the original meaning. " .
      "Improve clarity, grammar, and flow:\n\n" . $content;

    return $this->callOpenAI($prompt);
  }

  public function checkGrammar($text)
  {
    $prompt = "Check the following text for grammar, spelling, and punctuation errors. " .
      "List each error and provide the corrected version:\n\n" . $text;

    return $this->callOpenAI($prompt);
  }

  public function generateSEOTitle($topic)
  {
    $prompt = "Generate 5 SEO-optimized titles for an article about: " . $topic .
      ". Each title should be under 60 characters and click-worthy.";

    return $this->callOpenAI($prompt);
  }

  public function generateSEOKeywords($topic)
  {
    $prompt = "Generate 10 relevant SEO keywords and phrases for an article about: " . $topic;

    return $this->callOpenAI($prompt);
  }

  public function generateOutline($topic)
  {
    $prompt = "Create a detailed article outline for a blog post about: " . $topic .
      ". Include main sections with subpoints. Format as a structured outline.";

    return $this->callOpenAI($prompt);
  }

  public function summarizeContent($content)
  {
    $prompt = "Summarize the following text in 3-4 sentences, capturing the key points:\n\n" . $content;

    return $this->callOpenAI($prompt);
  }

  public function generateBookOutline($topic)
  {
    $prompt = "Create a comprehensive book outline for a book about: " . $topic .
      ". Include chapter titles and brief descriptions for each chapter (10-12 chapters).";

    return $this->callOpenAI($prompt);
  }

  public function continueWriting($text)
  {
    $prompt = "Continue writing the following text naturally, maintaining the same tone and style:\n\n" . $text;

    return $this->callOpenAI($prompt);
  }

  private function callOpenAI($prompt)
  {
    // For demo purposes, return mock responses
    // In production, uncomment the actual API call

    // Mock responses for demo
    return $this->getMockResponse($prompt);

    // Actual OpenAI API call (commented for demo)
    /*
        $data = [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 2000
        ];
        
        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $result = json_decode($response, true);
            return $result['choices'][0]['message']['content'];
        }
        
        return "AI service is temporarily unavailable. Please try again later.";
        */
  }

  private function getMockResponse($prompt)
  {
    // Mock responses for demo purposes
    if (strpos($prompt, 'Write a comprehensive blog article') !== false) {
      return "# " . str_replace("Write a comprehensive blog article about: ", "", $prompt) . "\n\n" .
        "## Introduction\n\nArtificial intelligence is revolutionizing the way we think about this topic. " .
        "In this comprehensive guide, we'll explore the key concepts, benefits, and practical applications.\n\n" .
        "## Key Benefits\n\n- Increased efficiency and productivity\n- Better decision-making through data insights\n" .
        "- Enhanced user experiences\n- Scalable solutions for complex problems\n\n## Practical Applications\n\n" .
        "From healthcare to finance, this technology is transforming industries worldwide.\n\n## Getting Started\n\n" .
        "To begin your journey, focus on understanding the fundamentals first.\n\n## Conclusion\n\nThe future is bright, " .
        "with endless possibilities for those who embrace this transformative technology.";
    }

    if (strpos($prompt, 'Rewrite the following text') !== false) {
      return "✨ Improved Version:\n\nThe text has been enhanced for clarity and professionalism. " .
        "Consider adding more specific examples to strengthen your argument.";
    }

    if (strpos($prompt, 'Check the following text') !== false) {
      return "📝 Grammar Check Results:\n\n✅ No critical errors found.\n" .
        "📌 Suggestion: Consider breaking up longer sentences for better readability.";
    }

    if (strpos($prompt, 'Generate 5 SEO-optimized titles') !== false) {
      return "💡 Suggested Titles:\n\n1. \"The Ultimate Guide to This Topic\"\n" .
        "2. \"10 Tips You Need to Know\"\n3. \"How to Master This in 30 Days\"\n" .
        "4. \"A Beginner's Journey into This Field\"\n5. \"The Future of This: Trends to Watch\"";
    }

    return "AI response generated successfully. The content has been processed according to your request.";
  }
}
