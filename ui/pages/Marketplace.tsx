import { Box, Menu, MenuButton, MenuItem, MenuList, Flex, IconButton, Skeleton } from '@chakra-ui/react';
import React from 'react';
import type { MouseEvent } from 'react';

import { MarketplaceCategory, MarketplaceDisplayType } from 'types/client/marketplace';
import type { TabItem } from 'ui/shared/Tabs/types';

import config from 'configs/app';
import throwOnResourceLoadError from 'lib/errors/throwOnResourceLoadError';
import useIsMobile from 'lib/hooks/useIsMobile';
import Banner from 'ui/marketplace/Banner';
import ContractListModal from 'ui/marketplace/ContractListModal';
import MarketplaceAppModal from 'ui/marketplace/MarketplaceAppModal';
import MarketplaceDisclaimerModal from 'ui/marketplace/MarketplaceDisclaimerModal';
import MarketplaceList from 'ui/marketplace/MarketplaceList';
import MarketplaceListWithScores from 'ui/marketplace/MarketplaceListWithScores';
import FilterInput from 'ui/shared/filters/FilterInput';
import IconSvg from 'ui/shared/IconSvg';
import type { IconName } from 'ui/shared/IconSvg';
import LinkExternal from 'ui/shared/LinkExternal';
import PageTitle from 'ui/shared/Page/PageTitle';
import RadioButtonGroup from 'ui/shared/radioButtonGroup/RadioButtonGroup';
import TabsWithScroll from 'ui/shared/Tabs/TabsWithScroll';

import useMarketplace from '../marketplace/useMarketplace';
const feature = config.features.marketplace;

const links: Array<{ label: string; href: string; icon: IconName }> = [];
if (feature.isEnabled) {
  if (feature.submitFormUrl) {
    links.push({
      label: 'Submit app',
      href: feature.submitFormUrl,
      icon: 'plus' as IconName,
    });
  }
  if (feature.suggestIdeasFormUrl) {
    links.push({
      label: 'Suggest ideas',
      href: feature.suggestIdeasFormUrl,
      icon: 'edit' as IconName,
    });
  }
}

