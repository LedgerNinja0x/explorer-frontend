import { Box, Grid, Link, Skeleton } from '@chakra-ui/react';
import type { UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { scroller } from 'react-scroll';

import type { TokenInfo } from 'types/api/token';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useApiQuery from 'lib/api/useApiQuery';
import throwOnResourceLoadError from 'lib/errors/throwOnResourceLoadError';
import getCurrencyValue from 'lib/getCurrencyValue';
import useFeatureValue from 'lib/growthbook/useFeatureValue';
import useIsMounted from 'lib/hooks/useIsMounted';
import { TOKEN_COUNTERS } from 'stubs/token';
import type { TokenTabs } from 'ui/pages/Token';
import AppActionButton from 'ui/shared/AppActionButton/AppActionButton';
import useAppActionData from 'ui/shared/AppActionButton/useAppActionData';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import DetailsSponsoredItem from 'ui/shared/DetailsSponsoredItem';
import TruncatedValue from 'ui/shared/TruncatedValue';

import TokenNftMarketplaces from './TokenNftMarketplaces';

interface Props {
  tokenQuery: UseQueryResult<TokenInfo, ResourceError<unknown>>;
}

const TokenDetails = ({ tokenQuery }: Props) => {
  const router = useRouter();
  const isMounted = useIsMounted();
  const { value: isActionButtonExperiment } = useFeatureValue('action_button_exp', false);

  const hash = router.query.hash?.toString();

  const tokenCountersQuery = useApiQuery('token_counters', {
    pathParams: { hash },
    queryOptions: { enabled: Boolean(router.query.hash), placeholderData: TOKEN_COUNTERS },
  });

  const appActionData = useAppActionData(hash, isActionButtonExperiment);

  const changeUrlAndScroll = useCallback((tab: TokenTabs) => () => {
    router.push(
      { pathname: '/token/[hash]', query: { hash: hash || '', tab } },
      undefined,
      { shallow: true },
    );
    scroller.scrollTo('token-tabs', {
      duration: 500,
      smooth: true,
    });
  }, [ hash, router ]);

  const countersItem = useCallback((item: 'token_holders_count' | 'transfers_count') => {
    const itemValue = tokenCountersQuery.data?.[item];
    if (!itemValue) {
      return 'N/A';
    }
    if (itemValue === '0') {
      return itemValue;
    }

    const tab: TokenTabs = item === 'token_holders_count' ? 'holders' : 'token_transfers';

    return (
      <Skeleton isLoaded={ !tokenCountersQuery.isPlaceholderData }>
        <Link onClick={ changeUrlAndScroll(tab) }>
          { Number(itemValue).toLocaleString() }
        </Link>
      </Skeleton>
    );
  }, [ tokenCountersQuery.data, tokenCountersQuery.isPlaceholderData, changeUrlAndScroll ]);

  throwOnResourceLoadError(tokenQuery);

  if (!isMounted) {
    return null;
  }

  const {
    exchange_rate: exchangeRate,
    total_supply: totalSupply,
    circulating_market_cap: marketCap,
    decimals,
    symbol,
    type,
  } = tokenQuery.data || {};

  let totalSupplyValue;

  if (decimals) {
    const totalValue = totalSupply ? getCurrencyValue({ value: totalSupply, accuracy: 3, accuracyUsd: 2, exchangeRate, decimals }) : undefined;
    totalSupplyValue = totalValue?.valueStr;
  } else {
    totalSupplyValue = Number(totalSupply).toLocaleString();
  }

  return (
    <Grid
      columnGap={ 8 }
      rowGap={{ base: 1, lg: 3 }}
      templateColumns={{ base: 'minmax(0, 1fr)', lg: 'auto minmax(0, 1fr)' }} overflow="hidden"
    >
      { exchangeRate && (
        <DetailsInfoItem
          title="Price"
          hint="Price per token on the exchanges"
          alignSelf="center"
          isLoading={ tokenQuery.isPlaceholderData }
        >
          <Skeleton isLoaded={ !tokenQuery.isPlaceholderData } display="inline-block">
            <span>{ `$${ Number(exchangeRate).toLocaleString(undefined, { minimumSignificantDigits: 4 }) }` }</span>
          </Skeleton>
        </DetailsInfoItem>
      ) }
      { marketCap && (
        <DetailsInfoItem
          title="Fully diluted market cap"
          hint="Total supply * Price"
          alignSelf="center"
          isLoading={ tokenQuery.isPlaceholderData }
        >
          <Skeleton isLoaded={ !tokenQuery.isPlaceholderData } display="inline-block">
            <span>{ `$${ BigNumber(marketCap).toFormat() }` }</span>
          </Skeleton>
        </DetailsInfoItem>
      ) }
      <DetailsInfoItem
        title="Max total supply"
        hint="The total amount of tokens issued"
        alignSelf="center"
        wordBreak="break-word"
        whiteSpace="pre-wrap"
        isLoading={ tokenQuery.isPlaceholderData }
      >
        <Skeleton isLoaded={ !tokenQuery.isPlaceholderData } w="100%" display="flex">
          <TruncatedValue value={ totalSupplyValue || '0' } maxW="80%" flexShrink={ 0 }/>
          <Box flexShrink={ 0 }> </Box>
          <TruncatedValue value={ symbol || '' }/>
        </Skeleton>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Holders"
        hint="Number of accounts holding the token"
        alignSelf="center"
        isLoading={ tokenQuery.isPlaceholderData }
      >
        <Skeleton isLoaded={ !tokenCountersQuery.isPlaceholderData }>
          { countersItem('token_holders_count') }
        </Skeleton>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Transfers"
        hint="Number of transfer for the token"
        alignSelf="center"
        isLoading={ tokenQuery.isPlaceholderData }
      >
        <Skeleton isLoaded={ !tokenCountersQuery.isPlaceholderData }>
          { countersItem('transfers_count') }
        </Skeleton>
      </DetailsInfoItem>
      { decimals && (
        <DetailsInfoItem
          title="Decimals"
          hint="Number of digits that come after the decimal place when displaying token value"
          alignSelf="center"
          isLoading={ tokenQuery.isPlaceholderData }
        >
          <Skeleton isLoaded={ !tokenQuery.isPlaceholderData } minW={ 6 }>
            { decimals }
          </Skeleton>
        </DetailsInfoItem>
      ) }

      { type !== 'ERC-20' && (
        <TokenNftMarketplaces
          hash={ hash }
          isLoading={ tokenQuery.isPlaceholderData }
          appActionData={ appActionData }
          source="NFT collection"
          isActionButtonExperiment={ isActionButtonExperiment }
        />
      ) }

      { (type !== 'ERC-20' && config.UI.views.nft.marketplaces.length === 0 && appActionData && isActionButtonExperiment) && (
        <DetailsInfoItem
          title="Dapp"
          hint="Link to the dapp"
          alignSelf="center"
          py={ 1 }
        >
          <AppActionButton data={ appActionData } height="30px" source="NFT collection"/>
        </DetailsInfoItem>
      ) }

      <DetailsSponsoredItem isLoading={ tokenQuery.isPlaceholderData }/>
    </Grid>
  );
};

export default React.memo(TokenDetails);
