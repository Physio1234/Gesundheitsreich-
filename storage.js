(function () {
  const STORAGE_KEY = 'elitePraxisCockpit';
  const APP_VERSION = '1.0.0';

  const defaultData = {
    version: APP_VERSION,
    settings: {
      ancillaryCostRate: 25,
      targetUtilization: 85,
      targetCostRate: 45
    },
    revenue: {
      workingDays: 22,
      hoursPerDay: 8,
      sessionMinutes: 20,
      revenuePerSession: 25,
      utilization: 85,
      idleMinutes: 30,
      cancellationRate: 5,
      extraHoursPerWeek: 1.5
    },
    provision: {
      baseRevenue: 0,
      threshold: 12000,
      provisionRate: 10,
      additionalRevenue: 0
    },
    employees: []
  };

  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(defaultData));
  }

  function normalizeData(raw) {
    const merged = cloneDefaultData();
    const source = raw && typeof raw === 'object' ? raw : {};

    merged.version = APP_VERSION;
    merged.settings = { ...merged.settings, ...(source.settings || {}) };
    merged.revenue = { ...merged.revenue, ...(source.revenue || {}) };
    merged.provision = { ...merged.provision, ...(source.provision || {}) };
    merged.employees = Array.isArray(source.employees) ? source.employees.map(normalizeEmployee) : [];

    return merged;
  }

  function normalizeEmployee(employee) {
    const item = employee && typeof employee === 'object' ? employee : {};
    return {
      id: typeof item.id === 'string' && item.id ? item.id : generateId(),
      name: typeof item.name === 'string' ? item.name.trim() : '',
      weeklyHours: toFiniteNumber(item.weeklyHours),
      grossSalary: toFiniteNumber(item.grossSalary),
      targetRevenue: toFiniteNumber(item.targetRevenue)
    };
  }

  function toFiniteNumber(value) {
    const numeric = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaultData();
      return normalizeData(JSON.parse(raw));
    } catch (error) {
      console.error('Speicherfehler beim Laden', error);
      return cloneDefaultData();
    }
  }

  function setData(data) {
    const normalized = normalizeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function updateSection(section, value) {
    const data = getData();
    data[section] = value;
    return setData(data);
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    return cloneDefaultData();
  }

  window.AppStorage = {
    STORAGE_KEY,
    APP_VERSION,
    defaultData,
    cloneDefaultData,
    getData,
    setData,
    updateSection,
    resetData,
    generateId
  };
})();
