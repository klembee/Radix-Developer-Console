import {parser} from "./radix_manifest_parser"
import {LRLanguage} from "@codemirror/language"
import {foldNodeProp, foldInside, indentNodeProp} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import {completeFromList} from "@codemirror/autocomplete"
import {LanguageSupport} from "@codemirror/language"
import { manifestEnumFields, manifestInstructions, manifestObjects } from "./manifestInstructions"
import Variable from "@/lib/data/Variable"

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Method: t.className,
      Variable: t.variableName,
      String: t.string,
      Integer: t.number,
      Boolean: t.bool,
      EnumName: t.variableName,
      "Address Tuple Option Array Map Decimal Enum NonFungibleGlobalId NonFungibleLocalId": t.keyword,
      "Object/String": t.string,
      Comment: t.lineComment,
      Semicolon: t.separator,
      "( )": t.paren
    }),
    indentNodeProp.add({
      Application: context => context.column(context.node.from) + context.unit
    }),
    foldNodeProp.add({
      Application: foldInside
    })
  ]
})

export const manifestLanguage = LRLanguage.define({
  parser: parserWithMetadata
})

const autocompleteInstructionMap = manifestInstructions.map((instruction) => {
  return {label: instruction.title, type: "function", apply: instruction.replaceWith != null ? instruction.replaceWith : instruction.title}
})

const autocompleteObjectsMap = manifestObjects.map((object) => {
  return {label: object.title, type: "keyword", apply: object.replaceWith != null ? object.replaceWith : object.title}
})

const autocompleteEnumsMap = manifestEnumFields.map((enumName) => {
  return {label: enumName, type: "enum"}
})

function autocompletion(variables: Map<string, Variable>) {
  const autocompleteVariablesMap = Array.from(variables).map(([label]) => {
    return {label: `$${label}`, type: "variable", apply: `$${label}`}
  });

  return manifestLanguage.data.of({
    autocomplete: completeFromList([
      ...autocompleteInstructionMap,
      ...autocompleteObjectsMap,
      ...autocompleteEnumsMap,
      ...autocompleteVariablesMap,
      {label: `Expression("ENTIRE_WORKTOP")`, type: "keyword"}
    ])
  })
}


export default function radixManifestLanguage(variables: Map<string, Variable>): LanguageSupport {
  return new LanguageSupport(manifestLanguage, [
    autocompletion(variables),
  ])
}
