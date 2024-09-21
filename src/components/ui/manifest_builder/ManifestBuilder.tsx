'use client'

import ManifestTabs from "./ManifestTabs";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { mapJSONReplacer, mapJSONReviver } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import VariableList from "./VariableList";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import Variable from "@/lib/data/Variable";
import { xrdAddress } from "@/lib/radix";
import Transaction from "@/lib/data/Transaction";
import TransactionList from "./TransactionList";

interface ManifestBuilderProps {
    walletAddresses: string[],
    dAppToolkit: RadixDappToolkit | null
    networkId: number
}

export default function ManifestBuilder({networkId, ...props}: ManifestBuilderProps) {

    const [variables, setVariables] = useImmer(new Map<string, Variable>());
    const [transactions, setTransactions] = useState(new Array<Transaction>);

    const LOCAL_STORAGE_VARIABLES_KEY = `variables:${networkId}`
    const LOCAL_STORAGE_TRANSACTIONS_KEY = `transactions:${networkId}`

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
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
            if(transactionsInStorage != null){
                setTransactions(JSON.parse(transactionsInStorage));
            }
        }
    }, [networkId])

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
            {hash: intentHash, manifest: manifest}
        ];
        
        setTransactions(newTransactionArray);

        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(newTransactionArray));
    }

    return <div>
        <h1 className="text-2xl text-center mb-5">Transaction Manifest Builder</h1>
        <div>
            <div className="mb-5 grid grid-cols-12 gap-1">
                <div className="col-span-12 sm:col-span-12 md:col-span-6">
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
                <div className="col-span-12 sm:col-span-12 md:col-span-6">
                    <Accordion className="border rounded overflow-hidden" defaultValue="item-1" type="single" collapsible>
                        <AccordionItem className="border-b-0" value="item-1">
                            <AccordionTrigger className="px-3 hover:no-underline"><p className="text-xl text-center">Recent Transactions</p></AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <TransactionList transactions={transactions} networkId={networkId}/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
            <ManifestTabs 
                walletAddresses={props.walletAddresses} 
                onNewTransaction={handleNewTransaction}
                variables={variables} 
                dAppToolkit={props.dAppToolkit} 
                networkId={networkId} />
        </div>
    </div>
}