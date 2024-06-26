import { IconButton, Tooltip, useClipboard, chakra, useDisclosure, Skeleton, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import IconSvg from 'ui/shared/IconSvg';

export interface Props {
  text: string;
  className?: string;
  isLoading?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

const CopyToClipboard = ({ text, className, isLoading, onClick }: Props) => {
  const { hasCopied, onCopy } = useClipboard(text, 1000);
  const [ copied, setCopied ] = useState(false);
  // have to implement controlled tooltip because of the issue - https://github.com/chakra-ui/chakra-ui/issues/7107
  const { isOpen, onOpen, onClose } = useDisclosure();
  const iconColor = useColorModeValue('gray.400', 'gray.500');

  useEffect(() => {
    if (hasCopied) {
      setCopied(true);
    } else {
      setCopied(false);
    }
  }, [ hasCopied ]);

  const handleClick = React.useCallback((event: React.MouseEvent) => {
    onCopy();
    onClick?.(event);
  }, [ onClick, onCopy ]);

  if (isLoading) {
    return <Skeleton boxSize={ 5 } className={ className } borderRadius="sm" flexShrink={ 0 } ml={ 2 } display="inline-block"/>;
  }

  return (
    <Tooltip label={ copied ? 'Copied' : 'Copy to clipboard' } isOpen={ isOpen || copied }>
      <IconButton
        aria-label="copy"
        icon={ <IconSvg name="copy" boxSize={ 5 }/> }
        w="20px"
        h="20px"
        color={ iconColor }
        variant="simple"
        display="inline-block"
        flexShrink={ 0 }
        onClick={ handleClick }
        className={ className }
        onMouseEnter={ onOpen }
        onMouseLeave={ onClose }
        ml={ 2 }
        borderRadius={ 0 }
      />
    </Tooltip>
  );
};

export default React.memo(chakra(CopyToClipboard));
