"use client"
import { RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../select";
import { ThemeSelection } from "../ThemeSelection";
import { useEffect } from "react";

interface HeaderProps {
    networkId: number,
    onNetworkChange: (newNetworkId: number) => void
}

export default function Header({ networkId, onNetworkChange }: HeaderProps) {

    useEffect(() => {
        // Add the radix connect button div
        document.getElementById("radix-connect-button-container")?.appendChild(document.createElement("radix-connect-button"));
    }, [])

    return <div className="w-100 dark:bg-slate-800 p-3 border-b border-b-input">
        <div className="flex">
            <div className="flex items-center">
                <h1 className="text-2xl">Radix Developer Console</h1>
            </div>
            <div className="flex-grow">
                <div className="float-end flex">
                    <div className="mr-2 flex">
                        <div className="mr-2">
                            <ThemeSelection />
                        </div>

                        <Select value={networkId.toString()} onValueChange={(x) => onNetworkChange(parseInt(x))}>
                            <SelectTrigger className="dark:border-slate-200/50 w-[180px]">
                                <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value={RadixNetwork.Stokenet.toString()}>Stokenet</SelectItem>
                                    <SelectItem value={RadixNetwork.Mainnet.toString()}>Mainnet</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div id="radix-connect-button-container">
                        
                    </div>
                </div>
            </div>
        </div>

    </div>
}