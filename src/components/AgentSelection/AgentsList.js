import React from 'react';
import {
  ScrollView,
  FlatList,
  Text
} from 'react-native';
import {
  Container,
  Content
} from 'native-base';
import PropTypes from 'prop-types';
import AgentItem from './AgentItem';
import styles from '../../../AppStyles';

export default function AgentsList({ agentsList, assignedAgentId, onPress }) {
  const renderItem = (agent) => (
    <AgentItem
      agent={agent.item}
      assignedAgentId={assignedAgentId}
      onPress={() => onPress(agent.item.id)}
    />
  );

  if (!agentsList.length) {
    return (
      <Container>
        <Content>
          <Text style={styles.assignAgentPickerNoAgentsMessage}>
            No existen agentes para asignar
          </Text>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <ScrollView>
          <FlatList
            data={agentsList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </ScrollView>
      </Content>
    </Container>
  );
}

AgentsList.propTypes = {
  agentsList: PropTypes.array.isRequired,
  assignedAgentId: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
