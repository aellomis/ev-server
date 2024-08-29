import Tenant from "../../../types/Tenant";
import Transaction from "../../../types/Transaction";
import { VnpaySettings } from "../../../types/Setting";
import axios from 'axios'
import crypto from 'crypto'
import moment from 'moment'
import querystring from 'qs'

export class VnpayBillingIntegration {
  private config: VnpaySettings;

  private constructor() {
    this.config = {
      tmnCode: "5EJ0J987",
      secretKey: "WVYNTYJRBJV1JR6NXCV76MMTZQMH1QQD",
      vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    }
  }

  public static getInstance(tenant: Tenant): VnpayBillingIntegration {
    return new VnpayBillingIntegration();
  }

  async createOrder(transaction: Transaction) {
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    console.log(transaction.stop.price);
    let vnpParams: any = {
      vnp_Command: 'pay',
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: '23554',
      vnp_OrderType: 'other',
      vnp_ReturnUrl: 'https://www.google.com/',
      vnp_TmnCode: this.config.tmnCode,
      vnp_TxnRef: transaction.id,
      vnp_Version: '2.1.0',
      vnp_Amount: transaction.stop.price * 100,
    }

    vnpParams = this.sortObject(vnpParams)

    let signData = querystring.stringify(vnpParams, {encode: false})
    let hmac = crypto.createHmac("sha512", this.config.secretKey)
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;
    this.config.vnpUrl += '?' + querystring.stringify(vnpParams, {encode: false})

    console.log(this.config.vnpUrl)

    return {
      withBillingActive: true
    }
  }

   private sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
      if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
      }
    }
    str.sort();
      for (key = 0; key < str.length; key++) {
          sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
      }
      return sorted;
  }
}
