(function () {
  const { getData, setData, generateId } = window.AppStorage;
  const { employeeCost, employeeContribution } = window.AppCalculations;
  const { toNumber, text, isFilled } = window.AppValidation;
  const { formatCurrency, formatNumber, setText, setHtml } = window.AppUI;

  const sampleEmployees = [
    { name: 'Inga', weeklyHours: 32, grossSalary: 3400, targetRevenue: 10500 },
    { name: 'Annemai', weeklyHours: 35, grossSalary: 3400, targetRevenue: 11500 },
    { name: 'Alina', weeklyHours: 35, grossSalary: 3650, targetRevenue: 12500 },
    { name: 'Maja', weeklyHours: 35, grossSalary: 3000, targetRevenue: 11000 }
  ];

  function render() {
    drawTable();
    document.getElementById('saveEmployeeButton')?.addEventListener('click', saveEmployee);
    document.getElementById('loadSampleEmployeesButton')?.addEventListener('click', loadSamples);
    document.getElementById('employeeTableBody')?.addEventListener('click', onTableClick);
  }

  function saveEmployee() {
    const name = text(document.getElementById('employeeName')?.value);
    const weeklyHours = toNumber(document.getElementById('employeeHours')?.value);
    const grossSalary = toNumber(document.getElementById('employeeSalary')?.value);
    const targetRevenue = toNumber(document.getElementById('employeeTargetRevenue')?.value);

    if (!isFilled(name)) return showNotice('Bitte einen Namen eintragen.');
    if (weeklyHours <= 0) return showNotice('Wochenstunden müssen größer als 0 sein.');

    const data = getData();
    data.employees.push({ id: generateId(), name, weeklyHours, grossSalary, targetRevenue });
    setData(data);
    clearForm();
    drawTable();
    showNotice('Mitarbeiter wurde gespeichert.');
  }

  function loadSamples() {
    const data = getData();
    data.employees = sampleEmployees.map((item) => ({ ...item, id: generateId() }));
    setData(data);
    drawTable();
    showNotice('Beispieldaten wurden geladen.');
  }

  function onTableClick(event) {
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const data = getData();
    data.employees = data.employees.filter((item) => item.id !== button.dataset.id);
    setData(data);
    drawTable();
    showNotice('Mitarbeiter wurde gelöscht.');
  }

  function drawTable() {
    const data = getData();
    const ancillaryCostRate = data.settings.ancillaryCostRate;
    const rows = data.employees.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${formatNumber(item.weeklyHours, 1)}</td>
        <td>${formatCurrency(item.grossSalary)}</td>
        <td>${formatCurrency(employeeCost(item, ancillaryCostRate))}</td>
        <td>${formatCurrency(item.targetRevenue)}</td>
        <td>${formatCurrency(employeeContribution(item, ancillaryCostRate))}</td>
        <td><button type="button" class="danger-button" data-id="${item.id}">Löschen</button></td>
      </tr>
    `).join('');
    setHtml('employeeTableBody', rows || '<tr><td colspan="7">Noch keine Mitarbeiter vorhanden.</td></tr>');

    const count = data.employees.length;
    const grossTotal = data.employees.reduce((sum, item) => sum + item.grossSalary, 0);
    const fullCostTotal = data.employees.reduce((sum, item) => sum + employeeCost(item, ancillaryCostRate), 0);
    const targetRevenueTotal = data.employees.reduce((sum, item) => sum + item.targetRevenue, 0);

    setText('employeeCountValue', String(count));
    setText('grossSalaryTotalValue', formatCurrency(grossTotal));
    setText('fullCostTotalValue', formatCurrency(fullCostTotal));
    setText('targetRevenueTotalValue', formatCurrency(targetRevenueTotal));
  }

  function clearForm() {
    ['employeeName', 'employeeHours', 'employeeSalary', 'employeeTargetRevenue'].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });
  }

  function showNotice(message) {
    const notice = document.getElementById('employeeNotice');
    if (notice) notice.textContent = message;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  document.addEventListener('DOMContentLoaded', render);
})();
