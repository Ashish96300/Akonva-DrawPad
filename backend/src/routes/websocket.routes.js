
// import { handleRegistration ,handleDisconnection} from '../controller/deviceRegistration.controller.js';
// import { MESSAGE_TYPES } from '../configs/constants.js';

// //Routes messages to appropriate controllers based on type

// export const handleWebSocketMessage = (ws, message) => {
//   switch (message.type) {
//     // Doubt Here
//     case MESSAGE_TYPES.REGISTER_DESKTOP:
//     case MESSAGE_TYPES.REGISTER_MOBILE:
//       handleRegistration(ws, message);
//       break;

//     // Future message types will go here
//     // case MESSAGE_TYPES.PAIR_MOBILE:
//     //   pairingController.handlePairing(ws, message);
//     //   break;

//     // case MESSAGE_TYPES.INPUT_EVENT:
//     //   inputController.handleInput(ws, message);
//     //   break;

//     default:
//       ws.send(JSON.stringify({
//         type: MESSAGE_TYPES.ERROR,
//         message: `Unknown message type: ${message.type}`
//       }));
//   }
// };

// /**
//  * Handle WebSocket connection
//  */
// export const handleWebSocketConnection = (ws) => {
//   console.log('New WebSocket connection');

//   // Handle messages
//   ws.on('message', (data) => {
//     try {
//       const message = JSON.parse(data.toString());
//       console.log('Received message:', message.type);

//       // Route to appropriate handler
//       handleWebSocketMessage(ws, message);

//     } catch (error) {
//       console.error('Error handling message:', error);
//       ws.send(JSON.stringify({
//         type: MESSAGE_TYPES.ERROR,
//         message: 'Invalid message format'
//       }));
//     }
//   });

//   // Handle disconnection
//   ws.on('close', () => {
//     handleDisconnection(ws);
//   });

//   // Handle errors
//   ws.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// };