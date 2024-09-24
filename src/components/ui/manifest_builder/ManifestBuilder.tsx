'use client'

import ManifestTabs from "./ManifestTabs";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { mapJSONReplacer, mapJSONReviver, replaceVariablesInString, sliceAddress } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import VariableList from "./VariableList";
import { RadixDappToolkit, RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import Variable from "@/lib/data/Variable";
import { xrdAddress } from "@/lib/radix";
import Transaction from "@/lib/data/Transaction";
import TransactionList from "./TransactionList";
import Toastify from "toastify-js";
import { Textarea } from "../textarea";
import { Checkbox } from "../checkbox";
import { Input } from "../input";

interface ManifestBuilderProps {
    walletAddresses: string[],
    dAppToolkit: RadixDappToolkit | null
    networkId: number
}

export default function ManifestBuilder({ networkId, dAppToolkit, walletAddresses }: ManifestBuilderProps) {

    const [variables, setVariables] = useImmer(new Map<string, Variable>());
    const [transactions, setTransactions] = useState(new Array<Transaction>);
    const [isSendingTx, setIsSendingTx] = useState(false);
    const [transactionMessage, setTransactionMessage] = useState("");
    const [sendTip, setSendTip] = useState(false);
    const [tipAmount, setTipAmount] = useState(10);
    const [payTipFrom, setPayTipFrom] = useState("");

    const LOCAL_STORAGE_VARIABLES_KEY = `variables:${networkId}`
    const LOCAL_STORAGE_TRANSACTIONS_KEY = `transactions:${networkId}`

    useEffect(() => {
        setPayTipFrom(walletAddresses[0]);

        if (typeof window !== 'undefined' && window.localStorage) {
            const sendTipStorage = localStorage.getItem("sendTip");
            if (sendTipStorage != null) {
                setSendTip(sendTipStorage === "true");
            } else {
                localStorage.setItem("sendTip", "false");
            }

            const variablesInStorage = localStorage.getItem(LOCAL_STORAGE_VARIABLES_KEY)
            if (variablesInStorage != null) {
                setVariables(JSON.parse(variablesInStorage, mapJSONReviver));
            } else {
                const defaultVariables = new Map([
                    ["XRD", {
                        value: xrdAddress(networkId),
                        readOnly: true
                    }],
                    ["my_account", {
                        value: "CHANGE_ME",
                        readOnly: false
                    }]
                ]);

                localStorage.setItem(LOCAL_STORAGE_VARIABLES_KEY, JSON.stringify(defaultVariables, mapJSONReplacer));
                setVariables(defaultVariables);
            }

            const transactionsInStorage = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
            if (transactionsInStorage != null) {
                setTransactions(JSON.parse(transactionsInStorage));
            }
        }
    }, [networkId, walletAddresses])

    function handleSetSendTip(value: boolean) {
        setSendTip(value);
        localStorage.setItem("sendTip", value ? "true" : "false");
    }

    function handleVariableAdd(label: string, value: string) {
        setVariables((variables) => {
            variables.set(label, {
                value: value,
                readOnly: false
            });

            localStorage.setItem(LOCAL_STORAGE_VARIABLES_KEY, JSON.stringify(variables, mapJSONReplacer))
        });
    }

    function handleVariableValueChange(label: string, value: string) {
        setVariables((variables) => {
            const variable = variables.get(label);
            if (variable != undefined) {
                variable.value = value;
            }

            localStorage.setItem(LOCAL_STORAGE_VARIABLES_KEY, JSON.stringify(variables, mapJSONReplacer))
        })
    }

    function handleVariableDelete(label: string) {
        setVariables((variables) => {
            variables.delete(label)

            localStorage.setItem(LOCAL_STORAGE_VARIABLES_KEY, JSON.stringify(variables, mapJSONReplacer))
        });
    }

    function handleNewTransaction(intentHash: string, manifest: string) {
        const newTransactionArray = [
            ...transactions,
            { hash: intentHash, manifest: manifest }
        ];

        setTransactions(newTransactionArray);

        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(newTransactionArray));
    }

    function preparedManifest(manifest: string): string {
        let newManifest = replaceVariablesInString(manifest, variables)

        // Include the tip
        if (sendTip && networkId == RadixNetwork.Mainnet) {
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

    function sendManifestToWallet(preparedManifest: string) {
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

        const response = dAppToolkit.walletApi.sendTransaction({
            transactionManifest: preparedManifest,
            version: 1,
            message: transactionMessage == "" ? undefined : transactionMessage
        });

        response.map((result) => {
            handleNewTransaction(result.transactionIntentHash, preparedManifest);
            setIsSendingTx(false);
            setTransactionMessage("");
        })

        response.mapErr((err) => {
            Toastify({
                text: err.message ? err.message : `Error "${err.error}"`,
                className: "error",
                gravity: "bottom"
            }).showToast();

            setIsSendingTx(false);
        })
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
        <h1 className="text-2xl text-center mb-5">Transaction Manifest Builder</h1>
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-8">
                <ManifestTabs
                    walletAddresses={walletAddresses}
                    onSendTransactionClick={(manifest) => sendManifestToWallet(preparedManifest(manifest))}
                    sendButtonDisabled={isSendingTx || walletAddresses.length == 0}
                    variables={variables}
                    dAppToolkit={dAppToolkit}
                    networkId={networkId} />

                {(walletAddresses.length > 0 && networkId == RadixNetwork.Mainnet) && <div className="flex items-center space-x-2 mb-2">
                    <Checkbox id="tip" checked={sendTip} onCheckedChange={(e) => handleSetSendTip(e.valueOf() === true)} />
                    <label
                        htmlFor="tip"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        <span>Include a tip of <Input className='w-[70px] h-9 inline text-center' type='number' min={1} value={tipAmount} onChange={(e) => setTipAmount(parseInt(e.target.value))} /> XRD to the creator of this developer console from {accountSelect}</span>
                    </label>
                </div>}

                <div className='w-full md:w-1/2 mb-2'>
                    <Textarea value={transactionMessage} onChange={(e) => setTransactionMessage(e.target.value)} placeholder='Optional transaction message'></Textarea>
                </div>
            </div>
            <div className="mb-5 col-span-12 md:col-span-4">
                <div className="mb-3">
                    <Accordion className="border rounded overflow-hidden" defaultValue="item-1" type="single" collapsible>
                        <AccordionItem className="border-b-0" value="item-1">
                            <AccordionTrigger className="px-3 hover:no-underline"><p className="text-xl text-center">Variable List</p></AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <VariableList
                                    variables={variables}
                                    onVariablesChange={handleVariableValueChange}
                                    onVariableDelete={handleVariableDelete}
                                    onVariableAdd={handleVariableAdd}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div>
                    <Accordion className="border rounded overflow-hidden" defaultValue="item-1" type="single" collapsible>
                        <AccordionItem className="border-b-0" value="item-1">
                            <AccordionTrigger className="px-3 hover:no-underline"><p className="text-xl text-center">Recent Transactions</p></AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <TransactionList
                                    onReplayManifest={sendManifestToWallet}
                                    transactions={transactions}
                                    networkId={networkId} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    </div>
}