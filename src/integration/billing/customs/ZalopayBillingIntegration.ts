import { ZalopayAPIs, ZalopaySettings } from "../../../types/Setting";

import CryptoJS from 'crypto-js'
import Tenant from "../../../types/Tenant";
import Transaction from "../../../types/Transaction";
import axios from 'axios'
import moment from 'moment'

export class ZalopayBillingIntegration {
  private config: ZalopaySettings;

  private constructor() {
    this.config = {
      appid: "2554",
      key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
      key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    }
  }

  public static getInstance(tenant: Tenant): ZalopayBillingIntegration {
    return new ZalopayBillingIntegration();
  }

  async createOrder(transaction: Transaction) {
    const order: any = {
      app_id: this.config.appid,
      app_trans_id: `${moment().format("YYMMDD")}_${transaction.id}`,
      app_user: transaction.user.email,
      app_time: Date.now(),
      item: JSON.stringify([{
        transactionId: transaction.id,
        itemName: `Charging order #${transaction.id}`,
        itemPrice: transaction.stop.price,
        consumedEnergy: transaction.stop.totalConsumptionWh
      }]),
      embed_data: JSON.stringify({}),
      amount: transaction.stop.price,
      description: `Nova energy - Payment for the order #${transaction.id}`,
      bank_code: 'zalopayapp'
    }
    const data = this.config.appid + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString()
    const result = await axios.post(ZalopayAPIs.CREATE_ORDER,null,{params: order})

    console.log(result)

    return {
      withBillingActive: true
    }
  }
}
