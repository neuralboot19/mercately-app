import React from 'react';
import {
  Modal,
  Text
} from 'react-native';
import PropTypes from 'prop-types';
import {
  Body,
  Button,
  Header,
  Icon,
  Right,
  Title
} from 'native-base';
import QuickRepliesList from '../QuickRepliesList/QuickRepliesList';
import styles from '../../../AppStyles';

const QuickReplyPickerModal = ({ visible, onClose, onPress }) => (
  <Modal animated visible={visible}>
    <Header>
      <Body style={styles.headerTitle}>
        <Title>
          <Text>Respuestas Rápidas</Text>
        </Title>
      </Body>
      <Right style={styles.headerCloseButton}>
        <Button transparent onPress={onClose}>
          <Icon name="close"/>
        </Button>
      </Right>
    </Header>
    <QuickRepliesList onPress={onPress}/>
  </Modal>
);

QuickReplyPickerModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPress: PropTypes.func.isRequired
};

export default QuickReplyPickerModal;
