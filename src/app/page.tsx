'use client'

import Header from "@/components/ui/layout/Header";
import ManifestBuilder from "@/components/ui/manifest_builder/ManifestBuilder";
import { DataRequestBuilder, RadixDappToolkit, RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import { useEffect, useState } from "react";

const currentLocalStorageSchemaVersion = "3";

export default function Home() {
  const [hasLoadedStorageSchema, setHasLoadedStorageSchema] = useState(false);
  const [networkId, setNetwork] = useState<number>(RadixNetwork.Stokenet)
  const [dAppToolkit, setdAppToolkit] = useState<RadixDappToolkit | null>(null)
  const [walletAddresses, setWalletAddresses] = useState(new Array<string>())

  function getDAppDef(networkId: number){
    return networkId == RadixNetwork.Stokenet ? "account_tdx_2_12yf6xmwwhnx45fxms9q2qe094fwhjrls6s0xznsltug94ht2amyt55" : "account_rdx12x42kaa2mfuy8huqhxgl9e2sp4mqj7yy6gxc09fyevdzxpj2l2zlmw"
  }

  const radixLocalStorageKeyPrefix = `rdt:${getDAppDef(networkId)}:${networkId}`;

  function setupDAppToolkit(networkId: number) {

    const newDApptoolkit = RadixDappToolkit({
          dAppDefinitionAddress: getDAppDef(networkId),
          networkId: networkId,
          applicationName: 'Radix Developer Console',
          applicationVersion: '1.0.0',
    })

    newDApptoolkit.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1));
    
    newDApptoolkit.walletApi.walletData$.subscribe((walletData) => {
      setWalletAddresses(walletData.accounts.map((account) => account.address));
    });

    setdAppToolkit(newDApptoolkit);
  }

  useEffect(() => {
    if(typeof window !== 'undefined' && window.localStorage) {
      const localStorageSchemaVersion = localStorage.getItem("schemaversion");
      if(localStorageSchemaVersion == null || localStorageSchemaVersion != currentLocalStorageSchemaVersion) {
        localStorage.clear();
        localStorage.setItem("schemaversion", currentLocalStorageSchemaVersion);
      } 
      setHasLoadedStorageSchema(true);
      
      let savedNetwork = localStorage.getItem("network");
      if(savedNetwork == null) {
        localStorage.setItem("network", networkId.toString());
        savedNetwork = networkId.toString();
      } else {
        setNetwork(parseInt(savedNetwork));
      }
      
      setupDAppToolkit(parseInt(savedNetwork));
    }
  }, [])

  function handleNetworkChange(newNetworkId: number) {
    setNetwork(newNetworkId);
    localStorage.setItem("network", newNetworkId.toString());
    
    localStorage.removeItem(radixLocalStorageKeyPrefix + ":connectorExtension")

    dAppToolkit?.destroy();
    // Reload the page
    window.location.hash = ``
    window.location.replace(window.location.origin)
  }

  return (
    <div>
      <Header networkId={networkId} onNetworkChange={handleNetworkChange} />
      <main className="w-9/12 py-5 mx-auto">
        { hasLoadedStorageSchema && <ManifestBuilder walletAddresses={walletAddresses} dAppToolkit={dAppToolkit} networkId={networkId} />}
      </main>
    </div>
  );
}
