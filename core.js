(function () {
  const { getData } = window.AppStorage;
  const { diagnostics } = window.AppCalculations;
  const { setText } = window.AppUI;

  function boot() {
    const storageStatus = document.getElementById('storageStatus');
    if (storageStatus) {
      storageStatus.textContent = 'Speicher bereit';
    }

    const diagnosticsButton = document.getElementById('runDiagnosticsButton');
    if (diagnosticsButton) {
      diagnosticsButton.addEventListener('click', renderDiagnostics);
      renderDiagnostics();
    }
  }

  function renderDiagnostics() {
    const result = diagnostics(getData());
    const target = document.getElementById('diagnosticsSummary');
    if (target) {
      target.innerHTML = result.ok
        ? '<strong>Systemcheck:</strong> keine Fehler erkannt'
        : `<strong>Systemcheck:</strong> ${result.issues.length} Hinweis(e)`;
    }
    const settingsDiagnostics = document.getElementById('settingsDiagnosticsResult');
    if (settingsDiagnostics) {
      settingsDiagnostics.textContent = result.ok ? 'keine Fehler erkannt' : `${result.issues.length} Hinweis(e)`;
    }
  }

  window.AppCore = {
    boot,
    renderDiagnostics
  };

  document.addEventListener('DOMContentLoaded', boot);
})();
