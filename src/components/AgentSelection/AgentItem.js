import React from 'react';
import {
  Body,
  Icon,
  Left,
  ListItem,
  Text
} from 'native-base';
import { Alert } from 'react-native';
import PropTypes from 'prop-types';

export default function AgentItem({ agent, assignedAgentId, onPress }) {
  const agentName = `${agent.first_name && agent.last_name ? `${agent.first_name} ${agent.last_name}` : agent.email}`;
  const confirmationMessage = agent.id === '' ? '¿Está seguro que desea quitar la asignación a este chat?' : `¿Está seguro que desea asignar este chat al agente ${agentName}?`;
  const showConfirmationDialog = () => {
    Alert.alert(
      'Confirmar asignación',
      confirmationMessage,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        { text: 'Sí', onPress }
      ],
      { cancelable: true }
    );
  };

  return (
    <ListItem
      disabled={assignedAgentId === agent.id}
      icon
      onPress={showConfirmationDialog}
      selected={assignedAgentId === agent.id}
    >
      <Left>
        <Icon name="person" />
      </Left>
      <Body>
        <Text>
          {agentName}
        </Text>
      </Body>
    </ListItem>
  );
}

AgentItem.propTypes = {
  agent: PropTypes.object.isRequired,
  assignedAgentId: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
