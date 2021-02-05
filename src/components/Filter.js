import React, { Component } from 'react';
import { Container, Content, Header, Body, Icon, Text, ListItem, Left, Right, CheckBox, Button, Title } from 'native-base';
import { Picker } from '@react-native-picker/picker';

// Style
const styles = require('../../AppStyles');

export default class Filter extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      filterListCheckAll: this.props.route.params.dataState.filterListCheckAll,
      filterListCheckRead: this.props.route.params.dataState.filterListCheckRead,
      filterListCheckUnread: this.props.route.params.dataState.filterListCheckUnread,
      filterListCheckAllAgent: this.props.route.params.dataState.filterListCheckAllAgent,
      filterListCheckNotAssigned: this.props.route.params.dataState.filterListCheckNotAssigned,
      filterListCheckAllTags: this.props.route.params.dataState.filterListCheckAllTags,
      filterListCheckOrderDesc: this.props.route.params.dataState.filterListCheckOrderDesc,
      filterListCheckOrderAsc: this.props.route.params.dataState.filterListCheckOrderAsc,
      order: this.props.route.params.dataState.order,
      type: this.props.route.params.dataState.type,
      agent: this.props.route.params.dataState.agent,
      tag: this.props.route.params.dataState.tag,
      listTags: this.props.route.params.dataState.listTags,
      selectedTag: this.props.route.params.dataState.selectedTag,
      listAgents: this.props.route.params.dataState.listAgents,
      selectedAgent: this.props.route.params.dataState.selectedAgent
    };
  }

  pickerItemAgent = () => {
    let newDate = this.state.listAgents.map((d)=>d)
    newDate.push({id:'all',email:"Seleccionar"})
    newDate.sort((a, b) => a < b)
    let item = newDate.map(a =>
      <Picker.Item label={a.email} value={a.id} />
    )
    return item
  }

  onValueChangeAgents(value) {
    if (value == 'all'){
      this.setState({filterListCheckAllAgent:true, filterListCheckNotAssigned:false, agent:value, selectedAgent:value})
    } else {
      this.setState({filterListCheckAllAgent:false, filterListCheckNotAssigned:false, agent:value, selectedAgent:value})
    }
  }

  pickerItemTags = () => {
    let newDate = this.state.listTags.map((d)=>d)
    newDate.push({id:'all',tag:'Seleccionar'})
    newDate.sort((a, b) => a < b)
    let item = newDate.map(t =>
      <Picker.Item label={t.tag} value={t.id} />
    )
    return item
  }

  onValueChangeTags(value) {
    if (value == 'all'){
      this.setState({filterListCheckAllTags:true, tag:value, selectedTag:value})
    } else {
      this.setState({filterListCheckAllTags:false, tag:value, selectedTag:value})
    }
  }

  onPressFilterList(value){
    switch (value) {
      case 1:
        this.setState({filterListCheckAll:true, filterListCheckRead:false, filterListCheckUnread:false, type:'all'})
        break;
      case 2:
        this.setState({filterListCheckAll:false, filterListCheckRead:true, filterListCheckUnread:false, type:'read'})
        break;
      case 3:
        this.setState({filterListCheckAll:false, filterListCheckRead:false, filterListCheckUnread:true, type:'no_read'})
        break;
      case 4:
        this.setState({filterListCheckAllAgent:true, filterListCheckNotAssigned:false, agent:'all', selectedAgent:'all'})
        break;
      case 5:
        this.setState({filterListCheckAllAgent:false, filterListCheckNotAssigned:true, agent:'not_assigned', selectedAgent:'all'})
        break;
      case 6:
        this.setState({filterListCheckAllTags:true, tag:'all', selectedTag:'all'})
        break;
      case 7:
        this.setState({filterListCheckOrderDesc:true, filterListCheckOrderAsc:false, order:'received_desc'})
        break;
      case 8:
        this.setState({filterListCheckOrderDesc:false, filterListCheckOrderAsc:true, order:'received_asc'})
        break;
    }
  }

  applyFilter = () => {
    const {setDataFilter} = this.props.route.params
    setDataFilter(this.state)
    this.props.navigation.goBack()
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent >
              <Icon name='filter' type='MaterialCommunityIcons' />
            </Button>
          </Left>
          <Body>
            <Title>Filtros</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name='close' />
            </Button>
          </Right>
        </Header>
        <Content>
          <ListItem itemDivider>
            <Text>Filtrar por</Text>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#FF9501" }}>
                <Icon active name="people" />
              </Button>
            </Left>
            <Body>
              <Text>Todos</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckAll} onPress={() => this.onPressFilterList(1)} />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name='account-multiple-check' type='MaterialCommunityIcons' />
              </Button>
            </Left>
            <Body>
              <Text>Leídos</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckRead} onPress={() => this.onPressFilterList(2)} />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name='account-check-outline' type='MaterialCommunityIcons' />
              </Button>
            </Left>
            <Body>
              <Text>No leídos</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckUnread} onPress={() => this.onPressFilterList(3)} />
            </Right>
          </ListItem>
          <ListItem itemDivider>
            <Text>Agente</Text>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#FF9501" }}>
                <Icon active name="people" />
              </Button>
            </Left>
            <Body>
              <Text>Todos</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckAllAgent} onPress={() => this.onPressFilterList(4)} />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name='assignment-turned-in' type='MaterialIcons' />
              </Button>
            </Left>
            <Body>
              <Text>No asignados</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckNotAssigned} onPress={() => this.onPressFilterList(5)} />
            </Right>
          </ListItem>
          <ListItem icon >
            <Left>
              <Button>
                <Icon active name='people-outline' type='MaterialIcons' />
              </Button>
            </Left>
            <Body>
              <Picker
                mode="dropdown"
                style={{ width: undefined }}
                selectedValue={this.state.selectedAgent}
                onValueChange={this.onValueChangeAgents.bind(this)}
              >
                {this.pickerItemAgent()}
              </Picker>
            </Body>
          </ListItem>
          <ListItem itemDivider>
            <Text>Etiquetas</Text>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#FF9501" }}>
                <Icon active name='tags' type='AntDesign' />
              </Button>
            </Left>
            <Body>
              <Text>Todas</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckAllTags} onPress={() => this.onPressFilterList(6)} />
            </Right>
          </ListItem>
          <ListItem icon >
            <Left>
              <Button style={{ backgroundColor: "#FF9501" }}>
                <Icon active name='tagso' type='AntDesign' />
              </Button>
            </Left>
            <Body>
              <Picker
                mode="dropdown"
                placeholder="Seleccionar"
                placeholderStyle={{ color: "#bfc6ea" }}
                placeholderIconColor="#007aff"
                style={{ width: undefined }}
                selectedValue={this.state.selectedTag}
                onValueChange={this.onValueChangeTags.bind(this)}
              >
                {this.pickerItemTags()}
              </Picker>
            </Body>
          </ListItem>
          <ListItem itemDivider>
            <Text>Ordernar por</Text>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button>
                <Icon active name='sort-descending' type='MaterialCommunityIcons' />
              </Button>
            </Left>
            <Body>
              <Text>Reciente - Antíguo</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckOrderDesc} onPress={() => this.onPressFilterList(7)} />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button>
                <Icon active name='sort-ascending' type='MaterialCommunityIcons' />
              </Button>
            </Left>
            <Body>
              <Text>Antíguo - Reciente</Text>
            </Body>
            <Right>
              <CheckBox checked={this.state.filterListCheckOrderAsc} onPress={() => this.onPressFilterList(8)} />
            </Right>
          </ListItem>
        </Content>
        <Button full style={[styles.enter,{marginHorizontal:10}]}  onPress={() => this.applyFilter()}><Text>Listo</Text></Button>
      </Container>
    );
  }
}