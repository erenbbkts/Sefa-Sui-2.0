import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

/**
 * Package ID retrieved from transaction summary
 */

// EKLENECEK KISIM: Admin Cap ID (Terminalden aldığımız yetki kodu)

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: "0xf66b8f3f08e8e52a8f87a4f367186443a1b57a96b1c540133dec33a379f6f6d4",
        adminCapId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",

      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "0xf66b8f3f08e8e52a8f87a4f367186443a1b57a96b1c540133dec33a379f6f6d4",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: "0xf66b8f3f08e8e52a8f87a4f367186443a1b57a96b1c540133dec33a379f6f6d4",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };