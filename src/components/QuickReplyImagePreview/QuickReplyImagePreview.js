import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Icon } from 'native-base';
import PropTypes from 'prop-types';
import styles from '../../../AppStyles';

export default function QuickReplyImagePreview({ imageUrl, onPress }) {
  return (
    <View>
      <Image style={styles.previewImage} resizeMode="contain" source={{ uri: imageUrl }}/>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onPress}
      >
        <Icon name="times-circle-o" type="FontAwesome" size={30}/>
      </TouchableOpacity>
    </View>
  );
}

QuickReplyImagePreview.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
