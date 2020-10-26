import React from 'react';
import { View, TextInput, Keyboard, ActivityIndicator, ScrollView, TouchableOpacity, FlatList, Linking } from 'react-native';
import { Button, Text, Picker, Icon } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Api
import { API } from '../util/api';
import { emoji } from '../util/flag_emoji';

// Style
const styles = require('../../AppStyles');

export default class EditCustomer extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      spinnerAddTag: false,
      firstName: null,
      lastName: null,
      email: null,
      nationalId: null,
      address: null,
      city: "",
      countryId: '',
      province: "",
      notes: "",
      idType: 0,
      placeholderNationalId: "9999999999",
      phone: null,
      whatsappName: "",
      customerTags: [],
      listTags: [],
      textAddTag: "",
      selected: undefined
    };
  }

  componentDidMount() {
    API.customer(this.customerResponse,this.props.data.id);
  }

  customerResponse = {
    success: (response) => {
      try {
        let idType = response.customer.id_type == "cedula" || response.customer.id_type == null ? 0 : response.customer.id_type == "pasaporte" ? 1 : response.customer.id_type == "ruc" ? 2 : 0
        let placeholderNationalId = idType == 2 ? "1700000000001" : "9999999999"
        this.setState({
          firstName: response.customer.first_name,
          lastName: response.customer.last_name,
          email: response.customer.email,
          idType: idType,
          nationalId: response.customer.id_number,
          address: response.customer.address,
          city: response.customer.city,
          countryId: response.customer.country_id,
          province: response.customer.state,
          notes: response.customer.notes,
          placeholderNationalId: placeholderNationalId,
          phone: response.customer.phone,
          whatsappName: response.customer.whatsapp_name,
          customerTags: response.customer.tags,
          listTags: response.tags
        })
      } catch (error) {
        console.log('EDITCUSTOMER RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('EDITCUSTOMER RESPONSE ERR',err)
    }
  }

  updateDetails = () => {
    if(this.validateFields()){
      let idType = this.state.idType == 0 || this.state.idType == null ? "cedula" : this.state.idType == 1 ? "pasaporte" : this.state.idType == 2 ? "ruc" : ""
      let data = {
        "first_name": this.state.firstName,
        "last_name": this.state.lastName,
        "email": this.state.email,
        "id_type": idType,
        "id_number": this.state.nationalId,
        "address": this.state.address,
        "city": this.state.city,
        "state": this.state.province,
        "notes": this.state.notes
      }
      this.setState({spinner: true})
      API.customerUpdate(this.customerUpdateResponse,data,this.props.data.id,true);
    }
  }

  customerUpdateResponse = {
    success: (response) => {
      try {
        alert("Datos actualizados con exito")
        this.setData()
        this.setState({spinner: false})
      } catch (error) {
        alert("Error catch update customer")
        this.setState({spinner: false})
        console.log('EDITCUSTOMER RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      alert("Error api update customer")
      this.setState({spinner: false})
      console.log('EDITCUSTOMER RESPONSE ERR',err)
    }
  }

  validateFields = () => {
    if (this.state.email && !this.validateEmail(this.state.email)) {
      alert('El correo ingresado no es válido')
      return false;
    }
    return true;
  }

  validateEmail = email => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  setData = () => {
    let fullName = this.state.firstName != null ? this.state.firstName + ' ' : ''
    fullName += this.state.lastName != null ? this.state.lastName : ''
    if(fullName == '') {
      fullName = this.state.whatsappName != null ? this.state.whatsappName : this.state.phone
    }
    const {setData} = this.props
    setData(fullName)
  }

  selectNationalId = (option) => {
    switch (option) {
      case "national":
        this.setState({idType:0, nationalId:"", placeholderNationalId:"9999999999"})
        break;
      case "pass":
        this.setState({idType:1, nationalId:"", placeholderNationalId:"9999999999"})
        break;
      case "ruc":
        this.setState({idType:2, nationalId:"", placeholderNationalId:"1700000000001"})
        break;
    }
  }

  renderItemCustomerTags = (item) =>{
    let tag = item.item
    return(
      <View style={styles.optionListTags}>
        <Text style={{color:"#34aae1", margin:10}}>{tag.tag}</Text>
        <TouchableOpacity style={{margin:10}} onPress={() => this.removeTag(tag.id)}>
          <MaterialCommunityIcons name="close-circle" size={20} color="grey"/>
        </TouchableOpacity>
      </View>
    )
  }

  removeTag = (id) => {
    let data = {
      "tag_id":id,
      "chat_service":"whatsapp"
    }
    API.customerRemoveTag(this.customerRemoveTagResponse,data,this.props.data.id,true);
  }

  customerRemoveTagResponse = {
    success: (response) => {
      try {
        this.setState({
          customerTags:response.customer.tags,
          listTags:response.tags
        })
      } catch (error) {
        console.log('REMOVE TAG RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('REMOVE TAG RESPONSE ERR',err)
    }
  }

  renderItemListTags = (item) => {
    let tag = item.item
    return(
      <ListItem
        divider
        centerElement={{
          primaryText: tag.tag,
        }}
        onPress={() => this.selectTag(tag)}
      />
    )
  }
  onValueChange(tag){
    console.log("evaluando aquiiiiiiiiii",tag)
    let data = {
      "tag_id":tag,
      "chat_service":"whatsapp"
    }
    API.customerSelectTag(this.customerSelectTagResponse,data,this.props.data.id,true);
  }

  pickerItem = () => {
    let newDate = this.state.listTags.map((d)=>d)
    newDate.push({id:"",tag:"Seleccionar"})
    newDate.sort((a, b) => a < b)
    let item = newDate ? newDate.map(t =>
      <Picker.Item label={t.tag} value={t.id} />
    ) : <Picker.Item label="Agrege una etiqueta" value="" />
    return item
  }

  customerSelectTagResponse = {
    success: (response) => {
      try {
        this.setState({
          customerTags:response.customer.tags,
          listTags:response.tags
        })
      } catch (error) {
        console.log('SELECT TAG RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      console.log('SELECT TAG RESPONSE ERR',err)
    }
  }

  ListEmptyComponent = () => {
    return(
      <Text style={{margin:5}}>Sin etiquetas</Text>
    )
  }

  onPressAddTag = () => {
    if (this.state.textAddTag == "") {
      alert('Debe ingresar primero una etiqueta.')
    } else if (this.state.textAddTag.length < 4) {
      alert('Debe tener al menos 4 caracteres')
    } else {
      let data = {
        "tag":this.state.textAddTag,
        "chat_service":"whatsapp"
      }
      this.setState({spinnerAddTag:true})
      API.customerAddTag(this.customerAddTagResponse,data,this.props.data.id,true);
    }
  }

  customerAddTagResponse = {
    success: (response) => {
      try {
        this.setState({
          customerTags: response.customer.tags,
          textAddTag: "",
          listTags: response.tags,
          spinnerAddTag:false
        })
      } catch (error) {
        this.setState({spinnerAddTag:false})
        console.log('ADD TAG RESPONSE ERROR',error)
      }
    },
    error: (err) => {
      this.setState({spinnerAddTag:false})
      console.log('ADD TAG RESPONSE ERR',err)
    }
  }

  setFocus = (textField) =>{
    this[textField].focus()
  }
  
  render(){
    return (
      <View style={[styles.containerContent,{marginVertical:0}]}>
        <ScrollView bounces={false} style={{marginHorizontal: 15}}>
          <Text style={{marginTop: 20}}>Nombre</Text>
          <TextInput
            ref={ref => (this.firstNameInput = ref)}
            style={styles.input}
            placeholder="Ingrese nombre"
            onChangeText={firstName => this.setState({ firstName })}
            value={this.state.firstName}
            keyboardType="default"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("lastNameInput")}
          />
          <Text style={{marginTop: 20}}>Apellido</Text>
          <TextInput
            ref={ref => (this.lastNameInput = ref)}
            style={styles.input}
            placeholder="Ingrese apellido"
            onChangeText={lastName => this.setState({ lastName })}
            value={this.state.lastName}
            keyboardType="default"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("emailInput")}
          />
          <Text style={{marginTop: 20}}>Teléfono</Text>
          <TouchableOpacity style={[styles.optionNationalIdType,{justifyContent:'flex-start', marginTop:10}]} onPress={() => {Linking.openURL('tel:' + this.state.phone)}} >
            <Text style={{marginTop: 2}}>{emoji(this.state.countryId)} {this.state.phone}</Text>
            <Icon name='call' type='MaterialIcons' style={{fontSize:24}} />
          </TouchableOpacity>
          <Text style={{marginTop: 20}}>Email</Text>
          <TextInput
            ref={ref => (this.emailInput = ref)}
            style={styles.input}
            placeholder="Ingrese email"
            onChangeText={email => this.setState({ email: email.replace(/\s/g, '')  })}
            value={this.state.email}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("nationalIdInput")}
          />
          <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:0}}>
            <Text style={{marginTop: 20}}>Identificación</Text>
            <TouchableOpacity style={styles.optionNationalIdType} onPress={() => this.selectNationalId("national")}>
              <MaterialCommunityIcons name={this.state.idType == 0 ? "check-circle" : "check-circle-outline"} size={20} color={this.state.idType == 0 ? "#34aae1" : "grey" } style={{marginHorizontal:2}}/>
              <Text style={{color:this.state.idType == 0 ? "#34aae1" : "grey"}}>Cedula</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionNationalIdType} onPress={() => this.selectNationalId("pass")}>
              <MaterialCommunityIcons name={this.state.idType == 1 ? "check-circle" : "check-circle-outline"} size={20} color={this.state.idType == 1 ? "#34aae1" : "grey" } style={{marginHorizontal:2}}/>
              <Text style={{color:this.state.idType == 1 ? "#34aae1" : "grey"}}>Pasaporte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionNationalIdType} onPress={() => this.selectNationalId("ruc")}>
              <MaterialCommunityIcons name={this.state.idType == 2 ? "check-circle" : "check-circle-outline"} size={20} color={this.state.idType == 2 ? "#34aae1" : "grey" } style={{marginHorizontal:2}}/>
              <Text style={{color:this.state.idType == 2 ? "#34aae1" : "grey"}}>Ruc</Text>
            </TouchableOpacity>            
          </View>
          <TextInput
            ref={ref => (this.nationalIdInput = ref)}
            style={styles.input}
            placeholder={this.state.placeholderNationalId}
            onChangeText={nationalId => this.setState({ nationalId })}
            value={this.state.nationalId}
            maxLength={this.state.idType == 2 ? 13 : 10}
            keyboardType="numeric"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("addressInput")}
          />
          <Text style={{marginTop: 20}}>Dirección</Text>
          <TextInput
            ref={ref => (this.addressInput = ref)}
            style={styles.input}
            placeholder="Av. / Calle / Edif. / Casa"
            onChangeText={address => this.setState({ address })}
            value={this.state.address}
            keyboardType="default"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("cityInput")}
          />
          <Text style={{marginTop: 20}}>Ciudad</Text>
          <TextInput
            ref={ref => (this.cityInput = ref)}
            style={styles.input}
            placeholder="Ingrese ciudad"
            onChangeText={city => this.setState({ city })}
            value={this.state.city}
            keyboardType="default"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("provinceInput")}
          />
          <Text style={{marginTop: 20}}>Provincia/Estado</Text>
          <TextInput
            ref={ref => (this.provinceInput = ref)}
            style={styles.input}
            placeholder="Ingrese Provincia/Estado"
            onChangeText={province => this.setState({ province })}
            value={this.state.province}
            keyboardType="default"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("textAddTag")}
          />
          <View style={[styles.selectUpdateCustomer,{marginTop: 20}]}>
            <Text>Etiquetas:</Text>
            <Picker
              mode="dropdown"
              iosIcon={<Icon name="arrow-down" />}
              placeholder="Seleccionar"
              placeholderStyle={{ color: "#bfc6ea" }}
              placeholderIconColor="#007aff"
              style={{ width: undefined }}
              selectedValue={this.state.selected}
              onValueChange={this.onValueChange.bind(this)}
            >
              {this.pickerItem()}
            </Picker>
            {this.state.spinnerAddTag == true ? (
              <View style={{marginHorizontal:22}}>
                <ActivityIndicator size="small" color="black" />
              </View>
            ):(
              <Button onPress={this.onPressAddTag}><Text>Agregar</Text></Button>
            )}
          </View>
          <TextInput
            ref={ref => (this.textAddTag = ref)}
            style={styles.input}
            placeholder="Ingrese Etiqueta"
            onChangeText={textAddTag => this.setState({ textAddTag })}
            value={this.state.textAddTag}
            keyboardType="default"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("notesInput")}
          />
          <FlatList 
            data = {this.state.customerTags}
            renderItem = {this.renderItemCustomerTags}
            keyExtractor={(item)=>item.toString()}
            ListEmptyComponent={this.ListEmptyComponent}
          />
          <Text style={{marginTop: 20}}>Nota</Text>
          <TextInput
            ref={ref => (this.notesInput = ref)}
            style={styles.input}
            placeholder="Ingrese nota"
            onChangeText={notes => this.setState({ notes })}
            value={this.state.notes}
            keyboardType="default"
            multiline={true}
            returnKeyType={"done"}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </ScrollView>
        {this.state.spinner == true ? (
          <View style={styles.enter}>
            <ActivityIndicator size="small" color="#34aae1" />
          </View>
        ):(
          <Button full style={[styles.enter,{marginHorizontal:10}]}  onPress={() => this.updateDetails()}><Text>Actualizar</Text></Button>
        )}
      </View>
    );
  }
}
