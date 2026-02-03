/**
 * Service for generating example sentences for vocabulary words
 */

/**
 * Generate an example sentence for a vocabulary word
 * For now, uses simple templates. Can be enhanced with LLM later.
 */
export async function generateExampleSentence(
  word: string,
  translation: string,
  language: string = 'es'
): Promise<string | null> {
  // Simple template-based examples for common languages
  // In the future, this could call an LLM API for more natural sentences
  
  const templates: Record<string, (word: string, translation: string) => string> = {
    es: (w, t) => `Ejemplo: La palabra "${w}" significa "${t}".`,
    en: (w, t) => `Example: The word "${w}" means "${t}".`,
    fr: (w, t) => `Exemple: Le mot "${w}" signifie "${t}".`,
    de: (w, t) => `Beispiel: Das Wort "${w}" bedeutet "${t}".`,
  };

  const template = templates[language] || templates.es;
  return template(word, translation);
}

/**
 * Get a simple example sentence (fallback if LLM is not available)
 */
export function getSimpleExampleSentence(
  word: string,
  translation: string,
  language: string = 'es'
): string {
  // Simple fallback examples
  const examples: Record<string, string> = {
    es: `Ejemplo: "${word}" significa "${translation}".`,
    en: `Example: "${word}" means "${translation}".`,
    fr: `Exemple: "${word}" signifie "${translation}".`,
    de: `Beispiel: "${word}" bedeutet "${translation}".`,
  };

  return examples[language] || examples.es;
}
