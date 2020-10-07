import React from 'react';
import {
  Body,
  Card,
  CardItem,
  ListItem,
  Text
} from 'native-base';
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../AppStyles';

export default function QuickReplyItem({ quickReply, onPress }) {
  return (
    <ListItem
      style={styles.itemContainer}
      onPress={onPress}
    >
      <Card style={styles.itemCard}>
        <CardItem header bordered>
          <Text>{quickReply.title}</Text>
        </CardItem>
        <CardItem bordered>
          <Body>
            <Text style={styles.itemResponseLabel}>Respuesta:</Text>
            <Text>{quickReply.answer}</Text>
            {quickReply.image_url
            && (
              <CardItem cardBody>
                <Image
                  source={{ uri: quickReply.image_url }}
                  style={styles.itemImage}
                />
              </CardItem>
            )}
          </Body>
        </CardItem>
      </Card>
    </ListItem>
  );
}

QuickReplyItem.propTypes = {
  quickReply: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired
};
