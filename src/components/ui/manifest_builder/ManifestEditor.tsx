import CodeMirror from '@uiw/react-codemirror';
import radixManifestLanguage from "@/lib/manifests/language/RadixManifestLanguage";
import Variable from "@/lib/data/Variable";
import { Button } from "../button";
import Toastify from 'toastify-js'
import { RadixDappToolkit, RadixNetwork } from '@radixdlt/radix-dapp-toolkit';
import { useTheme } from 'next-themes';
import { Checkbox } from '../checkbox';
import { useEffect, useState } from 'react';
import { Input } from '../input';
import { xrdAddress } from '@/lib/radix';


interface ManifestEditorProps {
    walletAddresses: string[]
    dAppToolkit: RadixDappToolkit | null,
    networkId: number,
    variables: Map<string, Variable>,
    manifest: string,
    onContentChange: (content: string) => void,
    onNewTransaction: (transaction_hash: string, manifest: string) => void
}
export default function ManifestEditor({ dAppToolkit, networkId, walletAddresses, manifest, variables, onContentChange, onNewTransaction }: ManifestEditorProps) {

    const { theme } = useTheme()
    const [sendTip, setSendTip] = useState(false);
    const [tipAmount, setTipAmount] = useState(15);
    const [payTipFrom, setPayTipFrom] = useState("");
    const [isSendingTx, setIsSendingTx] = useState(false);

    const languageSupport = radixManifestLanguage(variables);

    useEffect(() => {
        setPayTipFrom(walletAddresses[0])

        if(typeof window !== "undefined" && window.localStorage) {
            const sendTipStorage = localStorage.getItem("sendTip");
            if(sendTipStorage != null) {
                setSendTip(sendTipStorage === "true");
            } else {
                localStorage.setItem("sendTip", "false");
            }
        }

    }, [walletAddresses])

    function handleSetSendTip(value: boolean) {
        setSendTip(value);
        localStorage.setItem("sendTip", value ? "true" : "false");
    }

    function preparedManifest(): string {
        let newManifest = manifest.slice(0);

        // Set the variables
        for (const match of manifest.matchAll(/\${?\w+}?/g)) {
            const variable = match[0].replace(/\W/g, "")
            const replaceWith = variables.get(variable)
            if (replaceWith) {
                newManifest = newManifest.replaceAll(match[0], replaceWith.value);
            } else {
                console.log(`Variable ${variable} undefined`);
            }
        }

        // Include the tip
        if(sendTip && networkId == RadixNetwork.Mainnet) {
            newManifest += `CALL_METHOD
                    Address("${payTipFrom}")
                    "withdraw"
                    Address("${xrdAddress(networkId)}")
                    Decimal("${tipAmount}");

                TAKE_FROM_WORKTOP
                    Address("${xrdAddress(networkId)}")
                    Decimal("${tipAmount}")
                    Bucket("TIP_BUCKET_DEV_CONSOLE");

                CALL_METHOD
                    Address("account_rdx12x42kaa2mfuy8huqhxgl9e2sp4mqj7yy6gxc09fyevdzxpj2l2zlmw")
                    "deposit"
                    Bucket("TIP_BUCKET_DEV_CONSOLE");
            `;
        }

        return newManifest;
    }

    function sendManifestToWallet() {
        if (dAppToolkit == null) {
            return;
        }

        if (dAppToolkit.walletApi.getWalletData() == undefined) {
            Toastify({
                text: "Connect the wallet first",
                className: "error",
            }).showToast()
            return;
        }

        setIsSendingTx(true);

        const manifest = preparedManifest();

        const response = dAppToolkit.walletApi.sendTransaction({
            transactionManifest: manifest,
            version: 1
        });

        response.map((result) => {
            onNewTransaction(result.transactionIntentHash, manifest);
            setIsSendingTx(false);
        })

        response.mapErr((err) => {
            Toastify({
                text: err.message? err.message: `Error "${err.error}"` ,
                className: "error",
                gravity: "bottom"
            }).showToast();

            setIsSendingTx(false);
        })
    }

    function sliceAddress(address: string): string {
        return `${address.slice(0, 5)}...${address.slice(-10)}`
    }

    const accountSelectItems = walletAddresses.map((account) => {
        return <option
            key={account}
            value={account}>
                {sliceAddress(account)}
        </option>
    })

    const accountSelect = <div className="h-9 inline">
        <select value={payTipFrom} onChange={(e) => setPayTipFrom(e.target.value)} className='rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
            {accountSelectItems}
        </select>
    </div>


    return <div>
        <div className='mb-2'>
            <CodeMirror
                autoFocus={true}
                extensions={[languageSupport]}
                value={manifest}
                theme={theme == "light" ? "light" : "dark"}
                minHeight="100px"
                maxHeight="500px"
                placeholder="Start writing your manifest"
                onChange={manifest => onContentChange(manifest)} />
        </div>

        {(walletAddresses.length > 0 && networkId == RadixNetwork.Mainnet) && <div className="flex items-center space-x-2 mb-2">
            <Checkbox id="tip" checked={sendTip} onCheckedChange={(e) => handleSetSendTip(e.valueOf() === true)} />
            <label
                htmlFor="tip"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                <span>Include a tip of <Input className='w-[70px] h-9 inline text-center' type='number' min={1} value={tipAmount} onChange={(e) => setTipAmount(parseInt(e.target.value))} /> XRD to the creator of this developer console from {accountSelect}</span>
            </label>
        </div>}

        <div className="w-fit mx-auto">
            <Button onClick={sendManifestToWallet} disabled={isSendingTx || walletAddresses.length == 0}>Send to the wallet</Button>
        </div>
    </div>
}