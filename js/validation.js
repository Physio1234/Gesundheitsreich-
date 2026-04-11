(function () {
  function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const normalized = String(value).replace(',', '.').trim();
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
  }

  function clamp(value, min, max) {
    const number = toNumber(value);
    return Math.min(max, Math.max(min, number));
  }

  function text(value) {
    return String(value ?? '').trim();
  }

  function isFilled(value) {
    return text(value).length > 0;
  }

  window.AppValidation = {
    toNumber,
    clamp,
    text,
    isFilled
  };
})();
