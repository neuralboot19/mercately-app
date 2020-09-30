import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Alert,
  FlatList,
  View,
  ActivityIndicator,
  Text
} from 'react-native';
import {
  Container,
  Content
} from 'native-base';
import PropTypes from 'prop-types';
import { API } from '../../util/api';
import QuickReplyItem from '../QuickReplyItem/QuickReplyItem';

import styles from '../../../AppStyles';

export default function QuickRepliesList({ onPress }) {
  const [quickReplies, setQuickReplies] = useState();

  const onResponse = {
    success: (response) => {
      try {
        setQuickReplies(response.templates.data);
      } catch (error) {
        showErrorAlert(error);
      }
    },
    error: (error) => {
      showErrorAlert(error);
    }
  };

  const showErrorAlert = (error) => {
    console.log(error);
    Alert.alert(
      'Error',
      'No se pudo obtener el listado de respuestas rápidas',
      [
        { text: 'Reintentar', onPress: () => API.whatsAppQuickReplies(onResponse) }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => API.whatsAppQuickReplies(onResponse), []);

  const renderItem = (item) => {
    const quickReply = item.item.attributes;
    return (
      <QuickReplyItem
        quickReply={quickReply}
        onPress={() => onPress(quickReply)}
      />
    );
  };

  if (!quickReplies) {
    return (
      <View style={styles.spinner}>
        <ActivityIndicator size="large" color="#34aae1" />
      </View>
    );
  }

  if (!quickReplies.length) {
    return (
      <Container>
        <Content>
          <Text style={styles.noRepliesMessage}>
            No cuenta con respuestas rápidas asignadas
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
            data={quickReplies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </ScrollView>
      </Content>
    </Container>
  );
}

QuickRepliesList.propTypes = {
  onPress: PropTypes.func.isRequired
};
