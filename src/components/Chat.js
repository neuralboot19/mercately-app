import React, { Component } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, Modal, Linking, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Toolbar, Button } from 'react-native-material-ui';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import Moment from 'moment';
import 'moment/locale/es';

// Component
import EditCustomer from './EditCustomer';
import TemplatesCustomer from './Templates';

// Loader module Audio and Video
import { Audio, Video } from 'expo-av';

// Socket io client
import io from 'socket.io-client';

// Globals
import * as globals from '../util/globals';

// Api
import { API } from '../util/api';

// Style
const styles = require('../../AppStyles');

export default class Chat extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      customerId: this.props.route.params.data.id,
      spinner: false,
      messages: [],
      newMessage: false,
      isVisibleModal: false,
      isVisibleModalEditCustomer: false,
      isVisibleModalTemplatesCustomer: false,
      urlImageZoom: "",
      statusPlaySound: "Reproducir",
      buttonSendDisabled: true,
      messageText: "",
      canWrite: true,
      whatsappOptIn: this.props.route.params.data.whatsapp_opt_in,
      gupshupIntegrated: globals.retailer_integration
    };
    this.socket = io(globals.url_socket_io, {jsonp: true});
    this.socket.on('connect', () => {this.socket.emit('create_room', globals.id)});
    this.getReplyChat = this.getReplyChat.bind(this);
    this.socket.on('message_chat', this.getReplyChat)
    this.props.navigation.addListener('blur', () => {
      this.setState({customerId:null}, () => {
        this.props.navigation.navigate('Dashboard')
      })
    });
    this.opted_in = false;
  }

  componentDidMount() {
    this.opted_in = this.props.route.params.data.whatsapp_opt_in;
    let rDate = Moment(this.props.route.params.data.recent_inbound_message_date).local();
    this.setState({
      canWrite: Moment().local().diff(rDate, 'hours') < 24
    }, () => {
      this.opted_in = this.props.route.params.data.whatsapp_opt_in || false
    })
    API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse,{},this.state.customerId,1,true);
  }

  customersKarixWhatsappMessagesResponse = {
    success: (response) => {
      try {
        let orderMessages = response.messages.sort((a, b) => a.created_time < b.created_time)
        this.setState({messages:orderMessages})
      } catch (error) {
        console.log('LOGIN RESPONSE ERROR',error)
      }
      this.setState({spinner:false});
    },
    error: (err) => {
      this.setState({spinner: false})
      Alert.alert(globals.APP_NAME,err.message,[{text:'OK'}]);
    }
  }
 
  onPressPlaySound = async (url) => {
    if (this.state.statusPlaySound == "Reproducir") {
      this.setState({statusPlaySound: "Pausar"})
      await Audio.setIsEnabledAsync(true);
      const sound = new Audio.Sound();
      await sound.loadAsync({uri:url});
      await sound.playAsync();
      await this.onPressStopSound(url);
    }
  }

  onPressStopSound = async (url) => {
    if (this.state.statusPlaySound == "Pausar") {
      this.setState({statusPlaySound: "Reproducir"})
      const sound = new Audio.Sound();
      await sound.loadAsync({uri:url});
      await sound.stopAsync();
    }
  }

  renderItem = (item) =>{
    let message = item.item
    let stylesChatContainer = []
    let stylesChatText = []
    let stylesFooterMessage = []
    let icon = ''
    switch (message.direction) {
      case 'outbound':
        stylesChatContainer = [styles.chatContainer,{alignItems:"flex-end"}]
        stylesChatText = [styles.chatText,{backgroundColor:"#ececec"}]
        stylesFooterMessage = [styles.footerMessage,{backgroundColor:"#ececec", justifyContent:"flex-end"}]
        icon = 'see'
        break;
      case 'inbound':
        stylesChatContainer = [styles.chatContainer,{alignItems:"flex-start"}]
        stylesChatText = [styles.chatText,{backgroundColor:"#cecece"}]
        stylesFooterMessage = [styles.footerMessage,{backgroundColor:"#cecece"}]
        break;
    }
    let iconsName = message.status == 'sent' ? 'check' : (message.status == 'delivered' ? 'check-all' : ( message.status == 'read' ? 'check-all' : 'sync'))
    let iconsColor = message.status == 'sent' ? 'black' : (message.status == 'delivered' ? 'black' : ( message.status == 'read' ? '#34aae1' : 'black'))
    return(
      <View style={stylesChatContainer}>
        {message.content_type == 'text' && (
          <Text style={stylesChatText}>{message.content_text}</Text>
        )}
        {message.content_type == 'location' && (
          <TouchableOpacity style={[stylesChatText,{flexDirection:'row', justifyContent:'space-between'}]} onPress={() => {Linking.openURL(`https://www.google.com/maps/place/${message.content_location_latitude},${message.content_location_longitude}`)}} >
            <Text>Ver ubucación Google Map</Text>
            <Entypo name="location" size={20} color={iconsColor} />
          </TouchableOpacity>
        )}
        {message.content_type == 'media' && message.content_media_type == 'document' && (
          <TouchableOpacity style={[stylesChatText,{flexDirection:'row', justifyContent:'space-between'}]} onPress={() => {Linking.openURL(message.content_media_url)}} >
            <Text>{message.content_media_caption}</Text>
            <MaterialCommunityIcons name="download" size={20} color={iconsColor} />
          </TouchableOpacity>
        )}
        {message.content_type == 'media' && (message.content_media_type == 'voice' || message.content_media_type == 'audio') && (
          <TouchableOpacity style={[stylesChatText,{flexDirection:'row', justifyContent:'space-between'}]} onPress={() => this.state.statusPlaySound == "Pausar" ? this.onPressStopSound(message.content_media_url) : this.onPressPlaySound(message.content_media_url)} >
            <Text>{this.state.statusPlaySound} Audio</Text>
            <MaterialCommunityIcons name={this.state.statusPlaySound == "Pausar" ? "reload" : "play"} size={20} color={iconsColor} />
          </TouchableOpacity>
        )}
        {message.content_type == 'media' && message.content_media_type == 'video' && (
          <Video
            source={{uri: message.content_media_url}}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay={false}
            isLooping={false}
            useNativeControls
            style={[stylesChatText,{height:250}]}
          >
          </Video>
        )}
        {message.content_type == 'media' && message.content_media_type == 'image' ?
          <TouchableOpacity style={{height:200, width:'75%'}} onPress={() => this.onPressImg(message.content_media_url)} >
            <Image source={{uri: message.content_media_url}} style={{flex:1, borderTopLeftRadius:10, borderTopRightRadius:10}} />
          </TouchableOpacity>
        : null}
        <View style={stylesFooterMessage}>
          <Text style={{fontSize:10, color:'#999'}}>{Moment(message.created_time).locale('es').fromNow()}</Text>
          {icon == 'see' ?
            <MaterialCommunityIcons name={iconsName} size={15} color={iconsColor} style={{marginHorizontal:5}} />
          : null}
        </View>
      </View>
    )
  }

  onPressImg = (uri) => {
    this.setState({isVisibleModal:true,urlImageZoom:uri})
  }

  onPressSendMessage = (data) => {
    let message = data == "" ? this.state.messageText : data
    let template = data == "" ? false : true
    this.setState({spinner:true, isVisibleModalTemplatesCustomer:false})
    let endData = {
      "message": message,
      "customer_id": this.state.customerId,
      "template": template,
      "type": 'text'
    }
    API.sendWhatsAppMessage(this.sendWhatsAppMessageResponse,endData,true);
  }

  sendWhatsAppMessageResponse = {
    success: (response) => {
      try {
        this.textMenssage.clear()
        this.setState({spinner:false,buttonSendDisabled:true})
        console.log('SEND MESSAGE RESPONSE responseeeeeeeeee')
      } catch (error) {
        console.log('SEND MESSAGE RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('SEND MESSA RESPONSE ERR',err)
    }
  }

  getReplyChat = (data) => {
    let karix_message = data.karix_whatsapp_message.karix_whatsapp_message;
    if (this.state.customerId == karix_message.customer_id) {
      if (karix_message.content_type == 'text') {
        if (!this.state.newMessage) {
          let messages = this.state.messages;
          let message_id = karix_message.id;
          messages = this.removeByTextArray(messages, karix_message.content_text, message_id);
          let index = this.findMessageInArray(messages, message_id);
          let newSort = this.state.messages.concat(karix_message).sort(this.sortMessages());
          newSort.sort((a, b) => a.created_time < b.created_time)
          if (index == -1) {
            this.setState({
              messages: newSort,
              newMessage: false
            })
          }
        }
      } else if ((['image', 'voice', 'audio', 'video', 'document'].includes(karix_message.content_media_type) || ['location', 'contact'].includes(karix_message.content_type)) &&
        karix_message.direction == 'inbound') {
        this.setState({
          messages: this.state.messages.concat(karix_message),
          newMessage: false,
        })
      }

      if (karix_message.direction == 'inbound') {
        API.whatsAppMessageAsRead(this.whatsAppMessageAsReadResponse,{message_id: karix_message.id},this.state.customerId,true);
        this.state.can_write = true;
      }
    }
  }

  whatsAppMessageAsReadResponse= {
    success: (response) => {
      try {
        console.log('RESPONSE RESPONSE READ',response)
      } catch (error) {
        console.log('RESPONSE ERROR READ',error)
      }
    },
    error: (err) => {
      console.log('RESPONSE ERR READ',err)
    }
  }

  removeByTextArray = (arr, text, id=null) => {
    let index;

    if (id) {
      index = arr.findIndex((el) => el.content_text == text && el.id == id)
      if (index == -1) {
        index = arr.findIndex((el) => el.content_text == text && !el.id)
      }
    } else {
      index = arr.findIndex((el) => el.content_text == text && !el.id)
    }

    if (index !== -1) {
      arr.splice(index, 1);
    }

    return arr
  }

  findMessageInArray = (arr, id) => (
    arr.findIndex((el) => (
      el.id == id
    ))
  )

  sortMessages = () => {
    return function(a, b) {
      if (Moment(a.created_time) == Moment(b.created_time)) {
        return 0;
      }
      if (Moment(a.created_time) > Moment(b.created_time)) {
        return 1;
      }
      if (Moment(a.created_time) < Moment(b.created_time)) {
        return -1;
      }
    }
  }

  onPressBack = () => {
    this.setState({customerId:null}, () => {
      this.props.navigation.navigate('Dashboard')
    })
  }

  onPressMenu = (option) => {
    if (option.index == 0) {
      this.setState({isVisibleModal:false, isVisibleModalEditCustomer:true})
    }
  }

  inputMessage = (messageText) => {
    let validated = this.state.buttonSendDisabled
    if (messageText.length == 0) {
      validated = true
    } else {
      validated = false
    }
    this.setState({messageText:messageText, buttonSendDisabled:validated})
  }

  openTemplate = () => {
    if (this.state.whatsappOptIn || this.state.gupshupIntegrated == 0) {
      this.setState({isVisibleModalTemplatesCustomer:true})
    } else {
      Alert.alert(globals.APP_NAME,'Tengo el permiso explícito de enviar mensajes a este número (opt-in)',[
        {text: 'OK', onPress: () => API.whatsAppAcceptOptIn(this.whatsAppAcceptOptInResponse,{},this.state.customerId,true)}
      ])
    }
  }

  whatsAppAcceptOptInResponse = {
    success: (response) => {
      try {
        this.setState({isVisibleModalTemplatesCustomer:true})
        console.log('RESPONSE RESPONSE READ',response)
      } catch (error) {
        console.log('RESPONSE ERROR READ',error)
      }
    },
    error: (err) => {
      console.log('RESPONSE ERR READ',err)
    }
  }

  render() {
    return (
      <View style={styles.containerChat}>
        <Toolbar
          leftElement="keyboard-arrow-left"
          centerElement={this.props.route.params.data.fullName == "" ? this.props.route.params.data.phone : this.props.route.params.data.fullName}
          onLeftElementPress={() => this.onPressBack()}
          rightElement={{ menu: { icon: "more-vert", labels: ["Editar Usuario"] } }}
          onRightElementPress={ (option) => this.onPressMenu(option)}
        />
        <View style={styles.chatMain}>
          <FlatList
            inverted
            data = {this.state.messages}
            renderItem = {this.renderItem}
            keyExtractor={(item)=>item.id.toString()}
          />
        </View>
        {!this.state.canWrite ?
          <View style={styles.chatFooter}>
            <Button style={{container:[styles.inputMesage,{paddingVertical:22}], text:{color:'white'}}} text="Canal Cerrado. Puedes enviar una plantilla" upperCase={false} onPress={this.openTemplate} />
          </View>
        :
          <View style={styles.chatFooter}>
            <TextInput
              ref={ref => (this.textMenssage = ref)}
              style={styles.inputMesage}
              onChangeText={messageText => this.inputMessage(messageText)}
              value={this.state.messageText}
              keyboardType="default"
              multiline
            />
            {this.state.spinner == true ? (
              <View style={{marginHorizontal:22}}>
                <ActivityIndicator size="small" color="black" />
              </View>
            ):(
              <Button text="" upperCase={false} icon="send" disabled={this.state.buttonSendDisabled} onPress={this.onPressSendMessage} />
            )}
          </View>
        }
        <Modal visible={this.state.isVisibleModal} animated>
          <Toolbar
            rightElement="close"
            onRightElementPress={() => this.setState({isVisibleModal:false})}
          />
          <ReactNativeZoomableView
            maxZoom={1.5}
            minZoom={0.5}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            captureEvent={true}
          >
            <Image style={{ flex: 1, width: null, height: '100%' }} source={{uri: this.state.urlImageZoom}} resizeMode="contain" />
          </ReactNativeZoomableView>
        </Modal>
        <Modal visible={this.state.isVisibleModalEditCustomer} animated>
          <Toolbar
            centerElement="Detalles"
            rightElement="close"
            onRightElementPress={() => this.setState({isVisibleModalEditCustomer:false})}
          />
          <EditCustomer data={this.props.route.params.data}/>
        </Modal>
        <Modal visible={this.state.isVisibleModalTemplatesCustomer} animated>
          <Toolbar
            centerElement="Plantillas"
            rightElement="close"
            onRightElementPress={() => this.setState({isVisibleModalTemplatesCustomer:false})}
          />
          <TemplatesCustomer setSendMessageTemplate={this.onPressSendMessage} />
        </Modal>
      </View>
    )
  }
}