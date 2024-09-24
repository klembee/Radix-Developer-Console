// import CodeMirror, { ReactCodeMirrorRef, ViewUpdate } from '@uiw/react-codemirror';
import radixManifestLanguage, { manifestValidTypes } from "@/lib/manifests/language/RadixManifestLanguage";
import Variable from "@/lib/data/Variable";
import { useTheme } from 'next-themes';
import Manifest from '@/lib/data/Manifest';
import { useEffect } from 'react';
import { parser } from '@/lib/manifests/language/radix_manifest_parser';
import CodeMirror from '@uiw/react-codemirror';
import { linter, lintGutter, Diagnostic } from "@codemirror/lint"
import { manifestInstructions } from "@/lib/manifests/language/manifestInstructions";
import { RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import { replaceVariablesInString } from "@/lib/utils";

interface ManifestEditorProps {
    networkId: number,
    variables: Map<string, Variable>,
    manifest: Manifest,
    onContentChange: (content: string) => void,
}
export default function ManifestEditor({ networkId, manifest, variables, onContentChange }: ManifestEditorProps) {

    const { theme } = useTheme()
    const languageSupport = radixManifestLanguage(variables);

    const manifestLinter = function () {
        const diagnostics: Diagnostic[] = [];
        const topNode = parser.parse(manifest.content).topNode;

        const cursor = topNode.cursor();
        let numberOfErrorFound = 0;

        while (cursor.next(true)) {
            if (cursor.type.is("Comment")) continue;

            if (cursor.type.is("Address")) {
                const hasFirstChild = cursor.firstChild();

                if (!hasFirstChild || !cursor.type.is("StringLiteral")) {
                    diagnostics.push({
                        from: cursor.from,
                        to: cursor.to,
                        severity: "error",
                        message: "Address must be a String"
                    })
                    continue
                }

                // Validate Address
                const prefixes = ["account", "resource", "component", "package", "internal_vault"];
                const networkSpecifier = networkId == RadixNetwork.Mainnet ? "rdx1" : "tdx_2_1";

                const address = replaceVariablesInString(manifest.content.slice(cursor.from, cursor.to).replaceAll("\"", ""), variables);

                if (address.match(new RegExp(`(?:${prefixes.join("|")})_${networkSpecifier}\\w+`)) == null) {
                    diagnostics.push({
                        from: cursor.from,
                        to: cursor.to,
                        severity: "error",
                        message: `Invalid address ${address}`
                    })
                }
            } else if (cursor.type.is("Decimal")) {
                // Validate decimal
                const hasFirstChild = cursor.firstChild();

                if (!hasFirstChild || !cursor.type.is("StringLiteral")) {
                    diagnostics.push({
                        from: cursor.from,
                        to: cursor.to,
                        severity: "error",
                        message: "Decimal value must be enclosed in quotes"
                    })
                    continue
                }
            } else if (cursor.type.is("Array")) {
                const hasFirstChild = cursor.firstChild()
                const [typeFrom, typeTo] = [cursor.from, cursor.to]

                if ((!hasFirstChild || !cursor.type.is("ArrayType")) || (cursor.firstChild() && cursor.type.is("⚠"))) {
                    diagnostics.push({
                        from: cursor.from,
                        to: cursor.to,
                        severity: "error",
                        message: "Missing array type"
                    })
                    continue
                }

                const arrayType = manifest.content.slice(typeFrom, typeTo);
                if (!manifestValidTypes.includes(arrayType)) {
                    diagnostics.push({
                        from: typeFrom,
                        to: typeTo,
                        severity: "error",
                        message: "Invalid array type"
                    })
                }

            } else if (cursor.type.is("Map")) {
                const hasKeyTypeChild = cursor.firstChild()
                const [keyTypeFrom, keyTypeTo] = [cursor.from, cursor.to]

                if ((!hasKeyTypeChild || !cursor.type.is("MapKeyType"))) {
                    if (cursor.type.is("⚠")) {
                        continue
                    }

                    diagnostics.push({
                        from: keyTypeFrom,
                        to: keyTypeTo,
                        severity: "error",
                        message: "Missing key type"
                    })
                    continue
                }

                const hasValueType = cursor.nextSibling()
                const [valueTypeFrom, valueTypeTo] = [cursor.from, cursor.to]

                if ((!hasValueType || !cursor.type.is("MapValueType")) || (cursor.firstChild() && cursor.type.is("⚠"))) {
                    diagnostics.push({
                        from: valueTypeFrom,
                        to: valueTypeTo,
                        severity: "error",
                        message: "Missing value type"
                    })
                    continue
                }

                const keyType = manifest.content.slice(keyTypeFrom, keyTypeTo);
                const valueType = manifest.content.slice(valueTypeFrom, valueTypeTo);
                if (!manifestValidTypes.includes(keyType)) {
                    diagnostics.push({
                        from: keyTypeFrom,
                        to: keyTypeTo,
                        severity: "error",
                        message: "Invalid type"
                    })
                }
                if (!manifestValidTypes.includes(valueType)) {
                    diagnostics.push({
                        from: valueTypeFrom,
                        to: valueTypeTo,
                        severity: "error",
                        message: "Invalid type"
                    })
                }


            } else if (cursor.type.is("EnumName")) {
                const [enumNameFrom, enumNameTo] = [cursor.from, cursor.to]
                const hasFirstChild = cursor.firstChild();

                if (hasFirstChild || cursor.type.is("⚠")) {
                    diagnostics.push({
                        from: enumNameFrom,
                        to: enumNameTo,
                        severity: "error",
                        message: "Invalid enum name"
                    })
                    continue
                }
            }
            else if (cursor.type.is("⚠")) {
                if (numberOfErrorFound > 0) continue // Only display first error
                numberOfErrorFound++;

                diagnostics.push({
                    from: cursor.from,
                    to: cursor.to,
                    severity: "error",
                    message: "Invalid syntax"
                })
            }
        }

        for (const line of topNode.getChildren("Line")) {
            const instructionNode = line.firstChild;

            if (instructionNode == null || !instructionNode.type.is("Method")) {
                diagnostics.push({
                    from: line.from,
                    to: line.firstChild?.from || line.to,
                    severity: "error",
                    message: "Missing instruction"
                })
                continue;
            }

            const methodName = manifest.content.slice(instructionNode.from, instructionNode.to).replace(/\s/g, '')

            if (!manifestInstructions.map((instruction) => instruction.title).includes(methodName)) {
                // Invalid instruction
                diagnostics.push({
                    from: instructionNode.from,
                    to: instructionNode.to - 1,
                    severity: "error",
                    message: "Invalid instruction"
                });

                continue;
            }

            if (methodName == "CALL_METHOD" || methodName == "CALL_FUNCTION") {
                const entityType = methodName == "CALL_METHOD" ? "component" : "package";
                // Make sure second child is an address
                const argument1 = instructionNode.nextSibling;

                if (argument1 == null || !argument1.type.is("Address")) {
                    diagnostics.push({
                        from: argument1?.from || instructionNode.to,
                        to: argument1?.to || instructionNode.to,
                        severity: "error",
                        message: `The first argument of ${methodName} must be a ${entityType} address`
                    })
                    continue;
                }

                // Make sure second argument is a string literal (for the blueprint name)
                const argument2 = argument1.nextSibling;
                if (argument2 == null || !argument2.type.is("StringLiteral")) {
                    diagnostics.push({
                        from: argument2?.from || argument1.to,
                        to: argument2?.to || argument1.to,
                        severity: "error",
                        message: `The second argument of ${methodName} must be a String`
                    })
                    continue;
                }

                if (methodName == "CALL_FUNCTION") {
                    // Third argument must be a string for the function name
                    const argument3 = argument2.nextSibling;
                    if (argument3 == null || !argument3.type.is("StringLiteral")) {
                        diagnostics.push({
                            from: argument3?.from || argument2.to,
                            to: argument3?.to || argument2.to,
                            severity: "error",
                            message: `The third argument of CALL_FUNCTION must be a String`
                        })
                        continue;
                    }
                }

            }

            const hasSemiColon = line.getChild("Semicolon") != null

            if (!hasSemiColon) {
                // console.log(line.lastChild?.name)
                const shouldHaveSemicolonAtChar = line.lastChild?.prevSibling?.to;

                diagnostics.push({
                    from: shouldHaveSemicolonAtChar!,
                    to: shouldHaveSemicolonAtChar!,
                    severity: "error",
                    message: "Missing semicolon",
                    // actions: [{
                    //     name: "Remove",
                    //     apply(view, from, to) { view.dispatch({ changes: { from, to } }) }
                    // }]
                })
            }
        }

        return diagnostics;
    }

    useEffect(() => {


    })

    function handleContentChange(manifest: string) {
        // Check for errors

        onContentChange(manifest)
    }

    return <div>
        <div className='mb-2 border'>
            <CodeMirror
                autoFocus={true}
                extensions={[languageSupport, lintGutter(), linter(manifestLinter)]}
                value={manifest.content}
                theme={theme == "light" ? "light" : "dark"}
                minHeight="100px"
                maxHeight="500px"
                placeholder="Start writing your manifest"
                onChange={(manifest) => handleContentChange(manifest)} />
        </div>
    </div>
}