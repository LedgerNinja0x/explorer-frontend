import { chakra } from '@chakra-ui/react';
import React from 'react';

import { mediaStyleProps, videoPlayProps } from './utils';

interface Props {
  src: string;
  autoPlay?: boolean;
  onLoad: () => void;
  onError: () => void;
  onClick?: () => void;
}

const NftVideo = ({ src, autoPlay = true, onLoad, onError, onClick }: Props) => {
  return (
    <chakra.video
      { ...videoPlayProps }
      autoPlay={ autoPlay }
      src={ src }
      onCanPlayThrough={ onLoad }
      onError={ onError }
      borderRadius="md"
      onClick={ onClick }
      { ...mediaStyleProps }
    />
  );
};

export default chakra(NftVideo);
