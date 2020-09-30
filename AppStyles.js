import {StyleSheet} from 'react-native'

module.exports = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    color: '#fff',
    textTransform: 'uppercase'
  },
  cardChatSelect: {
    marginHorizontal: 10,
    marginVertical: 5,
    marginTop: 10,
    padding:5
  },
  separator: {
    borderBottomWidth:1,
    borderColor:'#34aae1'
  },
  ///////////////////////////////// Style Chat /////////////////////////////////
  containerChat: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  chatMain: {
    flex:1,
    marginHorizontal:10,
    flexDirection:'column',
    justifyContent:'flex-end'
  },
  balloon: {
    maxWidth: '80%',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 3,
    minWidth: '45%'
  },
  headerMessage: {
    fontSize:16,
    paddingBottom:3
  },
  chatText: {
    fontSize: 14,
    marginRight: 10
  },
  chatCaption: {
    fontSize: 14,
    marginRight: 10,
    marginTop: 8
  },
  footerMessage: {
    flexDirection:'row',
    justifyContent:'flex-end',
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent"
  },
  selectUpdateCustomer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputMessage: {
    flex:1,
    backgroundColor: '#FFF',
    borderColor: '#FFF',
    marginHorizontal:5,
    marginLeft:10,
    marginVertical:5,
    color:"#514E5A",
    fontSize:16,
    paddingHorizontal:5,
    flexDirection: 'column'
  },
  inputMessageButton: {
    marginHorizontal:10,
    marginVertical:5,
    backgroundColor:"#34aae1",
    borderRadius:5,
    color:"#514E5A"
  },
  optionsPanelContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  optionsPanelItemContainer: {
    flex: 0.5,
    flexDirection: 'column'
  },
  optionPanelItemButton: {
    alignSelf: 'center'
  },
  optionPanelItemLabel: {
    alignSelf: 'center'
  },
  /////////////////////////////// Style Chat End ///////////////////////////////

  //////////////////////////// Style Edit CUstomer  ////////////////////////////
  optionNationalIdType: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop: 20
  },
  optionListTags: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop: 10,
    backgroundColor:'#ececec',
    borderRadius:3,
  },
  ////////////////////////// Style Edit CUstomer End  //////////////////////////

  // ////////////////////////// Style Quick Replies  ////////////////////////////
  spinner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noRepliesMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16
  },
  itemContainer: {
    paddingTop: 0,
    paddingBottom: 0
  },
  itemCard: {
    flex: 1
  },
  itemResponseLabel: {
    fontWeight: 'bold'
  },
  itemImage: {
    height: 200,
    width: 'auto',
    flex: 1
  },
  headerTitle: {
    flex: 5
  },
  headerCloseButton: {
    flex: 1
  },
  previewImage: {
    width: 0,
    aspectRatio: 1,
    height: 150,
    borderRadius: 10
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    width: 40,
    height: 40,
    position: 'absolute'
  }
  // ////////////////////////// Style Quick Replies End  ////////////////////////////
});
