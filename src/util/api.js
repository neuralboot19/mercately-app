import * as APILIST from './api_url';
import * as globals from './globals';
import {BASE_URL} from '@env';

export const buildHeader = () => {
  let header;
  if (globals.header == null) {
    header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  } else {
    let dataHeader = globals.header;
    header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': dataHeader.map.authorization,
      'email': globals.email,
      'device': dataHeader.map.device
    };
  } Object.assign(header); return header;
};

export const API = {
  login: (onResponse, data, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.LOGIN}`, buildHeader());
  },
  signOut: (onResponse, isHeaderRequired) => {
    request(onResponse, {}, 'DELETE', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.SIGNOUT}`, buildHeader());
  },
  customer: (onResponse, id) => {
    request(onResponse, {}, 'GET', 'JSON', true, `${BASE_URL}${APILIST.CUSTOMER}${id}`, buildHeader());
  },
  customerUpdate: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'PUT', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.CUSTOMER}${id}`, buildHeader());
  },
  customersList: (onResponse, page, offset, order, type, agent, tag, search, isHeaderRequired) => {
    request(onResponse, {}, 'GET', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.CUSTOMERSLIST}?page=${page}&offset=${offset}&searchString=${search}&order=${order}&type=${type}&agent=${agent}&tag=${tag}`, buildHeader());
  },
  customersKarixWhatsappMessages: (onResponse, id, page, isHeaderRequired) => {
    request(onResponse, {}, 'GET', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.CUSTOMERSLIST}/${id}/messages?page=${page}`, buildHeader());
  },
  customerAddTag: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.CUSTOMER}${id}/add_tag`, buildHeader());
  },
  customerRemoveTag: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'DELETE', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.CUSTOMER}${id}/remove_customer_tag`, buildHeader());
  },
  customerSelectTag: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.CUSTOMER}${id}/add_customer_tag`, buildHeader());
  },
  sendWhatsAppMessage: (onResponse, data, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.SENDWHATSAPPMESSAGE}`, buildHeader());
  },
  sendWhatsAppBulkFiles: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.SENDWHATSAPPBULKFILES}/${id}`, buildHeader());
  },
  sendWhatsAppFiles: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.KARIXWHATSAPPSENDFILE}/${id}`, buildHeader());
  },
  sendWhatsAppLocation: (onResponse, data, isHeaderRequired) => {
    request(onResponse, data, 'POST', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.SENDWHATSAPPMESSAGE}`, buildHeader());
  },
  whatsAppMessageAsRead: (onResponse, data, id, isHeaderRequired) => {
    request(onResponse, data, 'PUT', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.WHATSAPPMESSAGEASREAD}/${id}`, buildHeader());
  },
  whatsAppAcceptOptIn: (onResponse, id, isHeaderRequired) => {
    request(onResponse, {}, 'PATCH', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.WHATSAPPACCEPTOPTIN}/${id}`, buildHeader());
  },
  whatsAppTemplates: (onResponse, page, isHeaderRequired) => {
    request(onResponse, {}, 'GET', 'JSON', isHeaderRequired, `${BASE_URL}${APILIST.WHATSAPPTEMPLATES}?page=${page}`, buildHeader());
  },
  whatsAppQuickReplies: (onResponse) => {
    request(onResponse, {}, 'GET', 'JSON', true, `${BASE_URL}${APILIST.WHATSAPP_QUICK_REPLIES}?page=1`, buildHeader());
  },
  assignAgent: (onResponse, data, id) => {
    request(onResponse, data, 'PUT', 'JSON', true, `${BASE_URL}${APILIST.CUSTOMER}${id}/${APILIST.ASSIGN_AGENT}`, buildHeader());
  },
  allowStartBots: (onResponse, id) => {
    request(onResponse, {}, 'PUT', 'JSON', true, `${BASE_URL}${APILIST.CUSTOMER}${id}/${APILIST.ALLOW_START_BOTS}`, buildHeader());
  }
};

async function request(onResponse, data, type, returnType, isHeaderRequired, featureURL, secureRequest) {
  let response = '';
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
          method: type
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
    if (response.status === 200) {
      onResponse.success(responseJSON, responseHEADERS);
    } else {
      onResponse.error(responseJSON, responseHEADERS);
    }
  } catch (error) {
    console.log(`onResponse catch error ${error}`);
  }
}
