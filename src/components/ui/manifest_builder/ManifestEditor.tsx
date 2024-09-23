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
import Manifest from '@/lib/data/Manifest';
import { Textarea } from '../textarea';


interface ManifestEditorProps {
    networkId: number,
    variables: Map<string, Variable>,
    manifest: Manifest,
    onContentChange: (content: string) => void,
}
export default function ManifestEditor({ networkId, manifest, variables, onContentChange }: ManifestEditorProps) {

    const { theme } = useTheme()
    const languageSupport = radixManifestLanguage(variables);

    return <div>
        <div className='mb-2'>
            <CodeMirror
                autoFocus={true}
                extensions={[languageSupport]}
                value={manifest.content}
                theme={theme == "light" ? "light" : "dark"}
                minHeight="100px"
                maxHeight="500px"
                placeholder="Start writing your manifest"
                onChange={manifest => onContentChange(manifest)} />
        </div>
    </div>
}