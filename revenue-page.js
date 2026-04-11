(function () {
  const { getData, updateSection, cloneDefaultData } = window.AppStorage;
  const { calculateRevenue } = window.AppCalculations;
  const { toNumber } = window.AppValidation;
  const { formatCurrency, formatNumber, setText } = window.AppUI;

  function render() {
    const data = getData();
    fillForm(data.revenue);
    updateResults(data.revenue);

    document.getElementById('saveRevenueButton')?.addEventListener('click', saveRevenue);
    document.getElementById('resetRevenueButton')?.addEventListener('click', resetRevenue);
    document.querySelectorAll('#revenueForm input').forEach((input) => {
      input.addEventListener('input', () => updateResults(readForm()));
    });
  }

  function fillForm(revenue) {
    setValue('workingDays', revenue.workingDays);
    setValue('hoursPerDay', revenue.hoursPerDay);
    setValue('sessionMinutes', revenue.sessionMinutes);
    setValue('revenuePerSession', revenue.revenuePerSession);
    setValue('utilization', revenue.utilization);
    setValue('idleMinutes', revenue.idleMinutes);
    setValue('cancellationRate', revenue.cancellationRate);
    setValue('extraHoursPerWeek', revenue.extraHoursPerWeek);
  }

  function readForm() {
    return {
      workingDays: toNumber(getValue('workingDays')),
      hoursPerDay: toNumber(getValue('hoursPerDay')),
      sessionMinutes: toNumber(getValue('sessionMinutes')),
      revenuePerSession: toNumber(getValue('revenuePerSession')),
      utilization: toNumber(getValue('utilization')),
      idleMinutes: toNumber(getValue('idleMinutes')),
      cancellationRate: toNumber(getValue('cancellationRate')),
      extraHoursPerWeek: toNumber(getValue('extraHoursPerWeek'))
    };
  }

  function updateResults(input) {
    const result = calculateRevenue(input);
    setText('sessionsPerDayValue', formatNumber(result.sessionsPerDay, 1));
    setText('sessionsPerMonthValue', formatNumber(result.sessionsPerMonth, 0));
    setText('monthlyRevenueValue', formatCurrency(result.monthlyRevenue));
    setText('potentialRevenueValue', formatCurrency(result.potentialRevenue));
    setText('lostRevenueValue', formatCurrency(result.lostRevenue));
    setText('extraRevenueValue', formatCurrency(result.extraRevenue));
    setText('umsatzHealth', result.monthlyRevenue > 0 ? 'Berechnung aktiv' : 'Bitte Eingaben prüfen');

    const notice = document.getElementById('revenueNotice');
    if (notice) {
      notice.textContent = result.lostRevenue > 0
        ? `Aktuell gehen rechnerisch ${formatCurrency(result.lostRevenue)} pro Monat durch Leerzeiten verloren.`
        : 'Aktuell wird kein verlorener Umsatz durch Leerzeit erkannt.';
    }
  }

  function saveRevenue() {
    const data = readForm();
    updateSection('revenue', data);
    updateResults(data);
    const notice = document.getElementById('revenueNotice');
    if (notice) notice.textContent = 'Umsatzdaten wurden sicher gespeichert.';
  }

  function resetRevenue() {
    const defaults = cloneDefaultData().revenue;
    updateSection('revenue', defaults);
    fillForm(defaults);
    updateResults(defaults);
  }

  function getValue(id) { return document.getElementById(id)?.value ?? ''; }
  function setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value; }

  document.addEventListener('DOMContentLoaded', render);
})();
