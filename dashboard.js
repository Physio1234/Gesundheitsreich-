(function () {
  const { getData } = window.AppStorage;
  const { calculateRevenue, calculateProvision, employeeCost, employeeContribution, diagnostics } = window.AppCalculations;
  const { formatCurrency, formatNumber, setText, setHtml } = window.AppUI;

  function renderDashboard() {
    const data = getData();
    const revenue = calculateRevenue(data.revenue);

    const provisionInput = {
      ...data.provision,
      baseRevenue: data.provision.baseRevenue || revenue.monthlyRevenue,
      additionalRevenue: data.provision.additionalRevenue || revenue.extraRevenue
    };
    const provision = calculateProvision(provisionInput);

    const totalEmployeeCost = data.employees.reduce((sum, item) => sum + employeeCost(item, data.settings.ancillaryCostRate), 0);
    const totalContribution = data.employees.reduce((sum, item) => sum + employeeContribution(item, data.settings.ancillaryCostRate), 0);

    setText('metricRevenue', formatCurrency(revenue.monthlyRevenue));
    setText('metricProvision', formatCurrency(provision.fullProvision));
    setText('metricEmployees', String(data.employees.length));
    setText('metricProfit', formatCurrency(totalContribution));

    const summary = [
      ['Termine pro Monat', formatNumber(revenue.sessionsPerMonth, 0)],
      ['Zusatzumsatz Mehrstunden', formatCurrency(revenue.extraRevenue)],
      ['Gesamtkosten Team', formatCurrency(totalEmployeeCost)],
      ['Ziel-Auslastung', `${formatNumber(data.settings.targetUtilization, 0)} %`]
    ].map(([label, value]) => `<div class="summary-line"><span>${label}</span><strong>${value}</strong></div>`).join('');
    setHtml('dashboardSummary', summary);

    const checks = diagnostics(data);
    const warnings = [];
    if (!checks.ok) warnings.push(...checks.issues);
    if (revenue.monthlyRevenue < 10000) warnings.push('Monatsumsatz liegt aktuell unter 10.000 €.');
    if (data.employees.length === 0) warnings.push('Noch keine Mitarbeiter angelegt.');
    setHtml('dashboardWarnings', warnings.length
      ? warnings.map(item => `<div class="warning-line">${item}</div>`).join('')
      : '<div class="warning-line">Keine kritischen Warnungen erkannt.</div>');

    const rows = [...data.employees]
      .sort((a, b) => employeeContribution(b, data.settings.ancillaryCostRate) - employeeContribution(a, data.settings.ancillaryCostRate))
      .map(item => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${formatNumber(item.weeklyHours, 1)}</td>
          <td>${formatCurrency(item.grossSalary)}</td>
          <td>${formatCurrency(employeeCost(item, data.settings.ancillaryCostRate))}</td>
          <td>${formatCurrency(employeeContribution(item, data.settings.ancillaryCostRate))}</td>
        </tr>
      `)
      .join('');
    setHtml('dashboardEmployeeTable', rows || '<tr><td colspan="5">Noch keine Mitarbeiter angelegt.</td></tr>');
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  document.addEventListener('DOMContentLoaded', renderDashboard);
})();
