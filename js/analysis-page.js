(function () {
  const { getData } = window.AppStorage;
  const { calculateRevenue, employeeCost, getCostRatio } = window.AppCalculations;
  const { formatCurrency, formatNumber, setText, setHtml, trafficLightClass } = window.AppUI;

  function render() {
    const data = getData();
    const revenue = calculateRevenue(data.revenue);
    const totalEmployeeCosts = data.employees.reduce((sum, item) => sum + employeeCost(item, data.settings.ancillaryCostRate), 0);
    const costRatio = getCostRatio(revenue.monthlyRevenue, totalEmployeeCosts);

    paintLight('utilizationLight', data.revenue.utilization, data.settings.targetUtilization - 10, data.settings.targetUtilization);
    setText('utilizationText', `${formatNumber(data.revenue.utilization, 0)} % aktuell`);

    paintLight('revenueLight', revenue.monthlyRevenue, 10000, 15000);
    setText('revenueText', `${formatCurrency(revenue.monthlyRevenue)} im Monat`);

    paintLight('costLight', costRatio, data.settings.targetCostRate + 10, data.settings.targetCostRate, true);
    setText('costText', `${formatNumber(costRatio, 1)} % Kostenquote`);

    const rows = [
      ['Monatsumsatz', formatCurrency(revenue.monthlyRevenue)],
      ['Potenzial ohne Leerzeit', formatCurrency(revenue.potentialRevenue)],
      ['Verlorener Umsatz', formatCurrency(revenue.lostRevenue)],
      ['Zusatzumsatz Mehrstunden', formatCurrency(revenue.extraRevenue)],
      ['Teamkosten inkl. NK', formatCurrency(totalEmployeeCosts)],
      ['Kostenquote', `${formatNumber(costRatio, 1)} %`],
      ['Ziel-Auslastung', `${formatNumber(data.settings.targetUtilization, 0)} %`]
    ].map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join('');
    setHtml('analysisTableBody', rows);
  }

  function paintLight(id, value, warnAt, goodAt, invert = false) {
    const light = document.getElementById(id);
    if (!light) return;
    light.className = `traffic-light ${trafficLightClass(value, warnAt, goodAt, invert)}`;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
