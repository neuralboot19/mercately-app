import React, { Component } from 'react';
import { View, Text, ScrollView, Alert, FlatList, TextInput, Modal } from 'react-native';
import { ListItem, Toolbar, Button } from 'react-native-material-ui';

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
      <ListItem
        divider
        centerElement={{
          primaryText: template.text,
        }}
        onPress={() => this.selectTemplate(template)}
      />
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
      <View style={[styles.containerContent,{marginVertical:0}]}>
        <ScrollView bounces={false}>
          <FlatList
            data = {this.state.templates}
            renderItem = {this.renderItem}
            keyExtractor={(item)=>item.id.toString()}
          />
        </ScrollView>
        {this.state.modalEdited && (
          <Modal visible={this.state.modalEdited}>
            <View style={[styles.containerChat,{marginTop:0}]}>
              <Toolbar
                centerElement="Edición de Plantilla"
                rightElement="close"
                onRightElementPress={() => this.setState({modalEdited:false})}
              />
              <View style={{marginHorizontal:21, marginTop:13}}>{screen}</View>
              <Button style={{container: [styles.enter,{marginHorizontal:20}], text: styles.texButton}} raised primary upperCase text="Enviar" onPress={this.onPressSendTemplate} />
            </View>
          </Modal>
        )}
      </View>
    )
  }
}