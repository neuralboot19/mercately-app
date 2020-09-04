// React
import React, { useState, useEffect, useRef } from 'react';
import {AsyncStorage, View, ActivityIndicator} from 'react-native';

// Globals
import * as globals from './src/util/globals';

// Navigator
import Routes from './src/navigator/Routes';

// Notification Push
import {
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
  setForegroundNotificationHandler,
} from './src/services/PushNotification'

// Material UI to React Native
import { COLOR, ThemeContext, getTheme } from 'react-native-material-ui'
import { API } from './src/util/api'
import { NavigationContainer } from '@react-navigation/native'

const uiTheme = {
  palette: {
    primaryColor: "#782e79",
    accentColor: COLOR.blue500,
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};

setForegroundNotificationHandler()

export default function App () {

  const navigationRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isLogin, setIsLogin] = useState(false)

  const initAsyncStorageVariables = async () => {
    await registerForPushNotificationsAsync()
    const item = await AsyncStorage.getItem('loginData')
    const dataStorage = JSON.parse(item)
    const header = await AsyncStorage.getItem('header')
    const token = await AsyncStorage.getItem('PushNotificationToken')
    if (dataStorage !== null) {
      globals.token = token || ''
      globals.header = JSON.parse(header) || ''
      globals.id = dataStorage.data.attributes.id || ''
      globals.type = dataStorage.type || ''
      globals.admin = dataStorage.data.attributes.admin || ''
      globals.email = dataStorage.data.attributes.email || ''
      globals.first_name = dataStorage.data.attributes.first_name || ''
      globals.last_name = dataStorage.data.attributes.last_name || ''
      globals.retailer_integration = dataStorage.data.attributes.retailer_integration || ''
      setIsLogin(true)
      setIsReady(true)
    } else {
      globals.token = token || ''
      setIsReady(true)
    }
  }

  useEffect(() => {
      addNotificationResponseReceivedListener(_handleNotification)
      initAsyncStorageVariables()
    }
    , [])

  const _handleNotification = async notification => {
    await initAsyncStorageVariables()
    API.customer(onGetCustomer, {},
      notification.notification.request.content.data.customer_id, true)
  }

  const getCustomerFullName = (customer) => {
    let customerFullName = customer.first_name != null
      ? customer.first_name + ' '
      : ''
    customerFullName += customer.last_name != null ? customer.last_name : ''
    if (customerFullName === '') {
      customerFullName = customer.whatsapp_name != null
        ? customer.whatsapp_name
        : customer.phone
    }
    return customerFullName
  }

  const onGetCustomer = {
    success: (response) => {
      try {
        const customer = response.customer
        let data = {
          id: customer.id,
          fullName: getCustomerFullName(customer),
          phone: customer.phone,
          whatsapp_opt_in: customer.whatsapp_opt_in,
        }
        navigationRef.current.navigate('Chat', { data })
      } catch (error) {
        console.log('Error getting customer, staying at current route', error)
      }
    },
    error: (err) => {
      console.log('Error getting customer, staying at current route', err)
    },
  }

  if (!isReady) {
    return (
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#34aae1" />
      </View>
    )
  }
  return (
    <ThemeContext.Provider value={getTheme(uiTheme)}>
      <NavigationContainer ref={navigationRef}>
        <Routes isLogin={isLogin}/>
      </NavigationContainer>
    </ThemeContext.Provider>
  )
}