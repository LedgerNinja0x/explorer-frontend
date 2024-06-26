import { Checkbox, Flex, chakra } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import type { ChangeEvent } from 'react';
import React from 'react';
import { getAddress } from 'viem';

import type { ContractAbiItemOutput } from './types';

import { WEI } from 'lib/consts';
import { currencyUnits } from 'lib/units';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';

import { matchInt } from './form/utils';

function castValueToString(value: number | string | boolean | object | bigint | undefined): string {
  switch (typeof value) {
    case 'string':
      return value;
    case 'boolean':
      return String(value);
    case 'undefined':
      return '';
    case 'number':
      return value.toLocaleString(undefined, { useGrouping: false });
    case 'bigint':
      return value.toString();
    case 'object':
      return JSON.stringify(value, undefined, 2);
  }
}

interface Props {
  data: ContractAbiItemOutput;
}

const ContractAbiItemConstant = ({ data }: Props) => {
  const [ value, setValue ] = React.useState<string>(castValueToString(data.value));
  const [ label, setLabel ] = React.useState(currencyUnits.wei.toUpperCase());

  const intMatch = matchInt(data.type);

  const handleCheckboxChange = React.useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const initialValue = castValueToString(data.value);

    if (event.target.checked) {
      setValue(BigNumber(initialValue).div(WEI).toFixed());
      setLabel(currencyUnits.ether.toUpperCase());
    } else {
      setValue(BigNumber(initialValue).toFixed());
      setLabel(currencyUnits.wei.toUpperCase());
    }
  }, [ data.value ]);

  const content = (() => {
    if (typeof data.value === 'string' && data.type === 'address' && data.value) {
      return (
        <AddressEntity
          address={{ hash: getAddress(data.value) }}
          noIcon
        />
      );
    }

    return <chakra.span wordBreak="break-all" whiteSpace="pre-wrap">({ data.type }): { String(value) }</chakra.span>;
  })();

  return (
    <Flex flexDir={{ base: 'column', lg: 'row' }} columnGap={ 2 } rowGap={ 2 }>
      { content }
      { Number(intMatch?.power) >= 128 && <Checkbox onChange={ handleCheckboxChange }>{ label }</Checkbox> }
    </Flex>
  );
};

export default ContractAbiItemConstant;
