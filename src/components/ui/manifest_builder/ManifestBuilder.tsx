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
import { Tooltip } from 'react-tooltip'

interface ManifestBuilderProps {
    walletAddresses: string[],
    dAppToolkit: RadixDappToolkit | null
    networkId: number
}

const LOCAL_STORAGE_ACCORDION_VARIABLE_OPEN_KEY = "LOCAL_STORAGE_ACCORDION_VARIABLE_OPEN";
const LOCAL_STORAGE_ACCORDION_CONFIGURATION_OPEN_KEY = "LOCAL_STORAGE_ACCORDION_CONFIGURATION_OPEN";
const LOCAL_STORAGE_ACCORDION_TRANSACTIONS_OPEN_KEY = "LOCAL_STORAGE_ACCORDION_TRANSACTIONS_OPEN";

export default function ManifestBuilder({ networkId, dAppToolkit, walletAddresses }: ManifestBuilderProps) {

    const [variables, setVariables] = useImmer(new Map<string, Variable>());
    const [transactions, setTransactions] = useState(new Array<Transaction>);
    const [isSendingTx, setIsSendingTx] = useState(false);
    const [transactionMessage, setTransactionMessage] = useState("");
    const [sendTip, setSendTip] = useState(false);
    const [tipAmount, setTipAmount] = useState(10);
    const [payTipFrom, setPayTipFrom] = useState("");
    const [variableListOpen, setVariableListOpen] = useState(true);
    const [transactionConfigurationOpen, setTransactionConfigurationOpen] = useState(false);
    const [recentTransactionsOpen, setRecentTransactionsOpen] = useState(false);

    const LOCAL_STORAGE_VARIABLES_KEY = `variables:${networkId}`
    const LOCAL_STORAGE_TRANSACTIONS_KEY = `transactions:${networkId}`

    useEffect(() => {
        setPayTipFrom(walletAddresses[0]);

        if (typeof window !== 'undefined' && window.localStorage) {
            // Accordion states
            const isVariablesOpen = localStorage.getItem(LOCAL_STORAGE_ACCORDION_VARIABLE_OPEN_KEY);
            const isConfigurationOpen = localStorage.getItem(LOCAL_STORAGE_ACCORDION_CONFIGURATION_OPEN_KEY);
            const isRecentTransactionOpen = localStorage.getItem(LOCAL_STORAGE_ACCORDION_TRANSACTIONS_OPEN_KEY);

            if(isVariablesOpen != null) {
                setVariableListOpen(isVariablesOpen === "true");
            } else {
                localStorage.setItem(LOCAL_STORAGE_ACCORDION_VARIABLE_OPEN_KEY, variableListOpen? "true" : "false");
            }

            if(isConfigurationOpen != null) {
                setTransactionConfigurationOpen(isConfigurationOpen === "true");
            } else {
                localStorage.setItem(LOCAL_STORAGE_ACCORDION_CONFIGURATION_OPEN_KEY, transactionConfigurationOpen? "true" : "false");
            }

            if(isRecentTransactionOpen != null) {
                setRecentTransactionsOpen(isRecentTransactionOpen === "true");
            } else {
                localStorage.setItem(LOCAL_STORAGE_ACCORDION_TRANSACTIONS_OPEN_KEY, recentTransactionsOpen? "true" : "false");
            }

            // Send tip
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

    function handleAccordionChange(accordion: string) {
        if(accordion == "variables") {
            setVariableListOpen(!variableListOpen);
            localStorage.setItem(LOCAL_STORAGE_ACCORDION_VARIABLE_OPEN_KEY, !variableListOpen? "true": "false");
        } else if(accordion == "configuration") {
            setTransactionConfigurationOpen(!transactionConfigurationOpen);
            localStorage.setItem(LOCAL_STORAGE_ACCORDION_CONFIGURATION_OPEN_KEY, !transactionConfigurationOpen? "true": "false");
        } else if(accordion == "transactions") {
            setRecentTransactionsOpen(!recentTransactionsOpen);
            localStorage.setItem(LOCAL_STORAGE_ACCORDION_TRANSACTIONS_OPEN_KEY, !recentTransactionsOpen? "true": "false");
        }
    }

    const accountSelectItems = walletAddresses.map((account) => {
        return <option
            key={account}
            value={account}>
            {sliceAddress(account)}
        </option>
    })

    const accountSelect = <div className="h-9 inline">
        <select
            value={payTipFrom}
            onChange={(e) => setPayTipFrom(e.target.value)}
            className='rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
            {accountSelectItems}
        </select>
    </div>

    return <div>
        <h1 className="text-2xl text-center mb-5">Transaction Manifest Builder</h1>
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-8">
                <div className="mb-2">
                    <ManifestTabs
                        walletAddresses={walletAddresses}
                        onSendTransactionClick={(manifest) => sendManifestToWallet(preparedManifest(manifest))}
                        sendButtonDisabled={isSendingTx || walletAddresses.length == 0}
                        variables={variables}
                        dAppToolkit={dAppToolkit}
                        networkId={networkId} />
                </div>
            </div>
            <div className="mb-5 col-span-12 md:col-span-4">
                <div className="mb-3">
                    <Accordion className="border rounded overflow-hidden" value={variableListOpen ? `item-1` : ""} onValueChange={() => handleAccordionChange("variables")} type="single" collapsible>
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
                <div className="mb-3">
                    <Accordion className="border rounded overflow-hidden" value={transactionConfigurationOpen ? `item-1` : ""} onValueChange={() => handleAccordionChange("configuration")} type="single" collapsible>
                        <AccordionItem className="border-b-0" value="item-1">
                            <AccordionTrigger className="px-3 hover:no-underline"><p className="text-xl text-center">Transaction Configuration</p></AccordionTrigger>
                            <AccordionContent className="px-2 pb-0">
                                <div className='w-full mb-2'>
                                    <p className="text-lg mb-1">Optional message</p>
                                    <Textarea
                                        value={transactionMessage}
                                        onChange={(e) => setTransactionMessage(e.target.value)}
                                        placeholder='Optional transaction message'></Textarea>
                                </div>

                                {(walletAddresses.length > 0 && networkId == RadixNetwork.Mainnet) && <div className="space-x-2 mb-2">

                                    <div className="flex items-center">
                                        <div className="flex items-center flex-grow">
                                            <p className="text-lg mr-2">Tip</p>
                                            <Checkbox id="tip" checked={sendTip} onCheckedChange={(e) => handleSetSendTip(e.valueOf() === true)} />
                                        </div>
                                        <i className="bi bi-question-circle" data-tooltip-id="my-tooltip-1"></i>

                                        <Tooltip
                                            id="my-tooltip-1"
                                            className="max-w-[250px]"
                                            place="bottom"
                                            content="This is a tip for the creator of the Radix Developer Console. It will be included in your transaction when you send it to your wallet."
                                        />
                                    </div>

                                    {sendTip && <div className="text-sm font-medium leading-none">
                                        <div
                                            className="mb-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            <span>Amount: </span>
                                            <Input className='w-[70px] h-9 mx-1 inline text-center' name="tipAmount" type='number' min={1} value={tipAmount} onChange={(e) => setTipAmount(parseInt(e.target.value))} />
                                            <span>XRD</span>
                                        </div>

                                        <div>
                                            <span>From account: </span>
                                            {accountSelect}
                                        </div>

                                    </div>}
                                </div>}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div>
                    <Accordion className="border rounded overflow-hidden" value={recentTransactionsOpen ? `item-1` : ""} onValueChange={() => handleAccordionChange("transactions")} type="single" collapsible>
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