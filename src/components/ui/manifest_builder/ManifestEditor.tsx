import CodeMirror from '@uiw/react-codemirror';
import radixManifestLanguage from "@/lib/manifests/language/RadixManifestLanguage";
import Variable from "@/lib/data/Variable";
import { useTheme } from 'next-themes';
import Manifest from '@/lib/data/Manifest';


interface ManifestEditorProps {
    variables: Map<string, Variable>,
    manifest: Manifest,
    onContentChange: (content: string) => void,
}
export default function ManifestEditor({ manifest, variables, onContentChange }: ManifestEditorProps) {

    const { theme } = useTheme()
    const languageSupport = radixManifestLanguage(variables);

    return <div>
        <div className='mb-2 border'>
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