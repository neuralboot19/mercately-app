import React from 'react';
import { View, Text, TextInput, Keyboard, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-material-ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Api
import { API } from '../util/api';

// Style
const styles = require('../../AppStyles');

export default class EditCustomer extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      firstName: null,
      lastName: null,
      email: null,
      nationalId: null,
      address: null,
      city: "",
      province: "",
      notes: "",
      idType: 0,
      placeholderNationalId: "9999999999",
    };
  }

  componentDidMount() {
    API.customer(this.customerResponse,{},this.props.data.id,true);
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
          province: response.customer.state,
          notes: response.customer.notes,
          placeholderNationalId: placeholderNationalId
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
    if (this.state.firstName == null || this.state.firstName == "") {
      alert("Agrege al menos un nombre")
      return false;
    } else if (this.state.lastName == null || this.state.lastName == "") {
      alert("Agrege al menos un apellido")
      return false;
    } else if (this.validateEmail(this.state.email) == false) {
      alert('El correo ingresado no es válido')
      return false;
    } else if (this.validateNationalId(this.state.nationalId) == false) {
      alert('El número de IDENTIDAD debe tener entre 10 ó 13 caracteres')
      return false;
    } else if (this.state.address == null || this.state.address == "" || this.state.address.length <= 3) {
      alert('Ingrese una direccion válida')
      return false;
    } else if (this.state.city == "" || this.state.city.length <= 3) {
      alert('Ingrese una ciudad válida')
      return false;
    } else if (this.state.province == "" || this.state.province.length <= 3) {
      alert('Ingrese Provincia/Estado válido')
      return false;
    }
    return true;
  }

  validateEmail = email => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  validateNationalId = nationalId => {
    if (nationalId == null) {
      return false
    } else if (this.state.nationalId.length != 10 && this.state.nationalId.length != 13 || this.state.nationalId == 0) {
      return false
    }
    return true
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
          <Text style={{marginTop: 20}}>Email</Text>
          <TextInput
            ref={ref => (this.emailInput = ref)}
            style={styles.input}
            placeholder="Ingrese email"
            onChangeText={email => this.setState({ email })}
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
            onSubmitEditing={() => this.setFocus("notesInput")}
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
          <Button style={{container: [styles.enter,{marginHorizontal:10}], text: styles.texButton}} raised primary upperCase text="Actualizar" onPress={() => this.updateDetails()} />
        )}
      </View>
    );
  }
}
