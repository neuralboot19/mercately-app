import React from 'react';
import { Modal, Text } from 'react-native';
import {
  Body,
  Button,
  Header,
  Title,
  Right,
  Icon
} from 'native-base';
import PropTypes from 'prop-types';

import styles from '../../../AppStyles';
import AgentsList from './AgentsList';

const AgentSelectionPicker = ({
  agentsList,
  assignedAgentId,
  onClose,
  onPress,
  visible
}) => (
  <Modal animated visible={visible}>
    <Header>
      <Body style={styles.assignAgentPickerHeaderTitle}>
        <Title>
          <Text>Reasignar Chat</Text>
        </Title>
      </Body>
      <Right style={styles.assignAgentPickerHeaderCloseButton}>
        <Button transparent onPress={onClose}>
          <Icon name="close"/>
        </Button>
      </Right>
    </Header>
    <AgentsList
      agentsList={agentsList}
      assignedAgentId={assignedAgentId}
      onPress={onPress}
    />
  </Modal>
);
AgentSelectionPicker.propTypes = {
  assignedAgentId: PropTypes.number.isRequired,
  agentsList: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onPress: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

export default AgentSelectionPicker;
