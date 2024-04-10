import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

export function useFm() {
  const { formatMessage } = useIntl();
  return useCallback(
    (id: string, values?: Record<string, ReactNode>) =>
      formatMessage({ id }, values),
    [formatMessage],
  );
}
