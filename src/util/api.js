import * as APILIST from './api_url';
import * as globals from './globals';

export const buildHeader = () => {
  if(globals.header == null) {
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
    Object.assign(header);
    return header;
  }else{
    let dataHeader = globals.header
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': dataHeader.map.authorization,
      'email': globals.email,
      'device': dataHeader.map.device,
    }
    Object.assign(header);
    return header;
  }
}

export const API = {
  login: (onResponse, data, isHeaderRequired) => {
    request(onResponse, data, 'POST', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.LOGIN, buildHeader());
  },
  signOut: (onResponse, {}, isHeaderRequired) => {
    request(onResponse, {}, 'DELETE', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.SIGNOUT, buildHeader());
  },
  customer: (onResponse, {}, id, isHeaderRequired) => {
    request(onResponse, {}, 'GET', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMER + id, buildHeader());
  },
  customerUpdate: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'PUT', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMER + id, buildHeader());
  },
  customersList: (onResponse, {}, page, offset, order, type, agent, tag, isHeaderRequired) => {
    request(onResponse, {}, 'GET', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMERSLIST + "?page=" + page + "&offset=" + offset + "&searchString=&order=" + order + "&type=" + type + "&agent=" + agent + "&tag=" + tag, buildHeader());
  },
  customersKarixWhatsappMessages: (onResponse, {}, id, page, isHeaderRequired) => {
    request(onResponse, {}, 'GET', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMERSLIST + "/" + id + "/messages?page=" + page, buildHeader());
  },
  customerAddTag: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMER + id + "/add_tag", buildHeader());
  },
  customerRemoveTag: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'DELETE', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMER + id + "/remove_customer_tag", buildHeader());
  },
  customerSelectTag: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.CUSTOMER + id + "/add_customer_tag", buildHeader());
  },
  sendWhatsAppMessage: (onResponse, data, isHeaderRequired) => {
    request(onResponse, data, 'POST', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.SENDWHATSAPPMESSAGE, buildHeader());
  },
  sendWhatsAppBulkFiles: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.SENDWHATSAPPBULKFILES + "/" + id, buildHeader());
  },
  sendWhatsAppFiles: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.KARIXWHATSAPPSENDFILE + "/" + id, buildHeader());
  },
  whatsAppMessageAsRead: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'PUT', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.WHATSAPPMESSAGEASREAD + "/" + id, buildHeader());
  },
  whatsAppAcceptOptIn: (onResponse, {}, id, isHeaderRequired) => {
    request(onResponse, {}, 'PATCH', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.WHATSAPPACCEPTOPTIN + "/" + id, buildHeader());
  },
  whatsAppTemplates: (onResponse, {}, page, isHeaderRequired) => {
    request(onResponse, {}, 'GET', "JSON", isHeaderRequired, APILIST.BASE_URL + APILIST.WHATSAPPTEMPLATES + "?page=" + page, buildHeader());
  },
  whatsAppQuickReplies: (onResponse) => {
    request(onResponse, {}, 'GET', 'JSON', true, `${APILIST.BASE_URL}${APILIST.WHATSAPP_QUICK_REPLIES}?page=1`, buildHeader());
  }
}

async function request(onResponse, data, type, returnType, isHeaderRequired, featureURL, secureRequest) {
  let response = '';
  console.log("featureURL >>> " + featureURL);
  console.log("secureRequest " + JSON.stringify(secureRequest));
  console.log("data >>> " + JSON.stringify(data));
  console.log("returnType " + returnType);
  console.log("isHeaderRequired " + isHeaderRequired);
  console.log("type " + type);

  try {
    if (type === 'GET') {
      if (isHeaderRequired) {
        response = await fetch(featureURL, {
          method: type,
          headers: secureRequest
        });
      }
      else {
        response = await fetch(featureURL, {
          method: type,
        });
      }
    } else {
      response = await fetch(featureURL, {
        method: type,
        headers: secureRequest,
        body: JSON.stringify(data)
      });
    }
    let responseHEADERS = await response.headers;
    let responseJSON = await response.json();
    if (response.status == 200) {
      onResponse.success(responseJSON, responseHEADERS);
    } else {
      onResponse.error(responseJSON, responseHEADERS);
    }
  } catch (error) {
    console.log("onResponse catch error " + error);
  }
}
