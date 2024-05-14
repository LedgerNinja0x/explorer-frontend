import React from 'react';

import * as txMock from 'mocks/txs/tx';
import { ENVS_MAP } from 'playwright/fixtures/mockEnvs';
import { test, expect } from 'playwright/lib';
import * as configs from 'playwright/utils/configs';

import TxInfo from './TxInfo';

test('between addresses +@mobile +@dark-mode', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.base } isLoading={ false }/>);

  await page.getByText('View details').click();

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('creating contact', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.withContractCreation } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('with token transfer +@mobile', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.withTokenTransfer } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('with decoded revert reason', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.withDecodedRevertReason } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('with decoded raw reason', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.withRawRevertReason } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('pending', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.pending } isLoading={ false }/>);

  await page.getByText('View details').click();

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('with actions uniswap +@mobile +@dark-mode', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.withActionsUniswap } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('with blob', async({ render, page }) => {
  const component = await render(<TxInfo data={ txMock.withBlob } isLoading={ false }/>);

  await page.getByText('View details').click();

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('l2', async({ render, page, mockEnvs }) => {
  await mockEnvs(ENVS_MAP.optimisticRollup);
  const component = await render(<TxInfo data={ txMock.l2tx } isLoading={ false }/>);
  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('without testnet warning', async({ render, page, mockEnvs }) => {
  await mockEnvs([
    [ 'NEXT_PUBLIC_IS_TESTNET', 'false' ],
  ]);
  const component = await render(<TxInfo data={ txMock.l2tx } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});

test('stability customization', async({ render, page, mockEnvs }) => {
  await mockEnvs(ENVS_MAP.stabilityEnvs);
  const component = await render(<TxInfo data={ txMock.stabilityTx } isLoading={ false }/>);

  await expect(component).toHaveScreenshot({
    mask: [ page.locator(configs.adsBannerSelector) ],
    maskColor: configs.maskColor,
  });
});
