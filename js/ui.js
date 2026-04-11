(function () {
  function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
  }

  function formatNumber(value, digits = 1) {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(value || 0);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setHtml(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = value;
  }

  function badgeByThreshold(value, warnAt, goodAt, invert = false) {
    let className = 'warn';
    if (!invert) {
      if (value >= goodAt) className = 'good';
      else if (value < warnAt) className = 'bad';
    } else {
      if (value <= goodAt) className = 'good';
      else if (value > warnAt) className = 'bad';
    }
    return className;
  }

  function trafficLightClass(value, warnAt, goodAt, invert = false) {
    return badgeByThreshold(value, warnAt, goodAt, invert);
  }

  window.AppUI = {
    formatCurrency,
    formatNumber,
    setText,
    setHtml,
    badgeByThreshold,
    trafficLightClass
  };
})();
