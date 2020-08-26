import {StyleSheet} from 'react-native'

module.exports = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    justifyContent: 'center'
  },
  containerLogin: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  containerContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginVertical: 20
  },
  header: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#514E5A",
  },
  descriptionText: {
    fontSize: 14,
    color: "#514E5A"
  },
  input: {
    height: 44,
    borderBottomWidth: 1.5,
    borderColor: "#ececec",
    color: "#514E5A",
    fontWeight: "600"
  },
  enter: {
    marginVertical: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row'
  },
  texButton: {
    textTransform: "capitalize",
    fontWeight: 'bold',
    fontSize: 16
  },
  cardChatSelect: {
    marginHorizontal: 10,
    marginVertical: 5,
    marginTop: 10,
    padding:5,
    borderRadius: 10 / 2,
    backgroundColor: "#FFF",
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ///////////////////////////////// Style Chat /////////////////////////////////
  containerChat: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  chatMain: {
    flex:1,
    marginHorizontal:10,
    flexDirection:'column',
    justifyContent:'flex-end'
  },
  chatContainer: {
    marginVertical:5,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  chatText: {
    padding:10,
    fontSize:16,
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    width:'75%'
  },
  footerMessage: {
    flexDirection:'row',
    width:'75%',
    padding:10,
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent"
  },
  inputMesage: {
    flex:1,
    fontSize: 20,
    fontWeight: "600",    
    marginHorizontal:10,
    marginVertical:5,
    backgroundColor:"#34aae1",
    borderRadius:20,
    paddingHorizontal:20,
    paddingVertical:8,
    color:"#514E5A"
  },
  /////////////////////////////// Style Chat End ///////////////////////////////

  //////////////////////////// Style Edit CUstomer  ////////////////////////////
  optionNationalIdType: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop: 20
  }
  ////////////////////////// Style Edit CUstomer End  //////////////////////////
});