const Marketplace = () => {
  const {
    isPlaceholderData,
    isError,
    error,
    selectedCategoryId,
    categories,
    onCategoryChange,
    filterQuery,
    onSearchInputChange,
    showAppInfo,
    apps,
    displayedApps,
    selectedAppId,
    clearSelectedAppId,
    favoriteApps,
    onFavoriteClick,
    isAppInfoModalOpen,
    isDisclaimerModalOpen,
    showDisclaimer,
    appsTotal,
    isCategoriesPlaceholderData,
    showContractList,
    contractListModalType,
    selectedDisplayType,
    onDisplayTypeChange,
    hasPreviousStep,
  } = useMarketplace();

  const isMobile = useIsMobile();

  const categoryTabs = React.useMemo(() => {
    const tabs: Array<TabItem> = categories.map(category => ({
      id: category.name,
      title: category.name,
      count: category.count,
      component: null,
    }));

    tabs.unshift({
      id: MarketplaceCategory.ALL,
      title: MarketplaceCategory.ALL,
      count: appsTotal,
      component: null,
    });

    tabs.unshift({
      id: MarketplaceCategory.FAVORITES,
      title: () => <IconSvg name="star_outline" w={ 5 } h={ 5 } display="flex"/>,
      count: null,
      component: null,
    });

    return tabs;
  }, [ categories, appsTotal ]);

  const selectedCategoryIndex = React.useMemo(() => {
    const index = categoryTabs.findIndex(c => c.id === selectedCategoryId);
    return index === -1 ? 0 : index;
  }, [ categoryTabs, selectedCategoryId ]);

  const selectedApp = displayedApps.find(app => app.id === selectedAppId);

  const handleCategoryChange = React.useCallback((index: number) => {
    onCategoryChange(categoryTabs[index].id);
  }, [ categoryTabs, onCategoryChange ]);

  const handleAppClick = React.useCallback((event: MouseEvent, id: string) => {
    const isShown = window.localStorage.getItem('marketplace-disclaimer-shown');
    if (!isShown) {
      event.preventDefault();
      showDisclaimer(id);
    }
  }, [ showDisclaimer ]);

  const handleGoBackInContractListModal = React.useCallback(() => {
    clearSelectedAppId();
    if (selectedApp) {
      showAppInfo(selectedApp.id);
    }
  }, [ clearSelectedAppId, showAppInfo, selectedApp ]);

  throwOnResourceLoadError(isError && error ? { isError, error } : { isError: false, error: null });

  if (!feature.isEnabled) {
    return null;
  }

  return (
    <>
      <PageTitle
        title="DAppscout"
        contentAfter={ (isMobile && links.length > 1) ? (
          <Menu>
            <MenuButton
              as={ IconButton }
              size="sm"
              variant="outline"
              colorScheme="gray"
              px="9px"
              ml="auto"
              icon={ <IconSvg name="dots" boxSize="18px"/> }
            />
            <MenuList minW="max-content">
              { links.map(({ label, href, icon }) => (
                <MenuItem key={ label } as="a" href={ href } target="_blank" py={ 2 } px={ 4 }>
                  <IconSvg name={ icon } boxSize={ 4 } mr={ 2.5 }/>
                  { label }
                  <IconSvg name="arrows/north-east" boxSize={ 4 } color="gray.400" ml={ 2 }/>
                </MenuItem>
              )) }
            </MenuList>
          </Menu>
        ) : (
          <Flex ml="auto">
            { links.map(({ label, href }) => (
              <LinkExternal key={ label } href={ href } variant="subtle" fontSize="sm" lineHeight={ 5 } ml={ 2 }>
                { label }
              </LinkExternal>
            )) }
          </Flex>
        ) }
      />

      <Banner
        apps={ apps }
        favoriteApps={ favoriteApps }
        isLoading={ isPlaceholderData }
        onInfoClick={ showAppInfo }
        onFavoriteClick={ onFavoriteClick }
        onAppClick={ handleAppClick }
      />

      <Box marginTop={{ base: 0, lg: 8 }}>
        <TabsWithScroll
          tabs={ categoryTabs }
          onTabChange={ handleCategoryChange }
          defaultTabIndex={ selectedCategoryIndex }
          marginBottom={ -2 }
          isLoading={ isCategoriesPlaceholderData }
        />
      </Box>

      <Flex direction={{ base: 'column', lg: 'row' }} mb={{ base: 4, lg: 6 }} gap={{ base: 4, lg: 3 }}>
        { feature.securityReportsUrl && (
          <Skeleton isLoaded={ !isPlaceholderData }>
            <RadioButtonGroup<MarketplaceDisplayType>
              onChange={ onDisplayTypeChange }
              defaultValue={ selectedDisplayType }
              name="type"
              options={ [
                {
                  title: 'Discovery',
                  value: MarketplaceDisplayType.DEFAULT,
                  icon: 'apps_xs',
                  onlyIcon: false,
                },
                {
                  title: 'Apps scores',
                  value: MarketplaceDisplayType.SCORES,
                  icon: 'apps_list',
                  onlyIcon: false,
                  contentAfter: (
                    <IconSvg
                      name={ isMobile ? 'beta_xs' : 'beta' }
                      h={ 3 }
                      w={ isMobile ? 3 : 7 }
                      ml={ 1 }
                    />
                  ),
                },
              ] }
              autoWidth
            />
          </Skeleton>
        ) }
        <FilterInput
          initialValue={ filterQuery }
          onChange={ onSearchInputChange }
          placeholder="Find app by name or keyword..."
          isLoading={ isPlaceholderData }
          size={ feature.securityReportsUrl ? 'xs' : 'sm' }
          flex="1"
        />
      </Flex>

      { (selectedDisplayType === MarketplaceDisplayType.SCORES && feature.securityReportsUrl) ? (
        <MarketplaceListWithScores
          apps={ displayedApps }
          showAppInfo={ showAppInfo }
          favoriteApps={ favoriteApps }
          onFavoriteClick={ onFavoriteClick }
          isLoading={ isPlaceholderData }
          selectedCategoryId={ selectedCategoryId }
          onAppClick={ handleAppClick }
          showContractList={ showContractList }
        />
      ) : (
        <MarketplaceList
          apps={ displayedApps }
          showAppInfo={ showAppInfo }
          favoriteApps={ favoriteApps }
          onFavoriteClick={ onFavoriteClick }
          isLoading={ isPlaceholderData }
          selectedCategoryId={ selectedCategoryId }
          onAppClick={ handleAppClick }
        />
      ) }

      { (selectedApp && isAppInfoModalOpen) && (
        <MarketplaceAppModal
          onClose={ clearSelectedAppId }
          isFavorite={ favoriteApps.includes(selectedApp.id) }
          onFavoriteClick={ onFavoriteClick }
          data={ selectedApp }
          showContractList={ showContractList }
        />
      ) }

      { (selectedApp && isDisclaimerModalOpen) && (
        <MarketplaceDisclaimerModal
          isOpen={ isDisclaimerModalOpen }
          onClose={ clearSelectedAppId }
          appId={ selectedApp.id }
        />
      ) }

      { (selectedApp && contractListModalType) && (
        <ContractListModal
          type={ contractListModalType }
          contracts={ selectedApp?.securityReport?.contractsData }
          onClose={ clearSelectedAppId }
          onBack={ hasPreviousStep ? handleGoBackInContractListModal : undefined }
        />
      ) }
    </>
  );
};

export default Marketplace;
