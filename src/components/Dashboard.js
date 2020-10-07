import React, { Component } from 'react';
import { View, FlatList, TouchableOpacity, DrawerLayoutAndroid, Alert, AsyncStorage, ActivityIndicator } from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, Badge, Text, Subtitle } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Moment from 'moment';
import 'moment/locale/es';
import {SOCKET_URL} from '@env';

// Socket io client
import io from 'socket.io-client';

// Globals
import * as globals from '../util/globals';

// Api
import { API } from '../util/api';

// Style
const styles = require('../../AppStyles');

export default class DashboardAdmin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: 'home',
      customersList: [],
      leftElementIcon: 'menu',
      spinner: false,
      isOnRefresh: false,
      page: 1,
      offset: 0,
      new_message_counter: 0,
      setEditCustomerFullName: '',
      setEditCustomerId: 0,
      isVisibleModalFilter: false,
      listTags: [],
      listAgents: [],
      filterListCheckAll: true,
      filterListCheckRead: false,
      filterListCheckUnread: false,
      filterListCheckAllAgent: true,
      filterListCheckNotAssigned: false,
      filterListCheckAllTags: true,
      filterListCheckOrderDesc: true,
      filterListCheckOrderAsc: false,
      order: 'received_desc',
      type: 'all',
      agent: 'all',
      tag: 'all',
      selectedTag: undefined,
      selectedAgent: undefined
    };
    this.signOut = this.signOut.bind(this);
    this.onEndReachedCalledDuringMomentum = true;
    this.socket = io(SOCKET_URL, {jsonp: true});
    this.socket.on('connect', () => {this.socket.emit('create_room', globals.id)});
    this.getReplyChat = this.getReplyChat.bind(this);
    this.socket.on('customer_chat', this.getReplyChat);
  }

  componentDidMount() {
    API.customersList(this.customersListResponse,{},1,0,'received_desc','all','all','all',true);
  }

  onRefresh = () => {
    this.setState({
      isOnRefresh:true,
      customersList:[],
      filterListCheckAll: true,
      filterListCheckRead: false,
      filterListCheckUnread: false,
      filterListCheckAllAgent: true,
      filterListCheckNotAssigned: false,
      filterListCheckAllTags: true,
      filterListCheckOrderDesc: true,
      filterListCheckOrderAsc: false,
      order: 'received_desc',
      type: 'all',
      agent: 'all',
      tag: 'all',
      selectedTag: undefined,
      selectedAgent: undefined})
    API.customersList(this.customersListResponse,{},1,0,'received_desc','all','all','all',true);
  }

  setDataFilter = (dataState) => {
    this.setState({
      customersList:[],
      isVisibleModalFilter:false,
      filterListCheckAll: dataState.filterListCheckAll,
      filterListCheckRead: dataState.filterListCheckRead,
      filterListCheckUnread: dataState.filterListCheckUnread,
      filterListCheckAllAgent: dataState.filterListCheckAllAgent,
      filterListCheckNotAssigned: dataState.filterListCheckNotAssigned,
      filterListCheckAllTags: dataState.filterListCheckAllTags,
      filterListCheckOrderDesc: dataState.filterListCheckOrderDesc,
      filterListCheckOrderAsc: dataState.filterListCheckOrderAsc,
      order: dataState.order,
      type: dataState.type,
      agent: dataState.agent,
      tag: dataState.tag,
      selectedTag: dataState.selectedTag,
      selectedAgent: dataState.selectedAgent
    })
    API.customersList(this.customersListResponse,{},1,0,dataState.order,dataState.type,dataState.agent,dataState.tag,true);
  }

  customersListResponse = {
    success: (response) => {
      this.onEndReachedCalledDuringMomentum = false
      try {
        let newDataCustomers = (response.customers) ? [...this.state.customersList,...response.customers] : this.state.customersList
        let orderCustomers = response.customers.sort((a, b) => a.recent_message_date < b.recent_message_date)
        if(!this.onEndReachedCalledDuringMomentum) {
          this.setState({customersList:newDataCustomers, isOnRefresh:false, listTags:response.filter_tags, listAgents: response.agent_list})
        } else {
          this.setState({customersList:orderCustomers, isOnRefresh:false, listTags:response.filter_tags, listAgents: response.agent_list})
        }
      } catch (error) {
        console.log('LOGIN RESPONSE ERROR',error)
      }
      this.setState({spinner:false, isOnRefresh:false});
    },
    error: (err) => {
      this.setState({spinner: false, isOnRefresh:false})
    }
  }

  handleLoadMore = () => {
    if(!this.onEndReachedCalledDuringMomentum){
      let page = this.state.page
      let offset = this.state.customersList.length
      if(this.state.offset < this.state.customersList.length){
        page += 1
        this.setState({page:page,offset:offset})
      }
      API.customersList(this.customersListResponse,{},page,offset,this.state.order,this.state.type,this.state.agent,this.state.tag,true);
    }
  }

  onMomentumScrollBegin = () =>{
    this.onEndReachedCalledDuringMomentum = false;
  }


  actionSearch(search) {
    this.drawer.closeDrawer();
  }

  signOut = async() =>{
    this.setState({ spinner: true });
    API.signOut(this.signOutResponse,{},true)
  }

  signOutResponse = {
    success: (response) => {
      try {
        AsyncStorage.clear();
        globals.header = null;
        globals.id = null
        globals.type = null
        globals.admin = null
        globals.first_name = null
        globals.last_name = null
        globals.email = null
        globals.retailer_integration = null
        this.drawer.closeDrawer();
        this.setState({leftElementIcon: 'menu', spinner: false, customersList:[]})
        this.props.navigation.navigate('Login');
      } catch (error) {
        AsyncStorage.clear();
        globals.header = null;
        globals.id = null
        globals.type = null
        globals.admin = null
        globals.first_name = null
        globals.last_name = null
        globals.email = null
        globals.retailer_integration = null
        this.setState({spinner: false, customersList:[]});
        Alert.alert('Error',error.message,[{text:'OK'}]);
      }
    },
    error: (err) => {
      AsyncStorage.clear();
      globals.header = null;
      globals.id = null
      globals.type = null
      globals.admin = null
      globals.first_name = null
      globals.last_name = null
      globals.email = null
      globals.retailer_integration = null
      this.setState({spinner: false, isOnRefresh:true, customersList:[]});
      Alert.alert('Error Cierre su App y inicie de nuevo',err.message,[{text:'OK', onPress: () => this.props.navigation.navigate('Login')}]);
    }
  }

  actionElementLeft(event, drawer) {
    switch (event) {
      case 'tool':
        if (drawer == undefined){
          if (this.state.leftElementIcon == 'menu') {
            this.drawer.openDrawer();
            break;
          } else {
            this.drawer.closeDrawer();
            break;
          }
        }
      case 'Settling':
        if (drawer == 'drawer'){
          if (this.state.leftElementIcon == 'menu') {
            this.setState({leftElementIcon: 'close'});
            break;
          } else {
            this.setState({leftElementIcon: 'menu'});
            break;
          }
        }
    }
  }

  onPressChat = (fullName, phone, id, whatsappOptIn, recentMessageDate, assignedAgent) => {
    let data = {id:id, fullName:fullName, phone:phone, whatsapp_opt_in:whatsappOptIn, recent_inbound_message_date:recentMessageDate, assigned_agent:assignedAgent}
    this.props.navigation.navigate('Chat',{data, setDataDashboard:this.setDataDashboard})
  }

  setDataDashboard = (data, id) => {
    this.setState({setEditCustomerFullName:data, setEditCustomerId:id})
  }

  renderItem = (item) =>{
    let customer = item.item
    let fullName = customer.first_name != null ? customer.first_name + ' ' : ''
    fullName += customer.last_name != null ? customer.last_name : ''
    if(fullName == '') {
      fullName = customer.whatsapp_name != null ? customer.whatsapp_name : customer.phone
    }
    fullName = this.state.setEditCustomerId == customer.id ? this.state.setEditCustomerFullName : fullName
    let assignedAgent = customer.assigned_agent.full_name == ' ' ? customer.assigned_agent.email : customer.assigned_agent.full_name
    let rDate = Moment(customer.recent_message_date).local();
    let colorMoment = Moment().local().diff(rDate, 'hours') < 24 ? '#00A652' : '#999'
    let badgeCount = customer.unread_whatsapp_chat == true || customer["unread_whatsapp_message?"] == true
    let iconsName = customer.last_whatsapp_message.status == 'sent' ? 'check' : (customer.last_whatsapp_message.status == 'delivered' ? 'check-all' : ( customer.last_whatsapp_message.status == 'read' ? 'check-all' : 'sync'))
    let iconsColor = customer.last_whatsapp_message.status == 'sent' ? 'black' : (customer.last_whatsapp_message.status == 'delivered' ? 'black' : ( customer.last_whatsapp_message.status == 'read' ? '#34aae1' : 'black'))
    return(
      <TouchableOpacity style={styles.cardChatSelect} key={customer.id} onPress={() => this.onPressChat(fullName, customer.phone, customer.id, customer.whatsapp_opt_in, customer.recent_inbound_message_date, assignedAgent)}>
        <Text style={{fontSize:10, color:colorMoment, textAlign:'right'}}>{Moment(customer.recent_message_date).locale('es').fromNow()}</Text>
        <Title style={{fontWeight:'bold', fontSize:18, color:'#000'}}>{fullName}</Title>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <View style={{flexDirection:'row'}}>
            {customer.last_whatsapp_message.direction == 'outbound' && customer['handle_message_events?'] == true ?
              <View style={{flexDirection:'row', paddingRight:3}}>
                {customer.active_bot ?
                  <MaterialCommunityIcons name="robot" size={15} color="black" style={{marginRight:5}} />
                : null}
                <MaterialCommunityIcons name={iconsName} size={15} color={iconsColor} />
              </View>
            : null}
            <Subtitle style={{color:'#000'}}><Text style={{color:'#999', fontSize:12}}>Asignado a </Text><Text style={{color: assignedAgent != '' ? '' : '#34aae1', fontSize:12}}>{assignedAgent != '' ? assignedAgent : 'No asignado'}</Text></Subtitle>
          </View>
          {badgeCount && customer.unread_whatsapp_messages > 0 ?
            <Badge success >
              <Text>{customer.unread_whatsapp_messages >= 100 ? "+99" : customer.unread_whatsapp_messages}</Text>
            </Badge>
          :null}
        </View>
        <View style={{flexDirection:'row', alignItems:'flex-end', justifyContent:'flex-end', marginTop:10}}>
          {customer.tags.map( t =>
            <Text style={{fontSize:10, backgroundColor:'#d5ecfd',padding:3, paddingHorizontal:6, marginLeft:5, borderRadius:3/2}}>{t.tag}</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  ListEmptyComponent = () => {
    return(
      <View style={styles.container}>
        <View style={{marginHorizontal: 17}}>
          <Text style={styles.header}>{globals.first_name + " " + globals.last_name}</Text>
          <Text style={styles.descriptionText}>No tienes chat por el momento.</Text>
        </View>
      </View>
    )
  }

  ItemSeparatorComponent = () =>{
    return(
      <View style={styles.separator} />
    )
  }

  getReplyChat = (data) => {
    let customer = data.customer.customer;
    let customerState = this.state.customersList;
    let index = this.findCustomerInArray(customerState, customer.id);
    let customersList = customerState;

    if (index != -1 && data.remove_only) {
      customersList = this.removeFromArray(customersList, index);
    }

    if (!data.remove_only) {
      console.log("NicGroup");
      customersList = this.insertCustomer(customersList, customer, index);
    }

    this.setState({
      customersList: customersList
    });
  }

  findCustomerInArray = (arr, id) => (
    arr.findIndex((el) => (
      el.id == id
    ))
  )

  removeFromArray = (arr, index) => {
    arr.splice(index, 1);
    return arr
  }

  insertCustomer = (customersList, customer, index) => {
    if (index < 0) {
      if (customersList.length == 0) {
        customersList.unshift(customer);
        return customersList;
      }
      if (customersList[customersList.length - 1].recent_message_date < customer.recent_message_date) {
        let position = this.findInsertPosition(customersList, customer.recent_message_date);

        if (position != -1) {
          customersList.splice(position, 0, customer);
        }
      }
    } else {
      if (customersList[index].recent_message_date != customer.recent_message_date) {
        customersList = this.removeFromArray(customersList, index);
        customersList.unshift(customer);
      } else {
        customersList[index] = customer;
      }
    }
    return customersList;
  }

  findInsertPosition = (arr, date) => (
    arr.findIndex((el) => (
      Moment(el.recent_message_date) <= Moment(date)
    ))
  )

  render() {
    let DrawerContent = (
      <View style={styles.containerContent}>
        <View style={{alignItems:'center'}}>
          <Text style={{fontWeight:'bold'}}>{globals.first_name + " " + globals.last_name}</Text>
          <Text style={{color:'#514E5A'}}>{globals.email}</Text>
        </View>
        {this.state.spinner ? (
          <View style={[styles.enter,{marginVertical:0}]}>
            <ActivityIndicator size="small" color="#34aae1" />
          </View>
        ) : (
          <Button iconLeft dark full transparent onPress={() => this.signOut()}>
            <Icon name='cog' />
            <Text>Cerrar Sesión</Text>
          </Button>
        )}
      </View>
    );
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.actionElementLeft('tool')}>
              <Icon name={this.state.leftElementIcon} />
            </Button>
          </Left>
          <Body>
            <Title>Chats</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('Filter',{setDataFilter:this.setDataFilter, listTags:this.state.listTags, listAgents:this.state.listAgents, dataState:this.state})} >
              <Icon name='filter' type='MaterialCommunityIcons' />
            </Button>
          </Right>
        </Header>
        <DrawerLayoutAndroid
          ref={_drawer => (this.drawer = _drawer)}
          drawerWidth={250}
          renderNavigationView={() => DrawerContent }
          onDrawerStateChanged={(int) => this.actionElementLeft(int,'drawer')}
        >
          <FlatList
            data = {this.state.customersList}
            renderItem = {this.renderItem}
            keyExtractor={(item)=>item.id.toString()}
            ListEmptyComponent={this.ListEmptyComponent}
            ItemSeparatorComponent={this.ItemSeparatorComponent}
            refreshing={this.state.isOnRefresh}
            onRefresh={this.onRefresh}
            onEndReached={this.handleLoadMore}
            onEndReachedThreshold={0.1}
            onMomentumScrollBegin={this.onMomentumScrollBegin}
          />
        </DrawerLayoutAndroid>
      </Container>
    );
  }
}
