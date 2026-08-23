// Hook for reading/updating the evaluation engine settings (localStorage).

import { useCallback, useState } from 'react';
import {
  getEvaluationSettings,
  saveEvaluationSettings,
} from '../services/settings';
import type { EvaluationSettings } from '../types';

export function useEvaluationSettings() {
  const [settings, setSettings] = useState<EvaluationSettings>(() =>
    getEvaluationSettings(),
  );

  const updateSettings = useCallback((next: EvaluationSettings) => {
    setSettings(next);
    saveEvaluationSettings(next);
  }, []);

  return { settings, updateSettings };
}
