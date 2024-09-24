import { ChangeEvent, useState, KeyboardEvent, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Button } from "../button";
import { Input } from "../input";
import { useImmer } from "use-immer";
import Variable from "@/lib/data/Variable";

interface VariableListProps {
    variables: Map<string, Variable>,
    onVariablesChange: (label: string, value: string) => void,
    onVariableDelete: (label: string) => void,
    onVariableAdd: (label: string, value: string) => void
}

export default function VariableList({ variables, onVariablesChange, onVariableDelete, onVariableAdd }: VariableListProps) {
    const variableListOverflowRef = useRef<HTMLDivElement>(null);
    
    const [labelToAdd, setLabelToAdd] = useState("");
    const [valueToAdd, setValueToAdd] = useState("");
    const [errors, setErrors] = useImmer({
        newLabel: Array<string>(),
        newValue: Array<string>()
    });

    function handleAddVariableInputKeyPress(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            handleAddVariable();
        }
    }

    function handleLabelToAddChange(e: ChangeEvent<HTMLInputElement>) {
        const newLabel = e.target.value;

        setLabelToAdd(newLabel);

        // Check if there is a duplicate
        if (variables.has(newLabel)) {
            setErrors((errors) => {
                errors.newLabel = ["Duplicate label."]
            });
        } else {
            setErrors((errors) => {
                errors.newLabel = []
            });
        }
    }

    function isAddVariableFormValid(): boolean {
        // Make sure that both fields contain a string
        if (labelToAdd.length == 0 || valueToAdd.length == 0) {
            return false
        };

        // Check if there are any errors
        if (Object.values(errors).find(value => value.length > 0) != undefined) return false;

        return true;
    }

    function handleAddVariable() {
        if (!isAddVariableFormValid()) return;

        onVariableAdd(labelToAdd, valueToAdd);

        setTimeout(() => {
            // Scroll to bottom of variable list
            if(variableListOverflowRef.current != null) {
                variableListOverflowRef.current.scrollTop = variableListOverflowRef.current.scrollHeight;
            }
        }, 0);
        
        setLabelToAdd("");
        setValueToAdd("");
    }

    const variableRows = Array.from(variables).map(([label, variable]) => {
        return <TableRow key={label}>
            <TableCell>
                <p className="break-words">{label}</p>
            </TableCell>
            <TableCell>
                {
                    variable.readOnly ? <p className="overflow-ellipsis overflow-hidden text-nowrap">{variable.value}</p> : (
                        <div className="flex">
                            <Input value={variable.value} onChange={(e) => { onVariablesChange(label, e.target.value) }} className="mr-2"></Input>
                            <Button variant="destructive" onClick={() => onVariableDelete(label)}><i className="bi bi-trash"></i></Button>
                        </div>
                    )
                }
            </TableCell>
        </TableRow>
    })

    return <div>
        <div ref={variableListOverflowRef} className="max-h-[280px] overflow-y-scroll">
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/3">Label</TableHead>
                        <TableHead className="w-2/3">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {variableRows}
                </TableBody>
            </Table>
        </div>
        <div className="dark:bg-slate-700">
            <div className="p-2">
                <div className="flex">
                    <div className="mr-2">
                        <Input placeholder="Label" value={labelToAdd} onChange={handleLabelToAddChange} />
                        <FormErrorList errors={errors.newLabel} />
                    </div>
                    <div className="flex flex-grow">
                        <Input placeholder="Value" value={valueToAdd} onKeyDown={handleAddVariableInputKeyPress} onChange={(e) => setValueToAdd(e.target.value)} className="mr-2" />
                        <Button onClick={handleAddVariable} disabled={!isAddVariableFormValid()}>Add Variable</Button>
                    </div>
                </div>
            </div>
            <p className="px-2 pb-2"><i className="bi bi-info-circle"></i> You can use variables in the editor below like this: $var</p>
        </div>
    </div>
}

interface FormErrorListProps {
    errors: string[]
}

function FormErrorList({ errors }: FormErrorListProps) {
    if (errors.length == 0) return;

    const errorListItems = errors.map(error => {
        return <li key={error}>{error}</li>
    })

    return <div>
        <ul className="text-red-700">
            {errorListItems}
        </ul>
    </div>
}