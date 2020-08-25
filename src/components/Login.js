import React from 'react';
import {View,Text,Alert,TextInput,Keyboard,ActivityIndicator,AsyncStorage,KeyboardAvoidingView,Image} from 'react-native';
import { Button } from 'react-native-material-ui';
import { API } from '../util/api';

// Globals
import * as globals from '../util/globals';

// Style
const styles = require('../../AppStyles');

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'bjohnmer@gmail.com',
      password: 'test1234',
      spinner: false,
    };
  }

  login = async() =>{
    if (this.state.email == '') {
      Alert.alert('User o Email','No puede estar vacío',[{text:'OK'}]);
    } else if (this.state.password == '') {
      Alert.alert('Password','No puede estar vacío',[{text:'OK'}]);
    } else {
      AsyncStorage.getItem('PushNotificationToken').then((token) =>{
        let data = {
          "retailer_user": {
            "email": this.state.email,
            "password": this.state.password,
            "mobile_push_token": globals.token || token
          }
        }
        this.setState({ spinner: true });
        API.login(this.loginResponse,data,true);
      })
    }
  }

  loginResponse = {
    success: (response, header) => {
      try {
        console.log("JSON.stringify(response)JSON.stringify(response)",JSON.stringify(response))
        AsyncStorage.multiSet([['header', JSON.stringify(header)],['loginData', JSON.stringify(response)]],()=>{
          globals.header = header || '';
          globals.id = response.data.attributes.id || '';
          globals.type = response.data.type || '';
          globals.admin = response.data.attributes.admin || '';
          globals.email = response.data.attributes.email || '';
          globals.first_name = response.data.attributes.first_name || '';
          globals.last_name = response.data.attributes.last_name || '';
          globals.retailer_integration = response.data.attributes.retailer_integration || '';
          this.props.navigation.navigate('Dashboard');
        })
      } catch (error) {
        console.log('ERROR LOGIN RESPONSE',error)
      }
      this.setState({ spinner: false });
    },
    error: (err) => {
      Alert.alert('Error de validación',err.message,[{text:'OK'}]);
      this.setState({spinner: false})
    }
  }

  setFocus = (textField) =>{
    this[textField].focus()
  }
  
  render(){
    return (
      <View style={styles.containerLogin}>
        <KeyboardAvoidingView behavior="padding" enabled style={{marginHorizontal: 25}}>
          <Image source={require('../../assets/logo.png')} style={{width: 350, height: 100}} />
          <Text style={styles.header}>Iniciar Sesión</Text>
          <Text style={{marginTop: 20, color:'red'}}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType={"next"}
            onSubmitEditing={() => this.setFocus("passwordInput")}
          />
          <Text style={{marginTop: 20, color:'red'}}>Password</Text>
          <TextInput
            ref={ref => (this.passwordInput = ref)}
            style={styles.input}
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
            secureTextEntry={true}
            autoCapitalize="none"
            returnKeyType={"done"}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <View style={{marginTop: 20}}>
            {this.state.spinner == true ? (
              <View style={styles.enter}>
                <ActivityIndicator size="small" color="#34aae1" />
              </View>
            ):(
              <Button style={{container: styles.enter, text: styles.texButton}} raised primary upperCase text="Ingresar" onPress={this.login} />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
