// import React from 'react';
// import { View, Text } from 'react-native';
// import { GestureDetector, Gesture } from 'react-native-gesture-handler';
// import { runOnJS } from 'react-native-reanimated';

// export default function Test() {
//   const onPan = () => {
//     console.log('🟢 PAN WORKS');
//   };

//   const pan = Gesture.Pan()
//     .onUpdate(() => {
//       runOnJS(onPan)();
//     });

//   return (
//     <GestureDetector gesture={pan}>
//       <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
//         <Text style={{ color: 'white' }}>Drag here</Text>
//       </View>
//     </GestureDetector>
//   );
// }