import { Box, Text, Popover, PopoverTrigger, PopoverBody, PopoverContent, useDisclosure } from '@chakra-ui/react';
import React from 'react';

import type { SolidityscanReport } from 'types/api/contract';

import config from 'configs/app';
import * as mixpanel from 'lib/mixpanel/index';
import LinkExternal from 'ui/shared/LinkExternal';
import SolidityscanReportButton from 'ui/shared/solidityscanReport/SolidityscanReportButton';
import SolidityscanReportDetails from 'ui/shared/solidityscanReport/SolidityscanReportDetails';
import SolidityscanReportScore from 'ui/shared/solidityscanReport/SolidityscanReportScore';

type Props = {
  securityReport?: SolidityscanReport['scan_report'] | null;
}

const ContractSecurityReport = ({ securityReport }: Props) => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  const handleClick = React.useCallback(() => {
    mixpanel.logEvent(mixpanel.EventTypes.PAGE_WIDGET, { Type: 'Security score', Source: 'Analyzed contracts popup' });
    onToggle();
  }, [ onToggle ]);

  if (!securityReport) {
    return null;
  }

  const url = securityReport?.scanner_reference_url;
  const {
    score_v2: securityScore,
    issue_severity_distribution: issueSeverityDistribution,
  } = securityReport.scan_summary;

  const totalIssues = Object.values(issueSeverityDistribution as Record<string, number>).reduce((acc, val) => acc + val, 0);

  return (
    <Popover isOpen={ isOpen } onClose={ onClose } placement="bottom-start" isLazy>
      <PopoverTrigger>
        <SolidityscanReportButton
          score={ parseFloat(securityScore) }
          onClick={ handleClick }
        />
      </PopoverTrigger>
      <PopoverContent w={{ base: '100vw', lg: '328px' }}>
        <PopoverBody px="26px" py="20px" fontSize="sm">
          <Box mb={ 5 }>
            The security score was derived from evaluating the smart contracts of a protocol on the { config.chain.name } network.
          </Box>
          <SolidityscanReportScore score={ parseFloat(securityScore) } mb={ 5 }/>
          { issueSeverityDistribution && totalIssues > 0 && (
            <Box mb={ 5 }>
              <Text py="7px" variant="secondary" fontSize="xs" fontWeight={ 500 }>Threat score & vulnerabilities</Text>
              <SolidityscanReportDetails vulnerabilities={ issueSeverityDistribution } vulnerabilitiesCount={ totalIssues }/>
            </Box>
          ) }
          <LinkExternal href={ url }>View full report</LinkExternal>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ContractSecurityReport;
