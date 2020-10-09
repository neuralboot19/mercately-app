import React from 'react';
import { Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import PropTypes from 'prop-types';
import { Container, Body, Button, Header, Icon, Right, Title, Text } from 'native-base';
import styles from '../../../AppStyles';

const Location = ({ visible, onClose, onPress, latitude, longitude }) => (  
  <Modal animated visible={visible}>
    <Header>
      <Body style={styles.headerTitle}>
        <Title>Ubicación</Title>
      </Body>
      <Right style={styles.headerCloseButton}>
        <Button transparent onPress={onClose}>
          <Icon name="close"/>
        </Button>
      </Right>
    </Header>
    <Container>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0050,
          longitudeDelta: 0.0050,
        }}
      >
        <Marker
          draggable
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          onDragEnd={(e) => alert(JSON.stringify(e.nativeEvent.coordinate))}
          title={'Ubicación'}
          description={'Tú Ubicación'}
        />
      </MapView>
    </Container>
    <Button full style={[styles.enter,{marginHorizontal:10}]} onPress={onPress}><Text>Enviar Ubicación actual</Text></Button>
  </Modal>
);

Location.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPress: PropTypes.func.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired
};

export default Location;
