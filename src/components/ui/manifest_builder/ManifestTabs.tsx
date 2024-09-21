import { Button } from "../button";
import { Input } from "../input";
import { useRef, useState, KeyboardEvent, useEffect } from "react";
import { useImmer } from "use-immer";
import { enableMapSet } from "immer";
import ManifestEditor from "./ManifestEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { sampleManifests } from "../../../lib/manifests/sampleManifests";
import Variable from "@/lib/data/Variable";
import { mapJSONReplacer, mapJSONReviver } from "@/lib/utils";
import _ from "underscore";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

interface ManifestTabsProps {
    walletAddresses: string[],
    networkId: number,
    variables: Map<string, Variable>,
    dAppToolkit: RadixDappToolkit | null,
    onNewTransaction: (transactionHash: string, manifest: string) => void
}

export default function ManifestTabs({ networkId, variables, ...props }: ManifestTabsProps) {
    enableMapSet();

    const [manifests, setManifests] = useImmer<Map<string, string>>(new Map());

    const [currentTab, setCurrentTab] = useState("Demo");

    const [newTabName, setNewTabName] = useState("");
    const [isAddingTab, setIsAddingTab] = useState(false);
    const newTabInput = useRef<HTMLInputElement>(null);

    const LOCAL_STORAGE_MANIFESTS_KEY = `manifests:${networkId}`;

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const manifestsInStorage = localStorage.getItem(LOCAL_STORAGE_MANIFESTS_KEY)
            const lastTab = localStorage.getItem("last_tab");

            if (manifestsInStorage != null) {
                setManifests(JSON.parse(manifestsInStorage, mapJSONReviver));

                if (lastTab) {
                    setCurrentTab(lastTab);
                }

            } else {
                const defaultManifests = new Map([
                    [
                        "Demo",
                        sampleManifests[0]
                    ]
                ]);

                // Set to default manifests
                setManifests(defaultManifests);

                // Save the manifests to local storage
                saveManifestsToLocalStorage(defaultManifests);
                localStorage.setItem("last_tab", Array.from(defaultManifests.keys())[0] || "")
            }
        }
    }, [networkId])

    const saveManifestsToLocalStorage = _.debounce((manifests: Map<string, string>) => {
        localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests, mapJSONReplacer))
    }, 500)

    function handleManifestsChange(tabName: string, newContent: string) {
        setManifests((manifests) => {
            manifests.set(tabName, newContent)
            saveManifestsToLocalStorage(new Map(manifests))
        });
    }

    function handleDeleteCurrenTab() {
        const tabs = Array.from(manifests.keys())
        const currentTabIndex = tabs.findIndex((tab => tab == currentTab));

        if (tabs.length - 1 <= 0) {
            // Don't allow to delete the last tab
            return;
        }

        setManifests((manifests) => {
            manifests.delete(tabs[currentTabIndex])

            localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests, mapJSONReplacer));
        });

        // Select the tab just before
        const newCurrentTab = tabs[currentTabIndex - 1]
        setCurrentTab(newCurrentTab);

        // Save to local storage
        localStorage.setItem("last_tab", newCurrentTab);


    }

    function handleAddTab() {
        if (isAddingTab) {
            // Already adding a tab.
            // Trigger a tab creation
            createNewTab();
        }

        setIsAddingTab(true);

        setTimeout(() => {
            if (newTabInput.current != null) {
                newTabInput.current.focus()
            }
        }, 0);
    }

    function isTabNameValid(): boolean {
        return !manifests.has(newTabName);
    }

    function cancelTabCreation() {
        setIsAddingTab(false);
        setNewTabName("");
    }

    function createNewTab() {
        if (newTabName == "") {
            cancelTabCreation()
            return;
        }
        // Make sure there are no errors in the form
        if (!isTabNameValid()) return;

        // Create the new tab
        setManifests((manifests) => {
            manifests.set(newTabName, "");
            setCurrentTab(newTabName);

            // Save to local storage
            localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests, mapJSONReplacer))
            localStorage.setItem("last_tab", newTabName);
        });

        cancelTabCreation();
    }

    function handleAddTabInputKeyPress(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            createNewTab();
        }
    }

    function handleTabChange(newTab: string) {
        setCurrentTab(newTab);

        // Save to local storage
        localStorage.setItem("last_tab", newTab);
    }

    const tabListItems = Array.from(manifests).map(([tabName]) => {
        return <TabsTrigger
            value={tabName}
            key={tabName}
            className="data-[state=active]:bg-gray-300 data-[state=active]:text-gray-600 data-[state=active]:shadow-md">{tabName}</TabsTrigger>
    });

    const tabContentItems = Array.from(manifests).map(([tabName, manifest]) => {
        return <TabsContent value={tabName} key={tabName}>
            <ManifestEditor
                walletAddresses={props.walletAddresses}
                manifest={manifest}
                variables={variables}
                dAppToolkit={props.dAppToolkit}
                networkId={networkId}
                onNewTransaction={props.onNewTransaction}
                onContentChange={(newContent) => handleManifestsChange(tabName, newContent)} />
        </TabsContent>
    })

    return <Tabs value={currentTab} onValueChange={(newTab) => handleTabChange(newTab)}>
        <div className="grid grid-cols-2">
            <div className="overflow-x-scroll rounded-md mr-2 w-100 bg-secondary">
                <TabsList>
                    {tabListItems}
                    <Input ref={newTabInput} name="newTabName" onBlur={createNewTab} onKeyDown={handleAddTabInputKeyPress} value={newTabName} onChange={(e) => setNewTabName(e.target.value)} className={`${isAddingTab ? "block" : "hidden"} ${!isTabNameValid() ? "bg-red-200" : ""}`} placeholder="New tab name" />
                </TabsList>
            </div>
            <div>
                <Button variant="secondary" onClick={handleAddTab} className="mr-2"><i className="bi bi-plus-square-fill"></i></Button>
                <Button variant="destructive" disabled={Array.from(manifests.keys()).length <= 1} onClick={() => handleDeleteCurrenTab()}>Delete Current Tab</Button>
            </div>

        </div>


        {tabContentItems}
    </Tabs>
}