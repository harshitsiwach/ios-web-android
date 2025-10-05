ndroid Bundling failed 2959ms node_modules\expo-router\entry.js (6050 modules)
Unable to resolve "D:\RL\ios-web-andr\node_modules\@expo\metro-config\build\async-require.js" from "node_modules\viem\_esm\utils\signature\recoverPublicKey.js"
   5 | export async function recoverPublicKey({ hash, signature, }) {
   6 |     const hashHex = isHex(hash) ? hash : toHex(hash);
>  7 |     const { secp256k1 } = await import('@noble/curves/secp256k1');
     |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |     const signature_ = (() => {
   9 |         // typeof signature: `Signature`
  10 |         if (typeof signature === 'object' && 'r' in signature && 's' in signature) {

Import stack:

 node_modules\viem\_esm\utils\signature\recoverPublicKey.js
 | import "D:\RL\ios-web-andr\node_modules\@expo\metro-config\build\async-require.js"

 node_modules\viem\_esm\index.js
 | import "./utils/signature/recoverPublicKey.js"

 node_modules\@reown\appkit-wagmi-react-native\src\client.ts
 | import "viem"

 node_modules\@reown\appkit-wagmi-react-native\src\index.tsx
 | import "./client"

 app\_layout.web.tsx
 | import "@reown/appkit-wagmi-react-native"

 app (require.context)