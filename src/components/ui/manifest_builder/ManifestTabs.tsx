import { Button } from "../button";
import { Input } from "../input";
import { useRef, useState, KeyboardEvent, MouseEvent, DragEvent, useEffect } from "react";
import { useImmer } from "use-immer";
import { enableMapSet } from "immer";
import ManifestEditor from "./ManifestEditor";
import { Tabs, TabsContent, TabsList } from "../tabs";
import { sampleManifests } from "../../../lib/manifests/sampleManifests";
import Variable from "@/lib/data/Variable";
import { mapJSONReviver, randomHash } from "@/lib/utils";
import _ from "underscore";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import Manifest from "@/lib/data/Manifest";

interface ManifestTabsProps {
    walletAddresses: string[],
    networkId: number,
    variables: Map<string, Variable>,
    dAppToolkit: RadixDappToolkit | null,
    onNewTransaction: (transactionHash: string, manifest: string) => void
}

export default function ManifestTabs({ networkId, variables, ...props }: ManifestTabsProps) {
    enableMapSet();

    const [manifests, setManifests] = useImmer<Array<Manifest>>([]);

    const [currentTab, setCurrentTab] = useState(0);
    const [currentlyDraggingTabIndex, setCurrentlyDraggingTabIndex] = useState<number | null>(null);

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
                    setCurrentTab(parseInt(lastTab));
                }

            } else {
                const defaultManifests = [
                    {
                        id: randomHash(16),
                        tabName: "Demo",
                        content: sampleManifests[0]
                    }
                ];

                // Set to default manifests
                setManifests(defaultManifests);

                // Save the manifests to local storage
                saveManifestsToLocalStorage(defaultManifests);
                localStorage.setItem("last_tab", "0");
            }
        }
    }, [networkId])

    const saveManifestsToLocalStorage = _.debounce((manifests: Array<Manifest>) => {
        localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests))
    }, 500)

    function handleManifestsChange(index: number, newContent: string) {

        const newManifests = [
            ...manifests
        ];

        newManifests[index] = {
            ...newManifests[index],
            content: newContent
        }

        setManifests(newManifests);

        saveManifestsToLocalStorage(newManifests)
    }

    function handleDeleteTab(e: MouseEvent<HTMLElement>, tabIndex: number) {
        e.stopPropagation();

        if (manifests.length - 1 <= 0) {
            // Don't allow to delete the last tab
            return;
        }

        setManifests((manifests) => {
            manifests.splice(tabIndex, 1)
            localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests));

            let newCurrentTab = currentTab;

            // Select the tab just after
            if (tabIndex == currentTab) {
                newCurrentTab = Math.min(tabIndex, manifests.length - 1)
                
            }
            if (tabIndex < currentTab) {
                newCurrentTab--;
            }

            setCurrentTab(newCurrentTab);
            // Save to local storage
            localStorage.setItem("last_tab", newCurrentTab.toString());
        });
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

    function cancelTabCreation() {
        setIsAddingTab(false);
        setNewTabName("");
    }

    function createNewTab() {
        if (newTabName == "") {
            cancelTabCreation()
            return;
        }

        // Create the new tab
        setManifests((manifests) => {
            manifests.push({
                id: randomHash(16),
                tabName: newTabName,
                content: ""
            });
            setCurrentTab(manifests.length - 1);

            // Save to local storage
            localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests))
            localStorage.setItem("last_tab", (manifests.length - 1).toString());
        });

        cancelTabCreation();
    }

    function handleAddTabInputKeyPress(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            createNewTab();
        }
    }

    function handleTabChange(newTab: number) {
        setCurrentTab(newTab);

        // Save to local storage
        localStorage.setItem("last_tab", newTab.toString());
    }

    function handleTabDragDrop(e: DragEvent<HTMLDivElement>, droppedOnTabIndex: number) {
        e.stopPropagation();

        if (droppedOnTabIndex == currentlyDraggingTabIndex || currentlyDraggingTabIndex == null) {
            // Dropping on source
            return;
        }

        let newlyOrderedManifests = [
            ...manifests
        ];
        newlyOrderedManifests.splice(currentlyDraggingTabIndex, 1);
        newlyOrderedManifests.splice(droppedOnTabIndex, 0, manifests[currentlyDraggingTabIndex])

        setManifests(newlyOrderedManifests);

        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(newlyOrderedManifests));

        handleTabChange(droppedOnTabIndex);
    }

    const tabListItems = manifests.map((manifest, index) => {
        return <div
            // value={index}
            onClick={() => handleTabChange(index)}
            data-state={currentTab == index ? "active" : "inactive"}
            className={`${currentlyDraggingTabIndex == index ? "opacity-40" : ""} group cursor-pointer border-[1px] border-white/50 mr-2 data-[state=active]:bg-gray-300 data-[state=active]:text-gray-600 data-[state=active]:shadow-md inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm`}
            key={manifest.id}
            draggable="true"
            onDragStart={() => setCurrentlyDraggingTabIndex(index)}
            onDragEnd={() => setCurrentlyDraggingTabIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleTabDragDrop(e, index)}>

            <span>{manifest.tabName} {Array.from(manifests.keys()).length > 1 && <i onClick={(e) => handleDeleteTab(e, index)} className="bi bi-x-square hidden group-hover:inline hover:text-red-700 align-middle"></i>}</span>
        </div>
    });

    const tabContentItems = manifests.map((manifest, index) => {
        return <TabsContent value={index.toString()} key={manifest.id}>
            <ManifestEditor
                walletAddresses={props.walletAddresses}
                manifest={manifest}
                variables={variables}
                dAppToolkit={props.dAppToolkit}
                networkId={networkId}
                onNewTransaction={props.onNewTransaction}
                onContentChange={(newContent) => handleManifestsChange(index, newContent)} />
        </TabsContent>
    })

    return <Tabs value={currentTab.toString()}>
        <div className="flex">
            <div className="overflow-x-scroll rounded-md mr-2 w-100 bg-secondary flex-grow">
                <TabsList>
                    {tabListItems}
                    <Input
                        ref={newTabInput}
                        name="newTabName"
                        onBlur={createNewTab}
                        onKeyDown={handleAddTabInputKeyPress}
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        className={`min-w-[150px] ${isAddingTab ? "block" : "hidden"}`}
                        placeholder="New tab name" />
                </TabsList>
            </div>
            <div className="flex">
                <Button
                    variant="secondary"
                    onClick={handleAddTab}
                    className="mr-2">
                    <i className="bi bi-plus-square-fill"></i>
                </Button>
            </div>

        </div>


        {tabContentItems}
    </Tabs>
}