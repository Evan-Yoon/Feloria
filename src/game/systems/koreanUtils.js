export const koreanUtils = {
  /**
   * Checks if the last character of a string has a final consonant (batchim).
   */
  hasBatchim(word) {
    if (!word || typeof word !== 'string') return false;
    const lastChar = word.charCodeAt(word.length - 1);
    if (lastChar < 0xAC00 || lastChar > 0xD7A3) return false;
    return (lastChar - 0xAC00) % 28 !== 0;
  },

  /**
   * Returns the correct postposition for a given word.
   * @param {string} word - The target word
   * @param {string} type - '을', '는', '이' (the version used for batchim)
   * @param {boolean} append - Whether to return the word + particle or just the particle
   */
  getPostPosition(word, type, append = true) {
    if (!word) return "";
    const b = this.hasBatchim(word);
    
    const mapping = {
      '을': b ? '을' : '를',
      '를': b ? '을' : '를',
      '은': b ? '은' : '는',
      '는': b ? '은' : '는',
      '이': b ? '이' : '가',
      '가': b ? '이' : '가'
    };

    const particle = mapping[type] || '';
    return append ? `${word}${particle}` : particle;
  }
};
