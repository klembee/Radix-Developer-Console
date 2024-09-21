import { RadixNetwork } from "@radixdlt/radix-dapp-toolkit";

export function xrdAddress(networkId: number): string {
    return networkId == RadixNetwork.Stokenet ? "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc" : "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd";
}