(function () {
  const { getData, updateSection, resetData } = window.AppStorage;
  const { toNumber } = window.AppValidation;

  function render() {
    const data = getData();
    setValue('settingsAncillaryRate', data.settings.ancillaryCostRate);
    setValue('settingsTargetUtilization', data.settings.targetUtilization);
    setValue('settingsTargetCostRate', data.settings.targetCostRate);

    document.getElementById('saveSettingsButton')?.addEventListener('click', saveSettings);
    document.getElementById('resetAppButton')?.addEventListener('click', resetApp);
    document.getElementById('runSettingsDiagnosticsButton')?.addEventListener('click', window.AppCore.renderDiagnostics);
  }

  function saveSettings() {
    const settings = {
      ancillaryCostRate: toNumber(getValue('settingsAncillaryRate')),
      targetUtilization: toNumber(getValue('settingsTargetUtilization')),
      targetCostRate: toNumber(getValue('settingsTargetCostRate'))
    };
    updateSection('settings', settings);
    showNotice('Einstellungen wurden gespeichert.');
    window.AppCore.renderDiagnostics();
  }

  function resetApp() {
    resetData();
    location.reload();
  }

  function showNotice(message) {
    const notice = document.getElementById('settingsNotice');
    if (notice) notice.textContent = message;
  }

  function getValue(id) { return document.getElementById(id)?.value ?? ''; }
  function setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value; }

  document.addEventListener('DOMContentLoaded', render);
})();
