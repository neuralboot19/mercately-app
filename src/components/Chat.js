import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Modal, Linking, FlatList, ActivityIndicator, Alert, ImageBackground, Platform, LayoutAnimation } from 'react-native';
import { Container, Content, Button, Header, Left, Body, Right, Title, Text, Subtitle, Icon, Item, Input, Card, CardItem, Spinner, Toast } from 'native-base';
import { Entypo, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import Moment from 'moment';
import 'moment/locale/es';
import {CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, SOCKET_URL} from '@env';

// Component
import EditCustomer from './EditCustomer';
import TemplatesCustomer from './Templates';
import QuickReplyPickerModal from './QuickReplyPickerModal/QuickReplyPickerModal';
import QuickReplyImagePreview from './QuickReplyImagePreview/QuickReplyImagePreview';
import LocationModal from './Location/LocationModal'
import AgentSelectionPicker from './AgentSelection/AgentSelectionPicker';

// Loader modules Expo
import { Audio, Video } from 'expo-av';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

// Modules Record Audio
import AudioRecorderPlayer, { AVEncoderAudioQualityIOSType, AVEncodingOption, AudioEncoderAndroidType, AudioSet, AudioSourceAndroidType } from 'react-native-audio-recorder-player';

// Loade module multimedia
import ImagePicker from 'react-native-image-crop-picker';

// Socket io client
import io from 'socket.io-client';

// Globals
import * as globals from '../util/globals';

// Api
import { API } from '../util/api';

// Style
const styles = require('../../AppStyles');

// Write in storage
const RNFS = require('react-native-fs');

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
      gupshupIntegrated: globals.retailer_integration,
      fullName: !this.props.route.params.data.fullName ? this.props.route.params.data.phone : this.props.route.params.data.fullName,
      assignedAgent: !this.props.route.params.data.assigned_agent ? 'No asignado' : this.props.route.params.data.assigned_agent,
      assignedAgentId: this.props.route.params.data.assignedAgentId,
      loadedImagesA:{},
      img1: "",
      img2: "",
      img3: "",
      img4: "",
      img5: "",
      visibleButtonSendSelectImg:false,
      displaySquare: false,
      loadImageCamera: false,
      sendButtonImgCamera: false,
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      recordStart: false,
      shouldShowQuickResponsePickerModal: false,
      quickReplyMediaUrl: null,
      toolBoxBottomStyle: 65,
      locationModal: false,
      latitude:'',
      longitude:'',
      shouldShowAgentAssignationPickerModal: false,
      allowStartBots: false
    };
    this.socket = io(SOCKET_URL, {jsonp: true});
    this.socket.on('connect', () => {this.socket.emit('create_room', globals.id)});
    this.getReplyChat = this.getReplyChat.bind(this);
    this.socket.on('message_chat', this.getReplyChat)
    this.props.navigation.addListener('blur', () => {
      this.setState({customerId:null})
      this.props.navigation.navigate('Dashboard')
    });
    this.opted_in = false;
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.3);
  }
  
  static getDerivedStateFromProps(props, state) {
    if (props.route.params.data.id !== state.customerId) {
      return {
        ...state,
        customerId: props.route.params.data.id,
        messages: state.messages,
        fullName: !props.route.params.data.fullName ? props.route.params.data.phone : props.route.params.data.fullName,
        assignedAgent: state.assignedAgent,
        assignedAgentId: state.assignedAgentId,
        canWrite: true
      }
    }
    // Return null if the state hasn't changed
    return null;
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.route.params.data.id !== prevProps.route.params.data.id) {
      // Llamada al api
      API.customer(this.customerResponse,this.state.customerId);
      API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse,this.state.customerId,1,true);
    }
  }

  componentDidMount() {
    this.opted_in = this.props.route.params.data.whatsapp_opt_in;
    this.agentsList = this.props.route.params.data.agentsList;
    let rDate = Moment(this.props.route.params.data.recent_inbound_message_date).local();
    this.setState({
      canWrite: Moment().local().diff(rDate, 'hours') < 24
    }, () => {
      this.opted_in = this.props.route.params.data.whatsapp_opt_in || false
    })
    API.customer(this.customerResponse,this.state.customerId);
    API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse,this.state.customerId,1,true);
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

  customerResponse = {
    success: (response) => {
      try {
        this.setState({
          allowStartBots: response.customer.allow_start_bots,
          assignedAgentId: response.customer.assigned_agent.id
        })
      } catch (error) {
        console.log('LOGIN RESPONSE ERROR',error)
      }
    },
    error: (err) => {
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
    let stylesBalloon = []
    let stylesHeaderMessage = []
    let icon = ''
    let titleHeader = ''
    switch (message.direction) {
      case 'outbound':
        stylesChatContainer = [{marginVertical:5, alignItems:'flex-end'}]
        stylesBalloon = [styles.balloon, {backgroundColor: '#c4e8f7'}]
        stylesHeaderMessage = [styles.headerMessage, {color:'#3cb4e5'}]
        icon = 'see'
        titleHeader = this.props.route.params.data.assigned_agent
        break;
      case 'inbound':
        stylesChatContainer = [{marginVertical:5, alignItems:'flex-start'}]
        stylesBalloon = [styles.balloon, {backgroundColor: '#f7f7f7'}]
        stylesHeaderMessage = [styles.headerMessage, {fontWeight: 'bold', paddingVertical:6}]
        titleHeader = this.state.fullName
        break;
    }
    let iconsName = message.status == 'sent' ? 'check' : (message.status == 'delivered' ? 'check-all' : ( message.status == 'read' ? 'check-all' : 'sync'))
    let iconsColor = message.status == 'sent' ? 'black' : (message.status == 'delivered' ? 'black' : ( message.status == 'read' ? '#782e79' : 'black'))
    return(
      <View style={stylesChatContainer}>
        <View style={stylesBalloon}>
          {titleHeader ? <Text style={stylesHeaderMessage}>{titleHeader}</Text> : null }
          {message.content_type == 'location' && (
            <TouchableOpacity style={[styles.chatText,{flexDirection:'row', justifyContent:'space-between'}]} onPress={() => {Linking.openURL(`https://www.google.com/maps/place/${message.content_location_latitude},${message.content_location_longitude}`)}} >
              <Text>Ubucación Google Map   </Text>
              <Entypo name="location" size={20} color={iconsColor} />
            </TouchableOpacity>
          )}
          {message.content_type == 'media' && message.content_media_type == 'document' && (
            <TouchableOpacity style={[styles.chatText,{flexDirection:'row', justifyContent:'space-between'}]} onPress={() => {Linking.openURL(message.content_media_url)}} >
              <Text>{!message.content_media_caption ? 'Descargar Documento   ' : message.content_media_caption}</Text>
              <MaterialCommunityIcons name="download" size={20} color={iconsColor} />
            </TouchableOpacity>
          )}
          {message.content_type == 'media' && (message.content_media_type == 'voice' || message.content_media_type == 'audio') && (
            <TouchableOpacity style={[styles.chatText,{flexDirection:'row', justifyContent:'space-between'}]} onPress={() => this.state.statusPlaySound == "Pausar" ? this.onPressStopSound(message.content_media_url) : this.onPressPlaySound(message.content_media_url)} >
              <Text>{this.state.statusPlaySound} Audio   </Text>
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
              style={[styles.chatText,{height:300,width:230,borderRadius:10}]}
            />
          )}
          {message.content_type == 'media' && message.content_media_type == 'image' && (
            <TouchableOpacity style={{height:200, width:200}} onPress={() => this.onPressImg(message.content_media_url)} >
              <Image source={{uri: message.content_media_url}} style={{flex:1, borderRadius:10}} />
              {!!message.content_media_caption && <Text style={styles.chatCaption}>{message.content_media_caption}</Text>}
            </TouchableOpacity>
          )}
          {message.content_type == 'text' && (
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
              <Text style={styles.chatText}>{message.content_text}</Text>
            </View>
          )}
          <View style={styles.footerMessage}>
            <Text style={{fontSize:10, color:'#999'}}>{Moment(message.created_time).locale('es').fromNow()}</Text>
            {icon == 'see' ?
              <MaterialCommunityIcons name={iconsName} size={15} color={iconsColor} style={{marginHorizontal:5}} />
            : null}
          </View>
        </View>
      </View>
    )
  }

  onPressImg = (uri) => {
    this.setState({isVisibleModal:true,urlImageZoom:uri})
  }

  onPressSendMessage = (data) => {
    let message = this.state.messageText ? this.state.messageText : data
    let template = !!data;
    this.setState({spinner:true, isVisibleModalTemplatesCustomer:false})
    let endData;
    if(this.state.quickReplyMediaUrl) {
      endData = {
        "template": false,
        "url": this.state.quickReplyMediaUrl,
        "type": "file",
        "caption": this.state.messageText,
        "id": this.state.customerId
      }
      API.sendWhatsAppFiles(this.sendWhatsAppMessageResponse, endData, this.state.customerId, true);
    } else {
      endData = {
        "message": message,
        "customer_id": this.state.customerId,
        "template": template,
        "type": 'text'
      }
      API.sendWhatsAppMessage(this.sendWhatsAppMessageResponse, endData, true);
    }
  }

  sendWhatsAppMessageResponse = {
    success: (response) => {
      try {
        if (!this.state.messageText == ""){
          this.setState({messageText:""})
        }
        this.setState({spinner:false,buttonSendDisabled:true, quickReplyMediaUrl: null, toolBoxBottomStyle: 65})
        API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse, this.state.customerId,1,true);
      } catch (error) {
        console.log('SEND MESSAGE RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('SEND MESSA RESPONSE ERR',err)
    }
  }

  setQuickReply = (quickReply) => {
    this.setState({
      quickReplyMediaUrl: quickReply.image_url,
      shouldShowQuickResponsePickerModal: false,
      displaySquare: false,
      toolBoxBottomStyle: quickReply.image_url ? 215 : 65
    }, () => this.inputMessage(quickReply.answer))
  }

  getReplyChat = (data) => {
    let karix_message = data.karix_whatsapp_message.karix_whatsapp_message;
    if (this.state.customerId == karix_message.customer_id) {
      if (karix_message.content_type == 'text' || karix_message.content_media_type == 'location' || karix_message.content_media_type == 'audio' || karix_message.content_media_type == 'image') {
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
        API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse,this.state.customerId,1,true);
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

  onPressMenu = () => {
    this.setState({isVisibleModal:false, isVisibleModalEditCustomer:true})
  }

  inputMessage = (messageText) => {
    let buttonSendDisabledValue = this.state.buttonSendDisabled
    let displaySquareValue = this.state.displaySquare
    if (messageText.length == 0 && this.state.quickReplyMediaUrl === null) {
      buttonSendDisabledValue = true
    } else {
      buttonSendDisabledValue = false
      displaySquareValue = false
    }
    this.setState({messageText:messageText, buttonSendDisabled:buttonSendDisabledValue, displaySquare:displaySquareValue})
  }

  openTemplate = () => {
    if (this.state.whatsappOptIn || this.state.gupshupIntegrated == 0) {
      this.setState({isVisibleModalTemplatesCustomer:true})
    } else {
      Alert.alert(globals.APP_NAME,'Tengo el permiso explícito de enviar mensajes a este número (opt-in)',[
        {text: 'OK', onPress: () => API.whatsAppAcceptOptIn(this.whatsAppAcceptOptInResponse,this.state.customerId,true)}
      ])
    }
  }

  whatsAppAcceptOptInResponse = {
    success: (response) => {
      try {
        this.setState({isVisibleModalTemplatesCustomer:true})
      } catch (error) {
        console.log('RESPONSE ERROR READ',error)
      }
    },
    error: (err) => {
      console.log('RESPONSE ERR READ',err)
    }
  }

  setData = (data) => {
    const {setDataDashboard} = this.props.route.params
    setDataDashboard(data, this.state.customerId)
    this.setState({fullName:data})
  }

  openCamera = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status !== 'granted') {
        this.getCameraPermissionAsync()
      } else {
        this.getCameraPermissionAsync()
      }
    }
  }

  getCameraPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      alert('Lo sentimos, necesitamos permisos de Cámara para que puedas enviar multimedias.');
    } else {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
      }).then(image => {
        this.setState({loadedImagesA:image, urlImageZoom:image.path, visibleButtonSendSelectImg:true, isVisibleModal:true})
      });
    }
  }

  openPicker = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status !== 'granted') {
        this.getPickerPermissionAsync()
      } else {
        this.getPickerPermissionAsync()
      }
    }
  }

  openQuickResponsePicker = () => {
    this.setState({shouldShowQuickResponsePickerModal: true})
  }

  removeQuickReplyMedia = () => {
    this.setState({
      quickReplyMediaUrl: null,
      buttonSendDisabled: this.state.messageText.length === 0,
      toolBoxBottomStyle: 65
    })
  }

  getPickerPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      alert('Lo sentimos, necesitamos permisos Multimedias para enviar imagenes.');
    } else {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        multiple: true,
        maxFiles: 5
      }).then(image => {
        let img01 = this.state.img1
        let img02 = this.state.img2
        let img03 = this.state.img3
        let img04 = this.state.img4
        let img05 = this.state.img5
        image.map(img => {
          switch (image.indexOf(img)) {
            case 0:
              img01 = img.path
              break;
            case 1:
              img02 = img.path
              break;
            case 2:
              img03 = img.path
              break;
            case 3:
              img04 = img.path
              break;
            case 4:
              img05 = img.path
              break;
            default:
              break;
          }
        })
        this.setState({loadedImagesA:image, img1:img01, img2:img02, img3:img03, img4:img04, img5:img05, visibleButtonSendSelectImg:true, isVisibleModal:true})
      });
    }
  }

  sendSelectImg = () => {
    const {loadedImagesA} = this.state
    this.setState({loadImageCamera:true, sendButtonImgCamera:true})
    if (loadedImagesA.length > 0){
      loadedImagesA.map(d => {
        this.uploadImgCloudinary(d.path, d.mime)
      })
    } else {
      this.uploadImgCloudinary(this.state.urlImageZoom, this.state.loadedImagesA.mime)
    }
  }

  uploadImgCloudinary = async (url, type) => {
    let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/image/upload';
    const source = {
      uri: url,
      type: type,
      name: 'App mobile imagen'
    }
    const data = new FormData()
    data.append('file', source)
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data
    }).then(res => res.json()).then(
      data => {
        this.setState({loadImageCamera:false, sendButtonImgCamera:false, displaySquare:false})
        let endData = {
          "url": data.secure_url,
          "template": false,
          "id": this.state.customerId
        }
        API.sendWhatsAppBulkFiles(this.sendWhatsAppBulkFilesResponse,endData,this.state.customerId,true);
      }).catch(err => {
        alert('An Error Occured While Uploading')
      }
    )
  }

  sendWhatsAppBulkFilesResponse = {
    success: (response) => {
      try {
        ImagePicker.clean().then(() => {
          this.setState({img1:'', img2:'', img3:'', img4:'', img5:'', urlImageZoom:'', visibleButtonSendSelectImg:false, isVisibleModal:false})
        }).catch(e => {
          alert(e);
        });
        API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse,this.state.customerId,1,true);
      } catch (error) {
        console.log('LOGIN RESPONSE ERROR ===>>>',error)
      }
    },
    error: (err) => {
      console.log('LOGIN RESPONSE ERR ===>>>',err)
    }
  }

  handleTap = () => {
    const { displaySquare } = this.state
    LayoutAnimation.configureNext({
      duration: 800,
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.scaleXY
      },
      delete: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity
      }
    })
    this.setState({displaySquare:!displaySquare})
  }

  onInitRecord = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
          alert('Lo sentimos, necesitamos permisos de Almacenamiento para escribir archivos.');
        } else {
          const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
          if (status !== 'granted') {
            alert('Lo sentimos, necesitamos permisos de Micrófono para enviar audio.');
          } else {
            const androidPath = RNFS.DocumentDirectoryPath + '/sound_mercately.mp3'
            console.log('androidPath', androidPath)
            const path = Platform.select({
              ios: 'sound_mercately.m4a',
              android: androidPath, // should give extra dir name in android. Won't grant permission to the first level of dir.
            })
            const audioSet = {
              AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
              AudioSourceAndroid: AudioSourceAndroidType.MIC,
              AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
              AVNumberOfChannelsKeyIOS: 2,
              AVFormatIDKeyIOS: AVEncodingOption.aac,
            }
            const meteringEnabled = false
            const uri = await this.audioRecorderPlayer.startRecorder(path, meteringEnabled, audioSet)
            this.audioRecorderPlayer.addRecordBackListener((e) => {
              this.setState({
                recordSecs: e.current_position,
                recordTime: this.audioRecorderPlayer.mmssss(
                  Math.floor(e.current_position),
                ),
                recordStart: true
              });
            });
          }
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
  }

  cancelAudio = () => {
    this.audioRecorderPlayer.removeRecordBackListener()
    this.audioRecorderPlayer.stopPlayer()
    this.audioRecorderPlayer.removePlayBackListener()
    this.setState({
      recordSecs:0,
      recordStart:false
    })
  }

  sendSelectAudio = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder()
    this.audioRecorderPlayer.removeRecordBackListener()
    const base64A = await RNFS.readFile(result, 'base64');
    let base64Aud = `data:audio/mpeg;base64,${base64A}`;
    let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/upload';
    let fd = new FormData();
        fd.append('file', `${base64Aud}`);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('resource_type', 'audio')
    fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: fd
    }).then(res => res.json()).then(
      data => {
        this.setState({recordSecs:0, recordTime:'00:00', recordStart:false})
        let endData = {
          "url": data.secure_url,
          "template": false,
          "type": 'audio'
        }
        API.sendWhatsAppFiles(this.sendWhatsAppFilesResponse,endData,this.state.customerId,true);
      }).catch(err => {
        alert('An Error Occured While Uploading')
      }
    )
  }

  sendWhatsAppFilesResponse = {
    success: (response) => {
      try {
        API.customersKarixWhatsappMessages(this.customersKarixWhatsappMessagesResponse,this.state.customerId,1,true);
      } catch (error) {
        console.log('LOGIN RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      Alert.alert(globals.APP_NAME,err.message,[{text:'OK'}]);
    }
  }

  openLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Se denegó el permiso para acceder a la ubicación')
    } else {
      let location = await Location.getCurrentPositionAsync({});
      let responseLatitude = location.coords.latitude;
      let responseLongitude = location.coords.longitude;
      this.setState({latitude:responseLatitude, longitude:responseLongitude, locationModal: true})
    }
  }

  setLocation = (location) => {
    let params = {
      "longitude": location.longitude,
      "latitude": location.latitude,
      "customer_id": this.state.customerId,
      "template": false,
      "type": 'location'
    }
    API.sendWhatsAppLocation(this.sendWhatsAppLocationResponse,params,true);
  }

  sendWhatsAppLocationResponse = {
    success: (response) => {
      try {
        this.setState({
          locationModal: false,
          displaySquare: false
        })
      } catch (error) {
        console.log('LOGIN RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('LOGIN RESPONSE ERR',err)
    }
  }

  assignAgent = (agentId) => {
    const data = {
      'agent': {'retailer_user_id': agentId || null, 'chat_service': 'whatsapp'},
      'id': this.state.customerId,
      'agent_customer': {}
    }
    API.assignAgent(this.assignAgentResponse, data, this.state.customerId);
  }

  assignAgentResponse = {
    success: (response) => {
      try {
        this.setState({
          shouldShowAgentAssignationPickerModal: false,
          customerId: null
        },  this.props.navigation.navigate('Dashboard'))
        Toast.show({
          text: response.message,
          buttonText: 'OK',
          type: 'success',
          duration: 4000
        })
      } catch (error) {
        Toast.show({
          text: error.message,
          buttonText: 'OK',
          type: 'danger',
          duration: 4000
        })
      }
    },
    error: (err) => {
      Toast.show({
        text: err.message,
        buttonText: 'OK',
        type: 'danger',
        duration: 4000
      })
    }
  }

  colorAllowStartBots = () => {
    let color = this.state.allowStartBots ? '#3cb4e5' : 'white'
    return color
  }

  getToggleChatBot = () => {
    API.allowStartBots(this.allowStartBotsResponse, this.state.customerId);
  }

  allowStartBotsResponse = {
    success: (response) => {
      let msg = response.customer.allow_start_bots ? 'Bot Activado' : 'Bot Desactivado'
      try {
        this.setState({
          allowStartBots: response.customer.allow_start_bots
        })
        Toast.show({
          text: msg,
          buttonText: 'OK',
          type: 'success',
          duration: 4000
        })
      } catch (error) {
        Toast.show({
          text: error.message,
          buttonText: 'OK',
          type: 'danger',
          duration: 4000
        })
      }
    },
    error: (err) => {
      Toast.show({
        text: err.message,
        buttonText: 'OK',
        type: 'danger',
        duration: 4000
      })
    }
  }

  render() {
    return (
      <View style={styles.containerChat}>
        <Header>
          <Left>
            <Button transparent onPress={() => this.onPressBack()}>
              <Entypo name='chevron-small-left' size={24} color='white' />
            </Button>
          </Left>
          <Body>
            <Button full transparent iconLeft style={{paddingBottom:0}} onPress={() => this.onPressMenu()}>
              <Left>
                <Title>{this.state.fullName}</Title>
              </Left>
              <MaterialCommunityIcons name='account-edit' size={24} color='white' />
            </Button>
            <Subtitle style={{marginBottom:16, fontSize:10}}><Text style={{color:'#ececec', fontSize:10}}>Asignado a: </Text>{this.state.assignedAgent}</Subtitle>
          </Body>
          <Icon name='call' type='MaterialIcons' style={{color:'white', fontSize:22, marginVertical:5, marginHorizontal:5}} onPress={() => {Linking.openURL('tel:' + this.props.route.params.data.phone)}} />
          <Icon name='robot' type='MaterialCommunityIcons' style={{color:`${this.colorAllowStartBots()}`, fontSize:22, marginVertical:5, marginHorizontal:5}} onPress={() => this.getToggleChatBot()} />
          <Right>
            <TouchableOpacity onPress={() => {this.setState({shouldShowAgentAssignationPickerModal: true})}}>
              <View style={styles.openAgentSelectionButtonContainer}>
                <MaterialCommunityIcons name='account-switch' size={24} color='white' />
              <Text  style={styles.openAgentSelectionButtonText}>Reasignar</Text>
              </View>
            </TouchableOpacity>
          </Right>
        </Header>
        <ImageBackground source={require('../../assets/background_chat.png')} style={styles.image}>
          <View style={styles.chatMain}>
            <FlatList
              inverted
              data = {this.state.messages}
              renderItem = {this.renderItem}
              keyExtractor={(item)=>item.id.toString()}
            />
          </View>
        </ImageBackground>
        <ImageBackground source={require('../../assets/background_chat.png')} style={{}}>
          {!this.state.canWrite ?
            <Button full style={styles.inputMessageButton} onPress={this.openTemplate}>
              <Text info>Canal Cerrado. Puedes enviar una plantilla</Text>
            </Button>
          :
            <View style={styles.chatFooter}>
              {this.state.recordStart ?
                <Item rounded style={[{padding:10, paddingVertical:12},styles.inputMessage]}>
                  <Icon name='microphone' type='FontAwesome' style={{color:'red'}} />
                  <Text>{this.state.recordTime}</Text>
                  <Right>
                    <Text style={{marginRight:10, color:'red'}} onPress={this.cancelAudio}>Cancelar</Text>
                  </Right>
                </Item>
              :
                <Item rounded style={styles.inputMessage}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Input
                      placeholder='Escribe un mensaje aquí'
                      onChangeText={messageText => this.inputMessage(messageText)}
                      value={this.state.messageText}
                      keyboardType="default"
                      multiline
                    />
                    <Icon name='bolt' type='FontAwesome' style={[styles.optionSelectIcon,{paddingRight:0}]} onPress={() => this.openQuickResponsePicker()}/>
                    <Icon name='paperclip' type='FontAwesome' style={[styles.optionSelectIcon,{paddingRight:0}]} onPress={() => this.handleTap()}/>
                    <Icon name='camera' type='FontAwesome' style={styles.optionSelectIcon} onPress={() => this.openCamera()} />
                  </View>
                  {this.state.quickReplyMediaUrl &&
                    <QuickReplyImagePreview imageUrl={this.state.quickReplyMediaUrl} onPress={() => {this.removeQuickReplyMedia()}}/>
                  }
                </Item>
              }
              {this.state.spinner == true ? (
                <View style={{marginVertical:23, marginHorizontal:6, paddingHorizontal:10, marginRight:8}}>
                  <ActivityIndicator size="small" color="black" />
                </View>
              ):(
                this.state.buttonSendDisabled ?
                  <Button iconLeft info full rounded style={this.state.recordStart ? {paddingHorizontal:10.7, marginRight:10, marginVertical:10} : {paddingHorizontal:15, marginRight:10, marginVertical:10}} onPress={() => this.state.recordStart ? this.sendSelectAudio() : this.onInitRecord() } >
                    <FontAwesome name={this.state.recordStart ? "send" : "microphone"} size={24} color="white" />
                  </Button>
                :
                  <Button iconLeft info full rounded style={{paddingHorizontal:10.7, marginRight:10, marginVertical:10}} onPress={() => this.onPressSendMessage()} >
                    <FontAwesome name="send" size={24} color="white" />
                  </Button>
              )}
            </View>
          }
        </ImageBackground>
        {this.state.displaySquare &&
          <View style={{marginHorizontal:10, position:'absolute', width:'95%', bottom: this.state.toolBoxBottomStyle}} >
            <Card>
              <CardItem>
                <View style={styles.optionsPanelContainer}>
                  <View style={styles.optionsPanelItemContainer}>
                    <Button info rounded style={styles.optionPanelItemButton}
                            onPress={() => this.openQuickResponsePicker()}>
                      <Icon type='FontAwesome' name='bolt' style={{fontSize:16, paddingHorizontal:2}}/>
                    </Button>
                    <Text note style={styles.optionPanelItemLabel}>Respuestas rápidas</Text>
                  </View>
                  <View style={styles.optionsPanelItemContainer}>
                    <Button info rounded style={styles.optionPanelItemButton}
                            onPress={() => this.openPicker()}>
                      <Icon type='FontAwesome' name='image' style={{fontSize:16}}/>
                    </Button>
                    <Text note style={styles.optionPanelItemLabel}>Galería</Text>
                  </View>
                  <View style={styles.optionsPanelItemContainer}>
                    <Button info rounded style={styles.optionPanelItemButton}
                            onPress={() => this.openLocation()}>
                      <Icon type='MaterialIcons' name='location-on' style={{fontSize:16}} />
                    </Button>
                    <Text note style={styles.optionPanelItemLabel}>Ubicación</Text>
                  </View>
                </View>
              </CardItem>
            </Card>
          </View>}
        <Modal visible={this.state.isVisibleModal} animated>
          <Header>
            <Body>
              {this.state.visibleButtonSendSelectImg ?
                <Title>Máximo 5 imágenes</Title>
              : null}
            </Body>
            <Right>
              <Button transparent onPress={() => this.setState({isVisibleModal:false, visibleButtonSendSelectImg:false, img1:'', img2:'', img3:'', img4:'', img5:'', urlImageZoom:''})}>
                <Icon name='close' />
              </Button>
            </Right>
          </Header>
          <ReactNativeZoomableView
            maxZoom={1.5}
            minZoom={0.5}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            captureEvent={true}
          >
            {this.state.visibleButtonSendSelectImg && this.state.urlImageZoom == "" ?
              <Container>
                <Content>
                  <Card transparent>
                    <CardItem>
                      <Left>
                        <Image style={{flex:1, width:160, height:160}} resizeMode="contain" source={{uri:this.state.img1}} />
                      </Left>
                      <Right>
                        <Image style={{flex:1, width:160, height:160}} resizeMode="contain" source={{uri:this.state.img2}} />
                      </Right>
                    </CardItem>
                    <CardItem>
                      <Left>
                        <Image style={{flex:1, width:160, height:160}} resizeMode="contain" source={{uri:this.state.img3}} />
                      </Left>
                      <Right>
                        <Image style={{flex:1, width:160, height:160}} resizeMode="contain" source={{uri:this.state.img4}} />
                      </Right>
                    </CardItem>
                    <CardItem>
                      <Left>
                        <Image style={{flex:1, width:160, height:160}} resizeMode="contain" source={{uri:this.state.img5}} />
                      </Left>
                    </CardItem>
                  </Card>
                </Content>
              </Container>
            :
            <View style={{flex:1}}>
              <Image style={{width:null, height:'80%'}} resizeMode="contain" source={{uri:this.state.urlImageZoom}} />
              {this.state.loadImageCamera ?
                <Spinner color='#34aae1' />
              :null}
            </View>
            }
          </ReactNativeZoomableView>
          {this.state.visibleButtonSendSelectImg ?
            <Button full style={[styles.enter,{marginHorizontal:10}]}  onPress={() => this.sendSelectImg()} disabled={this.state.sendButtonImgCamera} ><Text>Enviar</Text></Button>
          : null}
        </Modal>
        <Modal visible={this.state.isVisibleModalEditCustomer} animated>
          <Header>
            <Body>
              <Title>Detalles</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => this.setState({isVisibleModalEditCustomer:false})}>
                <Icon name='close' />
              </Button>
            </Right>
          </Header>
          <EditCustomer data={this.props.route.params.data} setData={this.setData}/>
        </Modal>
        <Modal visible={this.state.isVisibleModalTemplatesCustomer} animated>
          <Header>
            <Body>
              <Title>Plantillas</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => this.setState({isVisibleModalTemplatesCustomer:false})}>
                <Icon name='close' />
              </Button>
            </Right>
          </Header>
          <TemplatesCustomer setSendMessageTemplate={this.onPressSendMessage} />
        </Modal>
        <QuickReplyPickerModal visible={this.state.shouldShowQuickResponsePickerModal}
                               onClose={() => this.setState({shouldShowQuickResponsePickerModal: false})}
                               onPress={(quickReply) => this.setQuickReply(quickReply)}
        />
        <LocationModal
          visible={this.state.locationModal}
          onClose={() => this.setState({locationModal: false})}
          onPress={() => this.setLocation({latitude:this.state.latitude,longitude:this.state.longitude})}
          latitude={this.state.latitude}
          longitude={this.state.longitude}
        />
        <AgentSelectionPicker
          assignedAgentId={this.state.assignedAgentId}
          agentsList={[{id: '', first_name: 'No', last_name: 'asignado'}].concat(this.props.route.params.data.agentsList)}
          visible={this.state.shouldShowAgentAssignationPickerModal}
          onClose={() => {this.setState({shouldShowAgentAssignationPickerModal: false})}}
          onPress={(agentId) => {this.assignAgent(agentId)}}/>
      </View>
    )
  }
}
