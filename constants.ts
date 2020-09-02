import { keystore } from "eth-lightwallet";
import { StorageService } from "./storageservice";
import { Console } from "./console";
import { Headers } from "@angular/http";
import { networks, Network } from "bitcoinjs-lib";
import { LocalProps } from "./localprops";
import { CoinsSender } from "./coinssender";
import { HDNode } from "bitcoinjs-lib";
import { mnemonicToSeed } from "bip39";

export class Constants {
static TOMCAT_URL = "https://lb.xendbit.net";
static APP_VERSION = "v4.6-rc17"
static ENABLE_GUEST = false;
static NOTIFICATION_SOCKET_URL = "ws://ethereum.xendbit.net:8080/notify/websocket";
