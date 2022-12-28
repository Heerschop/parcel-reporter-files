/**
 * Removes the specified string from the end of a string, or whitespace from the end of a string if no value is provided.
 *
 * @function
 * @name trimEnd
 * @param {string} [trimValue] - The string to remove from the end of the string.
 * @returns {string} The modified string.
 */
if (typeof String.prototype.trimEnd.length !== 1) {
  const trimEnd = String.prototype.trimEnd;

  String.prototype.trimEnd = function (trimValue) {
    if (trimValue) {
      let value = this;

      while (value.endsWith(trimValue)) {
        value = value.substring(0, value.length - trimValue.length);
      }

      return value;
    }

    return trimEnd.apply(this);
  };

  String.prototype.trimEnd;
}
