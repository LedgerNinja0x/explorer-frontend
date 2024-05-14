import React from 'react';

import type { AddressMetadataInfo, AddressMetadataTagApi } from 'types/api/addressMetadata';

import config from 'configs/app';
import * as addressMock from 'mocks/address/address';
import { protocolTagWithMeta } from 'mocks/metadata/address';
import { tokenInfoERC721a } from 'mocks/tokens/tokenInfo';
import * as tokenInstanceMock from 'mocks/tokens/tokenInstance';
import { ENVS_MAP } from 'playwright/fixtures/mockEnvs';
import { test, expect } from 'playwright/lib';
import TestApp from 'playwright/TestApp';
import * as configs from 'playwright/utils/configs';

import TokenInstanceDetails from './TokenInstanceDetails';

const hash = tokenInfoERC721a.address;

const addressMetadataQueryParams = {
  addresses: [ hash ],
  chainId: config.chain.id,
  tagsLimit: '20',
};

function generateAddressMetadataResponse(tag: AddressMetadataTagApi) {
  return {
    addresses: {
      [ hash.toLowerCase() as string ]: {
        tags: [ {
          ...tag,
          meta: JSON.stringify(tag.meta),
        } ],
      },
    },
  } as AddressMetadataInfo;
}

test.beforeEach(async({ mockApiResponse, mockAssetResponse }) => {
  await mockApiResponse('address', addressMock.contract, { pathParams: { hash } });
  await mockApiResponse('token_instance_transfers_count', { transfers_count: 42 }, { pathParams: { id: tokenInstanceMock.unique.id, hash } });
  await mockAssetResponse('http://localhost:3000/nft-marketplace-logo.png', './playwright/mocks/image_s.jpg');
});

test('base view +@dark-mode +@mobile', async({ render, page }) => {
  const component = await render(
    <TestApp>
      <TokenInstanceDetails data={ tokenInstanceMock.unique } token={ tokenInfoERC721a }/>
    </TestApp>,
  );

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test.describe('action button', () => {
  test.beforeEach(async({ mockFeatures, mockApiResponse, mockAssetResponse }) => {
    await mockFeatures([ [ 'action_button_exp', true ] ]);
    const metadataResponse = generateAddressMetadataResponse(protocolTagWithMeta);
    await mockApiResponse('address_metadata_info', metadataResponse, { queryParams: addressMetadataQueryParams });
    await mockAssetResponse(protocolTagWithMeta?.meta?.appLogoURL as string, './playwright/mocks/image_s.jpg');
  });

  test('base view +@dark-mode +@mobile', async({ render, page }) => {
    const component = await render(
      <TestApp>
        <TokenInstanceDetails data={ tokenInstanceMock.unique } token={ tokenInfoERC721a }/>
      </TestApp>,
    );

    await expect(component).toHaveScreenshot({
      mask: [ page.locator(configs.adsBannerSelector) ],
      maskColor: configs.maskColor,
    });
  });

  test('without marketplaces +@dark-mode +@mobile', async({ render, page, mockEnvs }) => {
    mockEnvs(ENVS_MAP.noNftMarketplaces);

    const component = await render(
      <TestApp>
        <TokenInstanceDetails data={ tokenInstanceMock.unique } token={ tokenInfoERC721a }/>
      </TestApp>,
    );

    await expect(component).toHaveScreenshot({
      mask: [ page.locator(configs.adsBannerSelector) ],
      maskColor: configs.maskColor,
    });
  });
});
