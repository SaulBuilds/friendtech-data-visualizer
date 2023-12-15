import axios from 'axios';
import WebSocket from 'ws';
import { Wallet } from 'ethers';
import  ethUtil  from 'ethereumjs-util'

const PRIVY_APP_ID: string = process.env.PRIVY_APP_ID || '';
const WALLET_ADDRESS: string = process.env.WALLET_ADDRESS || '';
const PRIVATE_KEY: string = process.env.WALLET_PRIVATE_KEY || '';

interface HexGenerator {
    index: number;
    hexArray: string[];
    randomHexString?: string;
    generate: (len?: number) => string;
}

let hexGenerator: HexGenerator = {
    index: 0,
    hexArray: Array.from({ length: 256 }, (_, i) => (i + 256).toString(16).substring(1)),
    generate: function (len: number = 11): string {
        if (!this.randomHexString || this.index + len > 512) {
            this.randomHexString = Array.from({ length: 256 }, () => this.hexArray[Math.floor(256 * Math.random())]).join('');
            this.index = 0;
        }
        return this.randomHexString.substring(this.index, this.index++ + len);
    }
};

interface MessageData {
    action: string;
    text: string;
    imagePaths: string | null;
    chatRoomId: string;
    clientMessageId: string;
}

function sendMessage(wssSocket: WebSocket, chatRoomId: string, text: string, imagePaths: string | null = null): void {
    const messageData: MessageData = {
        action: "sendMessage",
        text,
        imagePaths,
        chatRoomId: chatRoomId.toLowerCase(),
        clientMessageId: hexGenerator.generate()
    };

    console.log('Sending message:', JSON.stringify(messageData, null, 2));
    wssSocket.send(JSON.stringify(messageData));

    wssSocket.on('message', (data) => {
        console.log('Received from server:', data.toString('utf8'));
    });

    wssSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    wssSocket.on('close', (code, reason) => {
        console.log(`WebSocket closed. Code: ${code}, Reason: ${reason}`);
    });
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return base64;
    } catch (error) {
        console.error('Failed to fetch image:', error);
        return null;
    }
}

async function sendMessageWithImageUrl(wssSocket: WebSocket, chatRoomId: string, text: string, imageUrl: string): Promise<void> {
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    if (imageBase64) {
        sendMessage(wssSocket, chatRoomId, text, imageBase64);
    } else {
        console.error('Failed to send image data.');
    }
}

function startWebSocketConnection(jwt: string): void {
    const url = `wss://prod-api.kosetto.com/?authorization=${jwt}`;
    const socket = new WebSocket(url);

    socket.on('open', () => {
        console.log('Connected to:', url);
        const requestData = {
            action: 'requestMessages',
            chatRoomId: WALLET_ADDRESS,
            pageStart: null
        };

        socket.send(JSON.stringify(requestData));

        sendMessage(socket, WALLET_ADDRESS, `\"testing a text message via the API. It is now ${new Date().toISOString()}\\n\"`);
    });

    socket.on('message', (data) => {
        const strData = data.toString('utf8');
        console.log('Received:', strData);
    });

    socket.on('error', (error) => {
        console.error('WebSocket Error:', error);
    });

    socket.on('close', (code, reason) => {
        console.log(`Connection closed with code ${code} and reason "${reason}"`);
    });
}

async function main(): Promise<void> {
    const wallet = new Wallet(PRIVATE_KEY);

    const initResponse = await axios.post('https://auth.privy.io/api/v1/siwe/init', {
        address: WALLET_ADDRESS
    }, {
        headers: {
            'Privy-App-Id': PRIVY_APP_ID,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    console.log('Init response:', initResponse.data);

    const nonce: string = initResponse.data.nonce;
    const issuanceTime: string = new Date().toISOString();

    const message = `localhost:3000 wants you to sign in with your Ethereum account