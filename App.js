// React
import React from 'react';
import { AsyncStorage } from 'react-native';

// Globals
import * as globals from './src/util/globals';

// Navigator
import Routes from './src/navigator/Routes';

// Notification Push
import registerForPushNotificationsAsync from './src/services/PushNotification';

// Material UI to React Native
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui';
const uiTheme = {
  palette: {
    primaryColor: "#34aae1",
    accentColor: COLOR.blue500,
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};

export default class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false
    };
  }

  componentDidMount() {
    registerForPushNotificationsAsync();
    AsyncStorage.getItem('loginData').then((item, ) =>{
      const dataStorage = JSON.parse(item)
      AsyncStorage.getItem('header').then((header) =>{
        AsyncStorage.getItem('PushNotificationToken').then((token) =>{
          if(dataStorage !== null){
            globals.token = token || '';
            globals.header = JSON.parse(header) || '';
            globals.id = dataStorage.data.attributes.id || '';
            globals.type = dataStorage.type || '';
            globals.admin = dataStorage.data.attributes.admin || '';
            globals.email = dataStorage.data.attributes.email || '';
            globals.first_name = dataStorage.data.attributes.first_name || '';
            globals.last_name = dataStorage.data.attributes.last_name || '';
            this.setState({isLogin: true})
          }else{
            globals.token = token || '';
            console.log("ALERTA ALERTA ========= AsyncStorage.getItem is NULL ========= ALERTA ALERTA")
            this.setState({isLogin: false})
          }
        })
      })
    })
  }

  render() {
    return (
      <ThemeContext.Provider value={getTheme(uiTheme)}>
        <Routes isLogin={this.state.isLogin} />
      </ThemeContext.Provider>
    );
  }
}