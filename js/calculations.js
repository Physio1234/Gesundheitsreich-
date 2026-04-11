(function () {
  const { toNumber, clamp } = window.AppValidation;

  function calculateRevenue(input) {
    const workingDays = clamp(input.workingDays, 1, 31);
    const hoursPerDay = clamp(input.hoursPerDay, 1, 16);
    const sessionMinutes = clamp(input.sessionMinutes, 5, 120);
    const revenuePerSession = clamp(input.revenuePerSession, 0, 500);
    const utilization = clamp(input.utilization, 0, 100) / 100;
    const idleMinutes = clamp(input.idleMinutes, 0, 480);
    const cancellationRate = clamp(input.cancellationRate, 0, 100) / 100;
    const extraHoursPerWeek = clamp(input.extraHoursPerWeek, 0, 20);

    const totalMinutesPerDay = hoursPerDay * 60;
    const productiveMinutesPerDay = Math.max(totalMinutesPerDay - idleMinutes, 0);
    const rawSessionsPerDay = productiveMinutesPerDay / sessionMinutes;
    const sessionsPerDay = rawSessionsPerDay * utilization * (1 - cancellationRate);
    const sessionsPerMonth = sessionsPerDay * workingDays;
    const monthlyRevenue = sessionsPerMonth * revenuePerSession;

    const potentialSessionsPerDay = (totalMinutesPerDay / sessionMinutes) * utilization * (1 - cancellationRate);
    const potentialRevenue = potentialSessionsPerDay * workingDays * revenuePerSession;
    const lostRevenue = Math.max(potentialRevenue - monthlyRevenue, 0);

    const extraSessionsPerWeek = (extraHoursPerWeek * 60 / sessionMinutes) * utilization * (1 - cancellationRate);
    const extraSessionsPerMonth = extraSessionsPerWeek * 4.33;
    const extraRevenue = extraSessionsPerMonth * revenuePerSession;

    return {
      sessionsPerDay,
      sessionsPerMonth,
      monthlyRevenue,
      potentialRevenue,
      lostRevenue,
      extraRevenue
    };
  }

  function calculateProvision(input) {
    const baseRevenue = Math.max(toNumber(input.baseRevenue), 0);
    const threshold = Math.max(toNumber(input.threshold), 0);
    const provisionRate = clamp(input.provisionRate, 0, 100) / 100;
    const additionalRevenue = Math.max(toNumber(input.additionalRevenue), 0);

    const baseDelta = Math.max(baseRevenue - threshold, 0);
    const fullDelta = Math.max(baseRevenue + additionalRevenue - threshold, 0);
    const baseProvision = baseDelta * provisionRate;
    const fullProvision = fullDelta * provisionRate;
    const extraProvision = Math.max(fullProvision - baseProvision, 0);

    return {
      baseProvision,
      fullProvision,
      extraProvision,
      thresholdDelta: baseDelta,
      fullDelta
    };
  }

  function employeeCost(employee, ancillaryCostRate) {
    const gross = Math.max(toNumber(employee.grossSalary), 0);
    const ancillary = gross * (clamp(ancillaryCostRate, 0, 100) / 100);
    return gross + ancillary;
  }

  function employeeContribution(employee, ancillaryCostRate) {
    return Math.max(toNumber(employee.targetRevenue), 0) - employeeCost(employee, ancillaryCostRate);
  }

  function getCostRatio(revenue, totalEmployeeCosts) {
    if (revenue <= 0) return 100;
    return (totalEmployeeCosts / revenue) * 100;
  }

  function diagnostics(data) {
    const issues = [];

    if (!data || typeof data !== 'object') issues.push('App-Daten fehlen.');
    if (!Array.isArray(data.employees)) issues.push('Mitarbeiterliste ist beschädigt.');
    if (toNumber(data.revenue?.sessionMinutes) <= 0) issues.push('Taktung ist ungültig.');
    if (toNumber(data.revenue?.hoursPerDay) <= 0) issues.push('Stunden pro Tag sind ungültig.');
    if (toNumber(data.provision?.provisionRate) < 0 || toNumber(data.provision?.provisionRate) > 100) issues.push('Provisionssatz liegt außerhalb 0–100 %.');
    if (toNumber(data.settings?.ancillaryCostRate) < 0 || toNumber(data.settings?.ancillaryCostRate) > 100) issues.push('Lohnnebenkosten liegen außerhalb 0–100 %.');

    const revenueResult = calculateRevenue(data.revenue || {});
    if (!Number.isFinite(revenueResult.monthlyRevenue)) issues.push('Umsatzberechnung liefert keinen gültigen Wert.');
    if (revenueResult.monthlyRevenue < 0) issues.push('Umsatz ist negativ.');

    return {
      ok: issues.length === 0,
      issues
    };
  }

  window.AppCalculations = {
    calculateRevenue,
    calculateProvision,
    employeeCost,
    employeeContribution,
    getCostRatio,
    diagnostics
  };
})();
