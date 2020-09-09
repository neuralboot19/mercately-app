import React, { Component } from 'react';
import { View, ScrollView, Alert, FlatList, TextInput, Modal } from 'react-native';
import { Container, Header, Content, Body, ListItem, Text, Title, Button, Right, Icon } from 'native-base';

// Globals
import * as globals from '../util/globals';

// Api
import { API } from '../util/api';

// Style
const styles = require('../../AppStyles');

export default class Templates extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      templates:[],
      modalEdited: false,
      isTemplateSelected: false,
      templateEdited: true,
      auxTemplateSelected: [],
      templateSelected: '',
      getText: ''
    };
  }

  componentDidMount() {
    API.whatsAppTemplates(this.whatsAppTemplatesResponse,{},1,true)
  }

  whatsAppTemplatesResponse = {
    success: (response) => {
      try {
        this.setState({templates:response.templates})
      } catch (error) {
        alert("RESPONSE AQUI ERROR")
        console.log('LOGIN RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('LOGIN RESPONSE ERR',err)
      Alert.alert(globals.APP_NAME,err.message,[{text:'OK'}]);
    }
  }

  renderItem = (item) =>{
    let template = item.item
    return(
      <ListItem onPress={() => this.selectTemplate(template)}>
        <Text>{template.text}</Text>
      </ListItem>
    )
  }

  selectTemplate = (template) => {
    this.setState({
      isTemplateSelected: true,
      templateSelected: template.text,
      auxTemplateSelected: template.text.split(/[(\s)(\.)]/g),
      modalEdited: true
    });
  }

  getTextInput = () => {
    let new_array = this.state.templateSelected.split(/[(\s)(\.)]/g)
    return new_array.map((key, index) => {
      if (key == '*'){
        return <TextInput style={styles.input} onChangeText={(e) => this.changeTemplateSelected(e, index)} value={this.state.auxTemplateSelected[index] === '*' ? '' : this.state.auxTemplateSelected[index]} keyboardType="default" />;
      } else {
        return <Text style={{marginTop:5}}>{key}</Text>
      }
    })
  }

  changeTemplateSelected = (e, id) => {
    this.state.templateSelected.split(/[(\s)(\.)]/g).map((key, index) => {
      if (key == '*'){
        if (index == id && e && e !== '') {
          this.state.auxTemplateSelected[index] = e;
        } else if (index == id && (!e || e === '')) {
          this.state.auxTemplateSelected[index] = '*';
        }
      }
    })

    this.setState({
      templateEdited: false
    });
  }

  getTextInputEdited = () => {
    let new_array = this.state.templateSelected.split(/[(\s)(\.)]/g)
    return new_array.map((key, index) => {
      if (key == '*'){
        return <TextInput style={styles.input} onChangeText={(e) => this.changeTemplateSelected(e, index)} value="" keyboardType="default" />;
      } else {
        return <Text style={{marginTop:5}}>{key}</Text>
      }
    })
  }

  onPressSendTemplate = () => {
    let textFull = this.state.auxTemplateSelected.join(' ')
    let validated = false
    let new_array = textFull.split(/[(\s)(\.)]/g).map((key, index) => {
      if (key.length == 1){
        validated = true
      }
    })
    if (validated) {
      alert("Debe completar los datos")
    } else {
      Alert.alert('Detalle',textFull,[
        {text:'Cancelar'},{text:'Enviar', onPress: () => this.setSend(textFull)}
      ]);
    }
  }

  setSend = (textFull) => {
    const {setSendMessageTemplate} = this.props
    setSendMessageTemplate(textFull)
  }

  render() {
    let screen = this.state.templateEdited ? this.getTextInputEdited() : this.getTextInput()
    return (
      <Container>
        <Content>
          <ScrollView bounces={false}>
            <FlatList
              data = {this.state.templates}
              renderItem = {this.renderItem}
              keyExtractor={(item)=>item.id.toString()}
            />
          </ScrollView>
        </Content>
        {this.state.modalEdited && (
          <Modal visible={this.state.modalEdited}>
            <View style={[styles.containerChat,{marginTop:0}]}>
              <Header>
                <Body>
                  <Title>Edición de Plantilla</Title>
                </Body>
                <Right>
                  <Button transparent onPress={() => this.setState({modalEdited:false})}>
                    <Icon name='close' />
                  </Button>
                </Right>
              </Header>
              <View style={{marginHorizontal:21, marginTop:13}}>{screen}</View>
              <Button full style={[styles.enter,{marginHorizontal:20}]} onPress={this.onPressSendTemplate}><Text>Enviar</Text></Button>
            </View>
          </Modal>
        )}
      </Container>
    )
  }
}