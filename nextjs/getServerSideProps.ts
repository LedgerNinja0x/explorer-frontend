import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { AdBannerProviders } from 'types/client/adProviders';

import type { Route } from 'nextjs-routes';

import config from 'configs/app';
import isNeedProxy from 'lib/api/isNeedProxy';
const rollupFeature = config.features.rollup;
const adBannerFeature = config.features.adsBanner;
import type * as metadata from 'lib/metadata';

export interface Props<Pathname extends Route['pathname'] = never> {
  query: Route['query'];
  cookies: string;
  referrer: string;
  adBannerProvider: AdBannerProviders | null;
  // if apiData is undefined, Next.js will complain that it is not serializable
  // so we force it to be always present in the props but it can be null
  apiData: metadata.ApiData<Pathname> | null;
}

export const base = async <Pathname extends Route['pathname'] = never>({ req, query }: GetServerSidePropsContext):
Promise<GetServerSidePropsResult<Props<Pathname>>> => {
  const adBannerProvider = (() => {
    if (adBannerFeature.isEnabled) {
      if ('additionalProvider' in adBannerFeature && adBannerFeature.additionalProvider) {
        // we need to get a random ad provider on the server side to keep it consistent with the client side
        const randomIndex = Math.round(Math.random());
        return [ adBannerFeature.provider, adBannerFeature.additionalProvider ][randomIndex];
      } else {
        return adBannerFeature.provider;
      }
    }
    return null;
  })();

  return {
    props: {
      query,
      cookies: req.headers.cookie || '',
      referrer: req.headers.referer || '',
      adBannerProvider: adBannerProvider,
      apiData: null,
    },
  };
};

export const account: GetServerSideProps<Props> = async(context) => {
  if (!config.features.account.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const verifiedAddresses: GetServerSideProps<Props> = async(context) => {
  if (!config.features.addressVerification.isEnabled) {
    return {
      notFound: true,
    };
  }

  return account(context);
};

export const deposits: GetServerSideProps<Props> = async(context) => {
  if (!(rollupFeature.isEnabled && (rollupFeature.type === 'optimistic' || rollupFeature.type === 'shibarium' || rollupFeature.type === 'zkEvm'))) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const withdrawals: GetServerSideProps<Props> = async(context) => {
  if (
    !config.features.beaconChain.isEnabled &&
    !(rollupFeature.isEnabled && (rollupFeature.type === 'optimistic' || rollupFeature.type === 'shibarium' || rollupFeature.type === 'zkEvm'))
  ) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const rollup: GetServerSideProps<Props> = async(context) => {
  if (!config.features.rollup.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const optimisticRollup: GetServerSideProps<Props> = async(context) => {
  if (!(rollupFeature.isEnabled && rollupFeature.type === 'optimistic')) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const batch: GetServerSideProps<Props> = async(context) => {
  if (!(rollupFeature.isEnabled && (rollupFeature.type === 'zkEvm' || rollupFeature.type === 'zkSync'))) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const marketplace = async <Pathname extends Route['pathname'] = never>(context: GetServerSidePropsContext):
Promise<GetServerSidePropsResult<Props<Pathname>>> => {
  if (!config.features.marketplace.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base<Pathname>(context);
};

export const apiDocs: GetServerSideProps<Props> = async(context) => {
  if (!config.features.restApiDocs.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const csvExport: GetServerSideProps<Props> = async(context) => {
  if (!config.features.csvExport.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const stats: GetServerSideProps<Props> = async(context) => {
  if (!config.features.stats.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const suave: GetServerSideProps<Props> = async(context) => {
  if (!config.features.suave.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const nameService: GetServerSideProps<Props> = async(context) => {
  if (!config.features.nameService.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const accounts: GetServerSideProps<Props> = async(context) => {
  if (config.UI.views.address.hiddenViews?.top_accounts) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const userOps: GetServerSideProps<Props> = async(context) => {
  if (!config.features.userOps.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const validators: GetServerSideProps<Props> = async(context) => {
  if (!config.features.validators.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const gasTracker: GetServerSideProps<Props> = async(context) => {
  if (!config.features.gasTracker.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const dataAvailability: GetServerSideProps<Props> = async(context) => {
  if (!config.features.dataAvailability.isEnabled) {
    return {
      notFound: true,
    };
  }

  return base(context);
};

export const login: GetServerSideProps<Props> = async(context) => {

  if (!isNeedProxy()) {
    return {
      notFound: true,
    };
  }

  return base(context);
};
