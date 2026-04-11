(function () {
  const { getData, updateSection } = window.AppStorage;
  const { calculateRevenue, calculateProvision } = window.AppCalculations;
  const { toNumber } = window.AppValidation;
  const { formatCurrency, setText } = window.AppUI;

  function render() {
    const data = getData();
    fillForm(data.provision);
    updateResults(readForm());

    document.getElementById('saveProvisionButton')?.addEventListener('click', saveProvision);
    document.getElementById('useRevenueButton')?.addEventListener('click', useRevenue);
    document.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => updateResults(readForm()));
    });
  }

  function fillForm(provision) {
    setValue('baseRevenue', provision.baseRevenue);
    setValue('threshold', provision.threshold);
    setValue('provisionRate', provision.provisionRate);
    setValue('additionalRevenue', provision.additionalRevenue);
  }

  function readForm() {
    return {
      baseRevenue: toNumber(getValue('baseRevenue')),
      threshold: toNumber(getValue('threshold')),
      provisionRate: toNumber(getValue('provisionRate')),
      additionalRevenue: toNumber(getValue('additionalRevenue'))
    };
  }

  function updateResults(input) {
    const result = calculateProvision(input);
    setText('baseProvisionValue', formatCurrency(result.baseProvision));
    setText('fullProvisionValue', formatCurrency(result.fullProvision));
    setText('extraProvisionValue', formatCurrency(result.extraProvision));
    setText('thresholdDeltaValue', formatCurrency(result.thresholdDelta));
    setText('provisionHealth', result.fullProvision > 0 ? 'Provision berechnet' : 'Unter Schwellenwert');

    const notice = document.getElementById('provisionNotice');
    if (notice) {
      notice.textContent = result.fullProvision > 0
        ? `Provision aktiv. Zusätzliche Provision: ${formatCurrency(result.extraProvision)}.`
        : 'Noch keine Provision, weil der Schwellenwert nicht überschritten ist.';
    }
  }

  function saveProvision() {
    const input = readForm();
    updateSection('provision', input);
    updateResults(input);
    const notice = document.getElementById('provisionNotice');
    if (notice) notice.textContent = 'Provisionsdaten wurden sicher gespeichert.';
  }

  function useRevenue() {
    const data = getData();
    const revenue = calculateRevenue(data.revenue);
    const next = {
      ...readForm(),
      baseRevenue: Math.round(revenue.monthlyRevenue),
      additionalRevenue: Math.round(revenue.extraRevenue)
    };
    fillForm(next);
    updateResults(next);
    updateSection('provision', next);
  }

  function getValue(id) { return document.getElementById(id)?.value ?? ''; }
  function setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value; }

  document.addEventListener('DOMContentLoaded', render);
})();
