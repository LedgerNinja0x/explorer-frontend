import * as Sentry from '@sentry/react';
import React from 'react';

import type { NextPageWithLayout } from 'nextjs/types';

import PageNextJs from 'nextjs/PageNextJs';

import AppError from 'ui/shared/AppError/AppError';
import LayoutError from 'ui/shared/layout/LayoutError';

const error = new Error('Not found', { cause: { status: 404 } });

const Page: NextPageWithLayout = () => {
  React.useEffect(() => {
    Sentry.captureException(new Error('Page not found'), { tags: { source: '404' } });
  }, []);

  return (
    <PageNextJs pathname="/404">
      <AppError error={ error }/>
    </PageNextJs>
  );
};

Page.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <LayoutError>
      { page }
    </LayoutError>
  );
};

export default Page;
